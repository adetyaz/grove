import { NextRequest } from "next/server";
import {
  createPublicClient,
  http,
  parseAbiItem,
  decodeEventLog,
  getEventSelector,
} from "viem";
import { CITREA_TESTNET, GROVE_CONTRACT_ADDRESS } from "@/contracts/constants";
import { prisma } from "@/lib/db";

// Create a public client for reading blockchain data
const publicClient = createPublicClient({
  chain: CITREA_TESTNET,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash as `0x${string}`;
    const { searchParams } = new URL(request.url);
    const databaseCircleId = searchParams.get("databaseCircleId");

    let receipt;
    let attempts = 0;
    const maxAttempts = 5;
    const baseDelay = 2000;

    while (attempts < maxAttempts) {
      try {
        attempts++;

        receipt = await publicClient.getTransactionReceipt({ hash });

        break;
      } catch (error: any) {
        if (error.name === "TransactionReceiptNotFoundError") {
          if (attempts < maxAttempts) {
            const delay = baseDelay * Math.pow(1.5, attempts - 1); // Exponential backoff
            console.log(
              `⏳ Transaction not mined yet, waiting ${delay}ms before retry ${
                attempts + 1
              }/${maxAttempts}`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else {
            console.log(
              `❌ Transaction still not mined after ${maxAttempts} attempts`
            );
            return Response.json(
              {
                error: "Transaction not yet mined",
                details: `Transaction ${hash} has not been mined after ${maxAttempts} attempts. Please try again in a few moments.`,
                retry: true,
                hash,
              },
              { status: 202 }
            );
          }
        } else {
          throw error;
        }
      }
    }

    if (!receipt) {
      return Response.json(
        {
          error: "Could not get transaction receipt",
          details:
            "Failed to retrieve transaction receipt after multiple attempts",
          hash,
        },
        { status: 500 }
      );
    }

    console.log(`📄 Transaction receipt for ${hash}:`, {
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      logsCount: receipt.logs?.length || 0,
    });

    // Filter logs from Grove contract only
    const groveLogs =
      receipt.logs?.filter(
        (log) =>
          log.address.toLowerCase() === GROVE_CONTRACT_ADDRESS.toLowerCase()
      ) || [];

    console.log(`🏠 Grove contract logs:`, {
      groveContractAddress: GROVE_CONTRACT_ADDRESS,
      totalLogs: receipt.logs?.length || 0,
      groveLogsCount: groveLogs.length,
      allLogAddresses: receipt.logs?.map((log) => log.address) || [],
    });

    // Parse CircleCreated event logs
    let circleId = undefined;

    if (groveLogs.length > 0) {
      // Look for CircleCreated event - match exact signature from contract
      const circleCreatedEvent = parseAbiItem(
        "event CircleCreated(uint circleId, address owner, string name)"
      );

      // Get the event selector (topic0) for CircleCreated
      const circleCreatedSelector = getEventSelector(circleCreatedEvent);

      console.log(`🔍 Event signature info:`, {
        expectedSelector: circleCreatedSelector,
        contractSignature:
          "CircleCreated(uint circleId, address owner, string name)",
      });

      for (const log of groveLogs) {
        // Only process Grove contract logs
        console.log(`🔍 Processing Grove log:`, {
          address: log.address,
          topic0: log.topics[0],
          expectedTopic0: circleCreatedSelector,
          topicsMatch: log.topics[0] === circleCreatedSelector,
          topics: log.topics,
          data: log.data,
        });
        try {
          // Check if this log matches our CircleCreated event
          if (log.topics[0] === circleCreatedSelector) {
            console.log(`🎯 Found CircleCreated event in log:`, log);

            // Decode the event log
            const decodedLog = decodeEventLog({
              abi: [circleCreatedEvent],
              data: log.data,
              topics: log.topics,
            });

            console.log(`📝 Decoded event:`, decodedLog);

            // Extract circle ID from decoded args
            if (decodedLog.eventName === "CircleCreated" && decodedLog.args) {
              circleId = Number(decodedLog.args.circleId);
              console.log(`✅ Extracted circleId: ${circleId}`);
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Error parsing log:`, error);
          // Continue to next log if parsing fails
          continue;
        }
      }
    }

    // If we have a databaseCircleId, sync it with the contract
    if (databaseCircleId && circleId) {
      console.log(
        `🔄 Auto-syncing circle ${databaseCircleId} with onChainId ${circleId}`
      );

      try {
        // Simple direct sync - just update the onChainId in the database
        const updatedCircle = await prisma.circle.update({
          where: { id: databaseCircleId },
          data: {
            onChainId: Number(circleId),
            syncStatus: "SYNCED",
            transactionHash: hash,
          },
        });

        console.log(`✅ Successfully synced circle:`, {
          id: updatedCircle.id,
          onChainId: updatedCircle.onChainId,
          syncStatus: updatedCircle.syncStatus,
        });
      } catch (syncError) {
        console.error(`❌ Error syncing circle:`, syncError);
      }
    } else {
      console.log(`⚠️ Sync skipped:`, {
        databaseCircleId,
        circleId,
        reason: !databaseCircleId
          ? "No databaseCircleId"
          : "No circleId found in logs",
      });
    }

    return Response.json({
      success: true,
      transactionHash: hash,
      circleId,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      synced: !!databaseCircleId,
    });
  } catch (error: any) {
    console.error("Error fetching transaction:", error);

    // Handle specific error types
    if (error.name === "TransactionReceiptNotFoundError") {
      return Response.json(
        {
          error: "Transaction not yet mined",
          details: `Transaction ${params.hash} has not been mined yet. Please wait a moment and try again.`,
          retry: true,
          hash: params.hash,
        },
        { status: 202 } // 202 Accepted - processing but not complete
      );
    }

    return Response.json(
      {
        error: "Failed to fetch transaction",
        details: error instanceof Error ? error.message : "Unknown error",
        hash: params.hash,
      },
      { status: 500 }
    );
  }
}
