// Phase 3: Leaderboard API
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
  GROVE_ACHIEVEMENTS_ABI,
} from "@/contracts/constants";
import { createPublicClient, http } from "viem";
import { CITREA_TESTNET } from "@/contracts/constants";

// Create viem client for blockchain data
const publicClient = createPublicClient({
  chain: CITREA_TESTNET,
  transport: http(),
});

export async function GET() {
  try {
    // Get all users with streak and activity data
    const users = await prisma.user.findMany({
      select: {
        wallet: true,
        currentStreak: true,
        longestStreak: true,
        totalContributions: true,
        totalSaved: true,
      },
      where: {
        totalContributions: { gt: 0 },
      },
    });

    // Get blockchain achievement data for each user
    const usersWithAchievements = await Promise.all(
      users.map(async (user) => {
        try {
          // Get user stats from GroveAchievements contract
          const stats = await publicClient.readContract({
            address: GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
            abi: GROVE_ACHIEVEMENTS_ABI,
            functionName: "getUserStats",
            args: [user.wallet as `0x${string}`],
          });

          const [totalContributed, circleCount, achievements] = stats as [
            bigint,
            bigint,
            bigint[]
          ];

          return {
            address: user.wallet,
            totalContributed: totalContributed.toString(),
            circleCount: Number(circleCount),
            achievements: achievements.map((a) => Number(a)),
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalContributions: user.totalContributions,
            rank: 0, // Will be calculated
          };
        } catch (error) {
          console.warn(
            `Error fetching blockchain data for ${user.wallet}:`,
            error
          );
          return {
            address: user.wallet,
            totalContributed: user.totalSaved || "0",
            circleCount: 0,
            achievements: [],
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalContributions: user.totalContributions,
            rank: 0,
          };
        }
      })
    );

    // Sort and rank users by different criteria

    // Top Contributors (by total BTC contributed)
    const contributors = [...usersWithAchievements]
      .sort((a, b) =>
        BigInt(b.totalContributed) > BigInt(a.totalContributed) ? 1 : -1
      )
      .map((user, index) => ({ ...user, rank: index + 1 }));

    // Streak Leaders (by current streak)
    const streakLeaders = [...usersWithAchievements]
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    // Achievement Leaders (by number of achievements)
    const achievementLeaders = [...usersWithAchievements]
      .sort((a, b) => b.achievements.length - a.achievements.length)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return NextResponse.json({
      contributors: contributors.slice(0, 20), // Top 20
      streakLeaders: streakLeaders.slice(0, 20),
      achievementLeaders: achievementLeaders.slice(0, 20),
      totalUsers: usersWithAchievements.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
