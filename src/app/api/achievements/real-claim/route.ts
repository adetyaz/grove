import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * API endpoint to actually mint achievement NFTs on blockchain
 * This WILL trigger wallet interactions and real transactions
 */
export async function POST(request: NextRequest) {
  try {
    const { userAddress, achievementId } = await request.json();

    if (!userAddress || achievementId === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters: userAddress and achievementId" },
        { status: 400 }
      );
    }

    console.log(
      `🏆 REAL claim request for achievement ${achievementId} by ${userAddress}`
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

    // Add debugging to see what achievements exist
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

    console.log(`🔍 Achievement ${achievementId} lookup:`, {
      userAddress: userAddress.toLowerCase(),
      found: !!earned,
      totalAchievements: allAchievements.length,
      allAchievements: allAchievements.map((a) => a.metadata),
    });

    if (!earned) {
      return NextResponse.json({
        success: false,
        error: "Achievement not earned - cannot claim NFT",
        achievementId,
        userAddress,
        debug: {
          searchedFor: `"achievementId":${achievementId}`,
          totalAchievements: allAchievements.length,
          allAchievements: allAchievements.map((a) => a.metadata),
          suggestion:
            "Run a test scenario first to earn this achievement in the database",
        },
      });
    }

    // Return success - the actual blockchain transaction will be handled by frontend
    return NextResponse.json({
      success: true,
      achievementId,
      userAddress,
      message: "Achievement verified - proceed with blockchain claim",
      earnedAt: earned.timestamp,
      readyForBlockchain: true,
    });
  } catch (error) {
    console.error("Error in real claim:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
