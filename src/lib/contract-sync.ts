import { createPublicClient, http } from "viem";
import {
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
  CITREA_TESTNET,
} from "@/contracts/constants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const publicClient = createPublicClient({
  chain: CITREA_TESTNET,
  transport: http(),
});

export class ContractSyncService {
  /**
   * Sync a circle from database to contract after successful blockchain transaction
   */
  static async syncCircleFromTransaction(
    transactionHash: string,
    databaseCircleId: string
  ) {
    try {
      console.log(
        `🔄 Syncing circle ${databaseCircleId} from transaction ${transactionHash}`
      );

      // Get transaction receipt to extract circle ID from events
      const receipt = await publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });

      // Parse CircleCreated event to get onChainId
      let onChainId: number | null = null;

      if (receipt.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          try {
            // Decode CircleCreated event
            const decoded = await publicClient.getLogs({
              address: GROVE_CONTRACT_ADDRESS,
              event: {
                type: "event",
                name: "CircleCreated",
                inputs: [
                  { name: "circleId", type: "uint256", indexed: true },
                  { name: "owner", type: "address", indexed: true },
                  { name: "name", type: "string", indexed: false },
                ],
              },
              blockHash: receipt.blockHash,
            });

            if (decoded.length > 0) {
              onChainId = Number(decoded[0].args.circleId);
              break;
            }
          } catch (error) {
            // Continue to next log
            continue;
          }
        }
      }

      if (onChainId) {
        // Update database with onChainId and sync status
        await prisma.circle.update({
          where: { id: databaseCircleId },
          data: {
            onChainId,
            contractAddress: GROVE_CONTRACT_ADDRESS,
            syncStatus: "SYNCED",
            transactionHash,
          },
        });

        console.log(
          `✅ Circle ${databaseCircleId} synced with onChainId ${onChainId}`
        );

        // Trigger circle synced notification
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "circle_synced",
                circleId: databaseCircleId,
              }),
            }
          );
        } catch (notificationError) {
          console.warn(
            "⚠️ Failed to send sync notification:",
            notificationError
          );
          // Don't fail the sync process for notification errors
        }

        return { success: true, onChainId };
      } else {
        // Mark as failed sync
        await prisma.circle.update({
          where: { id: databaseCircleId },
          data: {
            syncStatus: "FAILED",
            transactionHash,
          },
        });

        console.error(
          `❌ Failed to extract onChainId from transaction ${transactionHash}`
        );
        return {
          success: false,
          error: "Failed to extract circle ID from transaction",
        };
      }
    } catch (error) {
      console.error(`❌ Sync error for circle ${databaseCircleId}:`, error);

      // Mark as failed
      await prisma.circle.update({
        where: { id: databaseCircleId },
        data: { syncStatus: "FAILED" },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get onChainId for a database circle UUID
   */
  static async getOnChainId(databaseCircleId: string): Promise<number | null> {
    const circle = await prisma.circle.findUnique({
      where: { id: databaseCircleId },
      select: { onChainId: true, syncStatus: true },
    });

    if (!circle || circle.syncStatus !== "SYNCED") {
      return null;
    }

    return circle.onChainId;
  }

  /**
   * Get database UUID for an onChainId
   */
  static async getDatabaseId(onChainId: number): Promise<string | null> {
    const circle = await prisma.circle.findUnique({
      where: { onChainId },
      select: { id: true, syncStatus: true },
    });

    if (!circle || circle.syncStatus !== "SYNCED") {
      return null;
    }

    return circle.id;
  }

  /**
   * Verify contract and database are in sync for a circle
   */
  static async verifySync(databaseCircleId: string): Promise<boolean> {
    try {
      const circle = await prisma.circle.findUnique({
        where: { id: databaseCircleId },
        include: { owner: true },
      });

      if (!circle || !circle.onChainId) {
        return false;
      }

      // Check if circle exists on contract
      const contractCircle = await publicClient.readContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "circles",
        args: [BigInt(circle.onChainId)],
      });

      // Verify basic data matches
      const contractName = (contractCircle as any)[2]; // name is third element
      const contractOwner = (contractCircle as any)[1]; // owner is second element

      return (
        contractName === circle.name &&
        contractOwner.toLowerCase() === circle.owner.wallet.toLowerCase()
      );
    } catch (error) {
      console.error(
        `❌ Sync verification failed for ${databaseCircleId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Sync all unsynced circles (for migration/recovery)
   */
  static async syncAllPendingCircles() {
    const pendingCircles = await prisma.circle.findMany({
      where: {
        syncStatus: "PENDING",
        transactionHash: { not: null },
      },
    });

    console.log(`🔄 Found ${pendingCircles.length} pending circles to sync`);

    for (const circle of pendingCircles) {
      if (circle.transactionHash) {
        await this.syncCircleFromTransaction(circle.transactionHash, circle.id);
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Full consistency check between database and contract
   */
  static async fullConsistencyCheck() {
    console.log("🔍 Running full consistency check...");

    // Get all synced circles from database
    const dbCircles = await prisma.circle.findMany({
      where: { syncStatus: "SYNCED", onChainId: { not: null } },
      include: { owner: true },
    });

    // Get contract's next circle ID to know the range
    const nextCircleId = await publicClient.readContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "nextCircleId",
    });

    console.log(`📊 Database: ${dbCircles.length} synced circles`);
    console.log(`📊 Contract: ${Number(nextCircleId) - 1} circles`);

    // Check each database circle against contract
    const issues = [];
    for (const circle of dbCircles) {
      const isValid = await this.verifySync(circle.id);
      if (!isValid) {
        issues.push({
          databaseId: circle.id,
          onChainId: circle.onChainId,
          name: circle.name,
          issue: "Verification failed",
        });
      }
    }

    if (issues.length > 0) {
      console.error(`❌ Found ${issues.length} sync issues:`, issues);
    } else {
      console.log("✅ All circles are properly synced!");
    }

    return {
      totalDb: dbCircles.length,
      totalContract: Number(nextCircleId) - 1,
      issues,
    };
  }
}

export default ContractSyncService;
