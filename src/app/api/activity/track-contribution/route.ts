import { NextRequest, NextResponse } from "next/server";
import { logUserActivity } from "@/lib/activity-logger";
import { StreakTracker } from "@/lib/streak-tracker";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userAddress,
      circleId,
      amount,
      txHash,
      circleName,
      isRecurring = false,
    } = body;

    if (!userAddress || !circleId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update user stats
    await prisma.user.upsert({
      where: { wallet: userAddress.toLowerCase() },
      update: {
        totalContributions: { increment: 1 },
        lastActivityDate: new Date(),
      },
      create: {
        wallet: userAddress.toLowerCase(),
        email: `${userAddress.toLowerCase()}@wallet.local`,
        totalContributions: 1,
        lastActivityDate: new Date(),
      },
    });

    const streakTracker = new StreakTracker(userAddress);
    await streakTracker.recordContributionActivity(
      circleId,
      amount,
      txHash,
      isRecurring
    );

    await logUserActivity(
      userAddress,
      isRecurring ? "recurring_payment" : "contribution",
      isRecurring
        ? `Automatic recurring payment of ${amount} satoshis to ${
            circleName || `Circle ${circleId}`
          }`
        : `Contributed ${amount} satoshis to ${
            circleName || `Circle ${circleId}`
          }`,
      {
        amount,
        circleName: circleName || `Circle ${circleId}`,
        circleId,
        txHash,
        isRecurring,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking contribution:", error);
    return NextResponse.json(
      { error: "Failed to track contribution" },
      { status: 500 }
    );
  }
}
