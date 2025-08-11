import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const circleId = searchParams.get("circleId");

    if (!userAddress || !circleId) {
      return NextResponse.json(
        { error: "userAddress and circleId are required" },
        { status: 400 }
      );
    }

    // Get the user's actual contributions from completed payments
    const completedPayments = await prisma.recurringPayment.findMany({
      where: {
        userAddress: userAddress,
        circleId: circleId,
        status: "COMPLETED",
      },
      select: {
        amount: true,
      },
    });

    // Also check UserActivity for direct contributions
    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        userAddress: userAddress,
        type: {
          in: ["contribution", "recurring_payment"],
        },
        metadata: {
          contains: circleId, // Check if circleId is in metadata
        },
      },
      select: {
        metadata: true,
      },
    });

    let totalContributed = BigInt(0);

    // Sum up completed payments
    for (const payment of completedPayments) {
      totalContributed += BigInt(payment.amount);
    }

    // Sum up contributions from activity log
    for (const activity of contributionActivities) {
      try {
        const metadata = JSON.parse(activity.metadata || "{}");
        if (metadata.amount) {
          totalContributed += BigInt(metadata.amount);
        }
      } catch (error) {
        // Skip invalid JSON metadata
      }
    }

    return NextResponse.json({
      success: true,
      userAddress,
      circleId,
      totalContributed: totalContributed.toString(),
      contributionCount:
        completedPayments.length + contributionActivities.length,
    });
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch user contributions" },
      { status: 500 }
    );
  }
}
