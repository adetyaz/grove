import { NextRequest, NextResponse } from "next/server";
import { punishmentSystem } from "@/lib/punishment-system";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const circleId = searchParams.get("circleId");

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: "userAddress is required" },
        { status: 400 }
      );
    }

    const status = await punishmentSystem.getUserPunishmentHistory(
      userAddress,
      circleId || undefined
    );

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Failed to get punishment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get punishment status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userAddress, punishmentId, reason, evidence } =
      await request.json();

    if (!userAddress || !punishmentId || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Implement appeal submission when full punishment system is available
    // For now, log the appeal request
    console.log("Appeal submitted:", {
      userAddress,
      punishmentId,
      reason,
      evidence,
    });

    return NextResponse.json({
      success: true,
      message: "Appeal submitted successfully (logged for now)",
      appealId: `temp-${Date.now()}`,
    });
  } catch (error) {
    console.error("Failed to submit appeal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit appeal" },
      { status: 500 }
    );
  }
}
