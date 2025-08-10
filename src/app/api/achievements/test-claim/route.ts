import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const {
      userAddress,
      achievementId,
      action = "simulate",
    } = await request.json();

    if (!userAddress || achievementId === undefined) {
      return NextResponse.json(
        {
          error: "Missing required parameters: userAddress and achievementId",
        },
        { status: 400 }
      );
    }

    console.log(
      `🧪 Test claim request for achievement ${achievementId} by ${userAddress}`
    );

    // Check if achievement was earned in database
    const earned = await prisma.userActivity.findFirst({
      where: {
        userAddress: userAddress.toLowerCase(),
        type: "achievement_earned",
        metadata: {
          contains: `"achievementId":${achievementId}`,
        },
      },
    });

    console.log(`🔍 Database check for achievement ${achievementId}:`, {
      userAddress,
      earnedRecord: earned ? "FOUND" : "NOT FOUND",
      searchQuery: {
        userAddress: userAddress.toLowerCase(),
        type: "achievement_earned",
        metadata: `contains "achievementId":${achievementId}`,
      },
    });

    if (!earned) {
      // Additional debug: check all achievement records for this user
      const allAchievements = await prisma.userActivity.findMany({
        where: {
          userAddress: userAddress.toLowerCase(),
          type: "achievement_earned",
        },
        select: {
          metadata: true,
          timestamp: true,
        },
      });

      console.log(`🔍 All achievements for ${userAddress}:`, allAchievements);

      // For test mode, let's be more lenient and check if we just ran a calculation
      const recentCalculation = await prisma.userActivity.findFirst({
        where: {
          userAddress: userAddress.toLowerCase(),
          type: "contribution",
          timestamp: {
            gte: new Date(Date.now() - 60000), // Within last minute
          },
        },
      });

      if (recentCalculation && action === "simulate") {
        // In test mode, if there was recent activity, simulate success
        console.log(`🧪 Test mode: Simulating success for recent activity`);
        return NextResponse.json({
          success: true,
          action: "simulated",
          achievementId,
          userAddress,
          message:
            "Test mode: Achievement claim simulated (recent activity found)",
          txHash: `test-simulation-${achievementId}-${Date.now()}`,
          debug: { recentCalculation: !!recentCalculation },
        });
      }

      return NextResponse.json({
        success: false,
        error: "Achievement not earned in database",
        achievementId,
        userAddress,
        debug: {
          earnedRecord: earned,
          allAchievements: allAchievements.length,
          searchedFor: `"achievementId":${achievementId}`,
        },
      });
    }

    if (action === "simulate") {
      // For testing, just return success without actually minting
      return NextResponse.json({
        success: true,
        action: "simulated",
        achievementId,
        userAddress,
        message: "Achievement claim simulated successfully",
        txHash: `test-simulation-${achievementId}-${Date.now()}`,
        earnedAt: earned.timestamp,
      });
    }

    // If action is "mint", we could attempt actual minting here
    // but for safety, we'll just simulate for now
    return NextResponse.json({
      success: true,
      action: "simulated",
      achievementId,
      userAddress,
      message: "Test mode: Achievement claim simulated",
      earnedAt: earned.timestamp,
    });
  } catch (error) {
    console.error("Error in test claim:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
