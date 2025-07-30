import { prisma } from "@/lib/db";

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  daysUntilReset: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
}

export class StreakTracker {
  private userAddress: string;

  constructor(userAddress: string) {
    this.userAddress = userAddress.toLowerCase();
  }

  async calculateCurrentStreak(): Promise<StreakInfo> {
    // Get recent contribution activities (including recurring payments)
    const activities = await prisma.userActivity.findMany({
      where: {
        userAddress: this.userAddress,
        type: {
          in: ["contribution", "recurring_payment"],
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100, // Look at last 100 activities
    });

    if (activities.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        daysUntilReset: 1,
        weeklyGoalProgress: 0,
        monthlyGoalProgress: 0,
      };
    }

    // Calculate streak based on consecutive days with contributions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set<string>();
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      date.setHours(0, 0, 0, 0);
      activityDates.add(date.toISOString());
    });

    const sortedDates = Array.from(activityDates)
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check if user contributed today or yesterday (to maintain streak)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const hasContributedToday = sortedDates.some(
      (date) => date.getTime() === today.getTime()
    );
    const hasContributedYesterday = sortedDates.some(
      (date) => date.getTime() === yesterday.getTime()
    );

    if (hasContributedToday || hasContributedYesterday) {
      // Calculate current streak
      let checkDate = hasContributedToday ? today : yesterday;

      while (
        sortedDates.some((date) => date.getTime() === checkDate.getTime())
      ) {
        currentStreak++;
        checkDate = new Date(checkDate);
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate longest streak
    let i = 0;
    while (i < sortedDates.length) {
      tempStreak = 1;
      let currentDate = sortedDates[i];

      for (let j = i + 1; j < sortedDates.length; j++) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() - 1);

        if (sortedDates[j].getTime() === nextDate.getTime()) {
          tempStreak++;
          currentDate = sortedDates[j];
        } else {
          break;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      i += tempStreak;
    }

    // Calculate days until streak reset
    const daysUntilReset = hasContributedToday
      ? 1
      : hasContributedYesterday
      ? 0
      : -1;

    // Calculate weekly and monthly progress
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const weeklyContributions = activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= weekStart;
    }).length;

    const monthlyContributions = activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= monthStart;
    }).length;

    const weeklyGoalProgress = Math.min(weeklyContributions / 3, 1) * 100; // Goal: 3 per week
    const monthlyGoalProgress = Math.min(monthlyContributions / 12, 1) * 100; // Goal: 12 per month

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: activities.length > 0 ? activities[0].timestamp : null,
      daysUntilReset: Math.max(daysUntilReset, 0),
      weeklyGoalProgress,
      monthlyGoalProgress,
    };
  }

  async updateUserStreak(): Promise<StreakInfo> {
    const streakInfo = await this.calculateCurrentStreak();

    // Update user's streak information
    await prisma.user.upsert({
      where: { wallet: this.userAddress },
      create: {
        wallet: this.userAddress,
        email: `${this.userAddress}@grove.temp`,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        lastActivityDate: streakInfo.lastActivityDate,
      },
      update: {
        currentStreak: streakInfo.currentStreak,
        longestStreak: Math.max(
          streakInfo.longestStreak,
          streakInfo.currentStreak
        ),
        lastActivityDate: streakInfo.lastActivityDate,
      },
    });

    return streakInfo;
  }

  async recordContributionActivity(
    circleId: string,
    amount: string,
    txHash?: string,
    isRecurring = false
  ): Promise<void> {
    await prisma.userActivity.create({
      data: {
        userAddress: this.userAddress,
        type: isRecurring ? "recurring_payment" : "contribution",
        description: isRecurring
          ? `Automatic recurring payment of ${amount} satoshis`
          : `Contributed ${amount} satoshis`,
        metadata: JSON.stringify({
          circleId,
          amount,
          txHash,
          isRecurring,
        }),
      },
    });

    // Check for streak-based achievements
    const streakInfo = await this.updateUserStreak();
    await this.checkStreakAchievements(streakInfo);
  }

  private async checkStreakAchievements(streakInfo: StreakInfo): Promise<void> {
    const milestones = [
      {
        streak: 3,
        name: "Getting Started",
        description: "3 day contribution streak!",
      },
      {
        streak: 7,
        name: "Week Warrior",
        description: "7 day contribution streak!",
      },
      {
        streak: 14,
        name: "Two Week Champion",
        description: "14 day contribution streak!",
      },
      {
        streak: 30,
        name: "Monthly Master",
        description: "30 day contribution streak!",
      },
      {
        streak: 60,
        name: "Consistency King",
        description: "60 day contribution streak!",
      },
      {
        streak: 100,
        name: "Century Club",
        description: "100 day contribution streak!",
      },
    ];

    for (const milestone of milestones) {
      if (streakInfo.currentStreak === milestone.streak) {
        // Log achievement
        await prisma.userActivity.create({
          data: {
            userAddress: this.userAddress,
            type: "achievement_earned",
            description: `Earned achievement: ${milestone.name}`,
            metadata: JSON.stringify({
              achievementName: milestone.name,
              achievementDescription: milestone.description,
              streakLength: milestone.streak,
            }),
          },
        });
        break;
      }
    }
  }

  static async getLeaderboard(limit = 10): Promise<
    Array<{
      userAddress: string;
      currentStreak: number;
      longestStreak: number;
      totalContributions: number;
      lastActivityDate: Date | null;
    }>
  > {
    const users = await prisma.user.findMany({
      where: {
        currentStreak: {
          gt: 0,
        },
      },
      orderBy: [{ currentStreak: "desc" }, { longestStreak: "desc" }],
      take: limit,
      select: {
        wallet: true,
        currentStreak: true,
        longestStreak: true,
        totalContributions: true,
        lastActivityDate: true,
      },
    });

    return users.map((user) => ({
      userAddress: user.wallet,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalContributions: user.totalContributions,
      lastActivityDate: user.lastActivityDate,
    }));
  }
}
