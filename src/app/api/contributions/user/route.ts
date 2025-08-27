import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const circleId = searchParams.get("circleId");

    if (!userAddress || !circleId) {
      return NextResponse.json(
        { error: "Missing userAddress or circleId" },
        { status: 400 }
      );
    }

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { wallet: userAddress },
    });

    if (!user) {
      return NextResponse.json({
        totalContributed: "0",
        contributionCount: 0,
      });
    }

    // Find the circle
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Get user contribution activities for this circle
    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        userAddress: userAddress,
        type: {
          in: ["contribution", "recurring_payment"],
        },
        OR: [
          {
            metadata: {
              contains: `"circleId":"${circleId}"`,
            },
          },
          {
            metadata: {
              contains: `"circleId": "${circleId}"`,
            },
          },
        ],
      },
      select: {
        metadata: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Calculate total contributed from activities metadata
    let totalContributed = 0;
    const contributions: any[] = [];

    contributionActivities.forEach((activity) => {
      try {
        const metadata = JSON.parse(activity.metadata || "{}");
        if (metadata.amount) {
          totalContributed += parseFloat(metadata.amount);
          contributions.push({
            amount: metadata.amount,
            date: activity.timestamp,
          });
        }
      } catch (error) {
        console.error("Error parsing contribution metadata:", error);
      }
    });

    return NextResponse.json({
      totalContributed: totalContributed.toString(),
      contributionCount: contributions.length,
      contributions: contributions,
    });
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user contributions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
