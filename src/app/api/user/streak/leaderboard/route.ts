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

        // Get BTC contributions from UserActivity (use actual amounts)
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
              // Use the actual amount as stored (no conversion)
              const amount = parseFloat(metadata.amount);
              // Only convert if it's clearly in Wei (very large number)
              if (amount > 1000000) {
                // Convert from Wei to BTC
                totalBTC += amount / Math.pow(10, 18);
              } else {
                // Use as-is (already in BTC)
                totalBTC += amount;
              }
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

        // Simple score calculation with very reasonable numbers (max ~100 points)
        const score =
          user.currentStreak * 2 +           // 2 points per streak day (max ~60 for 30 days)
          totalBTC * 10 +                    // 10 points per BTC (so 0.01 BTC = 0.1 points)
          activeCirclesCount * 5 +           // 5 points per active circle
          achievements.length * 3;           // 3 points per achievement

        return {
          address: normalizedWallet,
          score: Math.round(score),
          rank: index + 1,
          totalContributions: parseFloat(totalBTC.toFixed(6)), // Show 6 decimal places for BTC
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
