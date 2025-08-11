import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const circleId = params.id;

    // Get activities related to this circle from UserActivity
    const activities = await prisma.userActivity.findMany({
      where: {
        OR: [
          {
            metadata: {
              contains: `"circleId":"${circleId}"`,
            },
          },
          {
            description: {
              contains: circleId,
            },
          },
        ],
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 20, // Last 20 activities
    });

    const formattedActivities = activities.map((activity) => {
      let metadata = {};
      try {
        metadata = JSON.parse(activity.metadata || "{}");
      } catch {
        metadata = {};
      }

      return {
        id: activity.id,
        userAddress: activity.userAddress,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        txHash: (metadata as any).txHash,
        amount: (metadata as any).amount || (metadata as any).amountVoted,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
    });
  } catch (error: any) {
    console.error("Error fetching circle activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities", details: error.message },
      { status: 500 }
    );
  }
}
