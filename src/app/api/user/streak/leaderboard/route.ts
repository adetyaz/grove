import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get users with their stats, normalize wallet addresses to lowercase
    const allUsers = await prisma.user.findMany({
      select: {
        wallet: true,
        currentStreak: true,
        longestStreak: true,
        totalContributions: true,
        totalSaved: true,
        circlesCompleted: true,
      },
    });

    // Group by normalized wallet address to handle duplicates
    const userMap = new Map();
    allUsers.forEach(user => {
      const normalizedWallet = user.wallet.toLowerCase();
      if (!userMap.has(normalizedWallet)) {
        userMap.set(normalizedWallet, {
          ...user,
          wallet: normalizedWallet
        });
      }
    });

    const users = Array.from(userMap.values())
      .sort((a, b) => {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return parseFloat(b.totalContributions) - parseFloat(a.totalContributions);
      })
      .slice(0, limit);

    // Calculate additional stats from UserActivity and real database relationships
    const leaderboard = await Promise.all(
      users.map(async (user, index) => {
        const normalizedWallet = user.wallet.toLowerCase();

        // Get BTC contributions from UserActivity (convert from Wei)
        const contributions = await prisma.userActivity.findMany({
          where: {
            userAddress: {
              equals: normalizedWallet,
              mode: 'insensitive'
            },
            type: "contribution",
          },
        });

        let totalBTC = 0;
        contributions.forEach((activity) => {
          try {
            const metadata = JSON.parse(activity.metadata || "{}");
            if (metadata.amount) {
              // Convert from Wei to BTC
              const amountInWei = parseFloat(metadata.amount);
              const amountInBTC = amountInWei / Math.pow(10, 18);
              totalBTC += amountInBTC;
            }
          } catch (error) {
            console.error("Error parsing contribution metadata:", error);
          }
        });

        // Get active circles (unique circle IDs from contributions)
        const activeCircleIds = new Set();
        contributions.forEach((activity) => {
          try {
            const metadata = JSON.parse(activity.metadata || "{}");
            if (metadata.circleId) {
              activeCircleIds.add(metadata.circleId);
            }
          } catch (error) {
            console.error("Error parsing circle metadata:", error);
          }
        });

        const activeCirclesCount = activeCircleIds.size;

        // Get achievements from UserActivity
        const achievements = await prisma.userActivity.findMany({
          where: {
            userAddress: {
              equals: normalizedWallet,
              mode: 'insensitive'
            },
            type: "achievement_earned",
          },
        });

        // Simple score calculation with reasonable numbers
        const score =
          user.currentStreak * 10 +          // 10 points per streak day
          totalBTC * 1000 +                  // 1000 points per BTC (so 1 BTC = 1000 points)
          activeCirclesCount * 50 +          // 50 points per active circle
          achievements.length * 25;          // 25 points per achievement

        return {
          address: normalizedWallet,
          score: Math.round(score),
          rank: index + 1,
          totalContributions: parseFloat(totalBTC.toFixed(8)), // Keep precision but readable
          activeCircles: activeCirclesCount,
          achievements: achievements.length,
        };
      })
    );

    // Sort by score (since we added calculations that might change order)
    leaderboard.sort((a, b) => b.score - a.score);

    // Update ranks after sorting
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
