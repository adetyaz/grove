import { NextRequest, NextResponse } from "next/server";
import { parseEther } from "viem";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, contributionAmount, txHash } = await request.json();

    if (!userAddress || !contributionAmount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log(
      `🎯 Calculating achievements for ${userAddress}: ${contributionAmount} BTC`
    );

    // Get user's contribution history from database
    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        userAddress: userAddress,
        type: "contribution",
      },
      select: {
        metadata: true,
      },
    });

    // Calculate total contributed from activities
    let totalContributedWei = BigInt(0);
    let contributionCount = 0;

    for (const activity of contributionActivities) {
      if (activity.metadata) {
        try {
          const metadata = JSON.parse(activity.metadata);
          const amount = metadata.amount || "0";

          let satoshis = BigInt(0);
          if (typeof amount === "string") {
            if (amount.includes(".")) {
              const numAmount = parseFloat(amount);
              satoshis = BigInt(Math.floor(numAmount * 1e18));
            } else {
              satoshis = BigInt(amount);
            }
          } else if (typeof amount === "number") {
            satoshis = BigInt(Math.floor(amount * 1e18));
          }

          totalContributedWei += satoshis;
          contributionCount++;
        } catch (error) {
          console.warn("Error parsing activity metadata:", error);
        }
      }
    }

    // Add current contribution
    const currentContributionWei = parseEther(contributionAmount);
    totalContributedWei += currentContributionWei;
    contributionCount++;

    // Convert to BTC decimal for comparison
    const totalContributedBTC = Number(totalContributedWei) / 1e18;

    // Get user's circle participation data
    const user = await prisma.user.findUnique({
      where: { wallet: userAddress },
      include: {
        ownedCircles: true,
        memberCircles: true,
      },
    });

    const totalCircles = user
      ? user.ownedCircles.length + user.memberCircles.length
      : 0;

    // Get user's streak data
    const currentStreak = user?.currentStreak || 0;
    const longestStreak = user?.longestStreak || 0;

    // Get user's invitation count
    const invitationCount = await prisma.circleInvitation.count({
      where: {
        inviterEmail: `${userAddress}@test.com`, // Using proper email format for test invitations
        status: "ACCEPTED", // Use uppercase to match schema
      },
    });

    // Get existing achievements to avoid duplicates
    const existingAchievements = await prisma.userActivity.findMany({
      where: {
        userAddress: userAddress,
        type: "achievement_earned",
      },
      select: {
        metadata: true,
      },
    });

    const earnedAchievementIds = new Set();
    for (const existing of existingAchievements) {
      if (existing.metadata) {
        try {
          const metadata = JSON.parse(existing.metadata);
          if (metadata.achievementId !== undefined) {
            earnedAchievementIds.add(metadata.achievementId);
          }
        } catch (error) {
          console.warn("Error parsing achievement metadata:", error);
        }
      }
    }

    // Check which achievements should be earned (only new ones)
    const achievements = [];

    console.log(`📊 Debug Info:`, {
      contributionActivities: contributionActivities.length,
      totalContributedBTC,
      contributionCount,
      totalCircles,
      currentStreak,
      longestStreak,
      invitationCount,
      earnedAchievementIds: Array.from(earnedAchievementIds),
    });

    // Achievement 0: First Steps - First contribution
    if (contributionCount === 1 && !earnedAchievementIds.has(0)) {
      achievements.push({
        id: 0,
        name: "First Steps",
        description: "Made your first contribution to a savings circle",
        icon: "🌱",
      });
    }

    // Achievement 1: Penny Saver - 0.001 BTC milestone
    if (totalContributedBTC >= 0.001 && !earnedAchievementIds.has(1)) {
      achievements.push({
        id: 1,
        name: "Penny Saver",
        description: "Contributed 0.001 BTC total",
        icon: "🪙",
      });
    }

    // Achievement 2: Serious Saver - 0.01 BTC milestone
    if (totalContributedBTC >= 0.01 && !earnedAchievementIds.has(2)) {
      achievements.push({
        id: 2,
        name: "Serious Saver",
        description: "Contributed 0.01 BTC total",
        icon: "💰",
      });
    }

    // Achievement 3: Goal Crusher - Circle participation
    if (totalCircles > 0 && !earnedAchievementIds.has(3)) {
      achievements.push({
        id: 3,
        name: "Goal Crusher",
        description: "Participated in a savings circle",
        icon: "🎯",
      });
    }

    // Achievement 4: Consistency King - 7-day streak or multiple contributions
    if (
      (longestStreak >= 7 || contributionCount >= 3) &&
      !earnedAchievementIds.has(4)
    ) {
      achievements.push({
        id: 4,
        name: "Consistency King",
        description: "Made regular contributions or maintained a streak",
        icon: "🔥",
      });
    }

    // Achievement 5: Circle Builder - 5+ invitations accepted
    if (invitationCount >= 5 && !earnedAchievementIds.has(5)) {
      achievements.push({
        id: 5,
        name: "Circle Builder",
        description: "Invited 5 or more members to circles",
        icon: "🦋",
      });
    }

    // Store earned achievements in database for frontend to display
    for (const achievement of achievements) {
      try {
        await prisma.userActivity.create({
          data: {
            userAddress: userAddress,
            type: "achievement_earned",
            description: `Earned achievement: ${achievement.name}`,
            metadata: JSON.stringify({
              achievementId: achievement.id,
              achievementName: achievement.name,
              achievementDescription: achievement.description,
              achievementIcon: achievement.icon,
              txHash,
              earnedAt: new Date().toISOString(),
              totalContributedBTC,
              contributionCount,
              totalCircles,
              currentStreak,
              invitationCount,
            }),
          },
        });
      } catch {
        // Ignore duplicate achievement entries
        console.warn(
          `Achievement ${achievement.id} may already exist for user`
        );
      }
    }

    const response = {
      success: true,
      message: "Achievements calculated and tracked",
      userAddress,
      totalContributedBTC: totalContributedBTC.toFixed(8),
      contributionCount,
      totalCircles,
      currentStreak,
      longestStreak,
      invitationCount,
      achievementsEarned: achievements.length,
      achievements,
      claimableAchievements: achievements.map((a) => a.id), // For contract claiming
    };

    console.log(`🎉 Achievement response:`, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error calculating achievements:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
