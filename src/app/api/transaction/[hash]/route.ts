import { NextRequest } from "next/server";
import {
  createPublicClient,
  http,
  parseAbiItem,
  decodeEventLog,
  getEventSelector,
} from "viem";
import { CITREA_TESTNET } from "@/contracts/constants";

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

    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({ hash });

    // Parse CircleCreated event logs
    let circleId = undefined;

    if (receipt.logs && receipt.logs.length > 0) {
      // Look for CircleCreated event
      const circleCreatedEvent = parseAbiItem(
        "event CircleCreated(uint256 indexed circleId, address indexed owner, string name)"
      );

      // Get the event selector (topic0) for CircleCreated
      const circleCreatedSelector = getEventSelector(circleCreatedEvent);

      for (const log of receipt.logs) {
        try {
          // Check if this log matches our CircleCreated event
          if (log.topics[0] === circleCreatedSelector) {
            // Decode the event log
            const decodedLog = decodeEventLog({
              abi: [circleCreatedEvent],
              data: log.data,
              topics: log.topics,
            });

            // Extract circle ID from decoded args
            if (decodedLog.eventName === "CircleCreated" && decodedLog.args) {
              circleId = Number(decodedLog.args.circleId);
              break;
            }
          }
        } catch {
          // Continue to next log if parsing fails
          continue;
        }
      }
    }

    return Response.json({
      success: true,
      transactionHash: hash,
      circleId,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return Response.json(
      {
        error: "Failed to fetch transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
