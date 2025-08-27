import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
      include: {
        ownedCircles: true,
      },
    });

    // Calculate total contributions from UserActivity data
    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        userAddress: address.toLowerCase(),
        type: "contribution",
      },
    });

    let totalContributedSatoshis = BigInt(0);
    for (const activity of contributionActivities) {
      if (activity.metadata) {
        try {
          const metadata = JSON.parse(activity.metadata);
          const amount = metadata.amount || "0";

          // Handle both decimal strings and satoshi strings
          if (typeof amount === "string") {
            if (amount.includes(".")) {
              // Convert decimal to satoshis
              const numAmount = parseFloat(amount);
              totalContributedSatoshis += BigInt(
                Math.floor(numAmount * 100000000)
              );
            } else {
              // Already in satoshis
              totalContributedSatoshis += BigInt(amount);
            }
          } else if (typeof amount === "number") {
            // Convert from BTC to satoshis
            totalContributedSatoshis += BigInt(Math.floor(amount * 100000000));
          }
        } catch (error) {
          console.warn("Error parsing activity metadata:", error);
        }
      }
    }

    const circlesCount = user ? user.ownedCircles.length : 0;

    return NextResponse.json({
      address,
      name: user?.name || null,
      totalContributed: totalContributedSatoshis.toString(),
      circlesCount,
    });
  } catch (error) {
    console.error("Error fetching contributor data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
