import { NextRequest, NextResponse } from "next/server";
import { StreakTracker } from "@/lib/streak-tracker";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const leaderboard = await StreakTracker.getLeaderboard(limit);

    // Add ranking to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error("Error fetching streak leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak leaderboard" },
      { status: 500 }
    );
  }
}
