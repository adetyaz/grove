// Phase 3: Leaderboard API
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get all users who have made contributions from UserActivity
    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        type: "contribution",
      },
      select: {
        userAddress: true,
        metadata: true,
      },
    });

    // Group by user address and calculate totals
    const userContributions = new Map<string, bigint>();

    for (const activity of contributionActivities) {
      const userAddress = activity.userAddress.toLowerCase();

      if (activity.metadata) {
        try {
          const metadata = JSON.parse(activity.metadata);
          const amount = metadata.amount || "0";

          // Handle both decimal strings and satoshi strings
          let satoshis = BigInt(0);
          if (typeof amount === "string") {
            if (amount.includes(".")) {
              // Convert decimal to satoshis
              const numAmount = parseFloat(amount);
              satoshis = BigInt(Math.floor(numAmount * 100000000));
            } else {
              // Already in satoshis
              satoshis = BigInt(amount);
            }
          } else if (typeof amount === "number") {
            // Convert from BTC to satoshis
            satoshis = BigInt(Math.floor(amount * 100000000));
          }

          const currentTotal = userContributions.get(userAddress) || BigInt(0);
          userContributions.set(userAddress, currentTotal + satoshis);
        } catch (error) {
          console.warn("Error parsing activity metadata:", error);
        }
      }
    }

    // Get user details for each contributor
    const contributors = await Promise.all(
      Array.from(userContributions.entries()).map(
        async ([address, totalContributed]) => {
          const user = await prisma.user.findUnique({
            where: { wallet: address },
            include: {
              ownedCircles: true,
            },
          });

          const circlesCount = user ? user.ownedCircles.length : 0;

          return {
            address,
            name: user?.name || null,
            totalContributed: totalContributed.toString(),
            circlesCount,
          };
        }
      )
    );

    // Sort by total contributed (descending) and add ranks
    const sortedContributors = contributors
      .filter((contributor) => BigInt(contributor.totalContributed) > BigInt(0))
      .sort((a, b) => {
        const contributionDiff = Number(
          BigInt(b.totalContributed) - BigInt(a.totalContributed)
        );
        if (contributionDiff !== 0) return contributionDiff;
        return b.circlesCount - a.circlesCount;
      })
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1,
      }))
      .slice(0, 20); // Top 20

    return NextResponse.json({
      contributors: sortedContributors,
      totalContributors: contributors.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
