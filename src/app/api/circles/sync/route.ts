import { NextRequest } from "next/server";
import ContractSyncService from "@/lib/contract-sync";

export async function POST(req: NextRequest) {
  try {
    const { transactionHash, databaseCircleId } = await req.json();

    if (!transactionHash || !databaseCircleId) {
      return Response.json(
        { error: "Missing transactionHash or databaseCircleId" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Syncing circle ${databaseCircleId} from transaction ${transactionHash}`
    );

    const result = await ContractSyncService.syncCircleFromTransaction(
      transactionHash,
      databaseCircleId
    );

    if (result.success) {
      return Response.json({
        success: true,
        onChainId: result.onChainId,
        message: "Circle synced successfully",
      });
    } else {
      return Response.json(
        { error: result.error || "Sync failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Sync API error:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for sync status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const databaseCircleId = searchParams.get("databaseCircleId");
    const action = searchParams.get("action");

    if (action === "consistency-check") {
      const result = await ContractSyncService.fullConsistencyCheck();
      return Response.json(result);
    }

    if (action === "sync-pending") {
      await ContractSyncService.syncAllPendingCircles();
      return Response.json({
        success: true,
        message: "Pending circles synced",
      });
    }

    if (databaseCircleId) {
      const onChainId =
        await ContractSyncService.getOnChainId(databaseCircleId);
      const isValid = await ContractSyncService.verifySync(databaseCircleId);

      return Response.json({
        databaseCircleId,
        onChainId,
        isValid,
        synced: onChainId !== null,
      });
    }

    return Response.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Sync status error:", error);
    return Response.json(
      { error: "Failed to check sync status" },
      { status: 500 }
    );
  }
}
