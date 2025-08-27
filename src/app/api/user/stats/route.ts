import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Get user's profile and statistics
    const user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
      include: {
        ownedCircles: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        totalContributed: "0",
        totalContributions: 0,
        circlesCompleted: 0,
        currentStreak: 0,
        invitedMembers: 0,
        activeCircles: 0,
      });
    }

    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        userAddress: address.toLowerCase(),
        type: "contribution",
      },
      select: {
        metadata: true,
      },
    });

    let totalContributed = BigInt(0);
    for (const activity of contributionActivities) {
      if (activity.metadata) {
        try {
          const metadata = JSON.parse(activity.metadata);
          const amount = metadata.amount || "0";

          let satoshis = BigInt(0);
          if (typeof amount === "string") {
            if (amount.includes(".")) {
              const numAmount = parseFloat(amount);
              satoshis = BigInt(Math.floor(numAmount * 100000000));
            } else {
              satoshis = BigInt(amount);
            }
          } else if (typeof amount === "number") {
            satoshis = BigInt(Math.floor(amount * 100000000));
          }

          totalContributed += satoshis;
        } catch (error) {
          console.warn("Error parsing activity metadata:", error);
        }
      }
    }

    const totalCircles = user.ownedCircles.length; // Note: memberCircles not implemented yet
    const activeCircles = totalCircles;

    const currentStreak = Math.min(activeCircles, 7);

    const invitedMembers = await prisma.circleInvitation.count({
      where: {
        inviterWallet: user.wallet,
        status: "ACCEPTED",
      },
    });

    return NextResponse.json({
      totalContributed: totalContributed.toString(),
      totalContributions: contributionActivities.length,
      circlesCompleted: totalCircles, // For now, considering all circles as "completed"
      currentStreak,
      invitedMembers,
      activeCircles,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
