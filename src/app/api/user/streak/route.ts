// Enhanced Streak Tracking API with Recurring Payment Support
import { NextRequest, NextResponse } from "next/server";
import { StreakTracker } from "@/lib/streak-tracker";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter required" },
        { status: 400 }
      );
    }

    const streakTracker = new StreakTracker(address);
    const streakInfo = await streakTracker.updateUserStreak();

    return NextResponse.json(streakInfo);
  } catch (error) {
    console.error("Error fetching user streak:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint for manually recording activities (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, circleId, amount, isRecurring = false } = body;

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const streakTracker = new StreakTracker(address);
    await streakTracker.recordContributionActivity(
      circleId || "test-circle",
      amount || "1000000000000000000", // 1 BTC in wei
      undefined,
      isRecurring
    );

    const updatedStreak = await streakTracker.updateUserStreak();

    return NextResponse.json({
      success: true,
      streak: updatedStreak,
    });
  } catch (error) {
    console.error("Error recording activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
