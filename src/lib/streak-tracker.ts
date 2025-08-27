import { prisma } from "@/lib/db";

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export class StreakTracker {
  private userAddress: string;

  constructor(userAddress: string) {
    this.userAddress = userAddress.toLowerCase();
  }

  async calculateCurrentStreak(): Promise<StreakInfo> {
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
      take: 100,
    });

    if (activities.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      };
    }

    // Group activities by date (ignore time)
    const activityDates = new Set<string>();
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toDateString();
      activityDates.add(date);
    });

    // Calculate current streak (consecutive days from today)
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check if there's activity today or yesterday to start the streak
    const todayStr = today.toDateString();
    const yesterdayStr = new Date(
      today.getTime() - 24 * 60 * 60 * 1000
    ).toDateString();

    if (activityDates.has(todayStr)) {
      currentStreak = 1;
      checkDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    } else if (activityDates.has(yesterdayStr)) {
      currentStreak = 1;
      checkDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    } else {
      currentStreak = 0;
    }

    // Continue checking consecutive days backwards
    while (currentStreak > 0) {
      const dateStr = checkDate.toDateString();
      if (activityDates.has(dateStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Calculate longest streak ever
    const sortedDates = Array.from(activityDates)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: activities[0]?.timestamp.toISOString() || null,
    };
  }

  async updateUserStreak(): Promise<StreakInfo> {
    const streakInfo = await this.calculateCurrentStreak();

    // Update user's streak in database
    await prisma.user.upsert({
      where: { wallet: this.userAddress },
      update: {
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        lastActivityDate: streakInfo.lastActivityDate
          ? new Date(streakInfo.lastActivityDate)
          : null,
      },
      create: {
        wallet: this.userAddress,
        email: `${this.userAddress}@temp.com`, // Temporary email
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        lastActivityDate: streakInfo.lastActivityDate
          ? new Date(streakInfo.lastActivityDate)
          : null,
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
    // Record activity using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "UserActivity" ("id", "userAddress", "type", "description", "metadata", "timestamp")
      VALUES (${this.generateId()}, ${this.userAddress}, ${
      isRecurring ? "recurring_payment" : "contribution"
    }, ${
      isRecurring
        ? `Automatic recurring payment of ${amount} satoshis`
        : `Contributed ${amount} satoshis`
    }, ${JSON.stringify({
      circleId,
      amount,
      txHash,
      isRecurring,
    })}, ${new Date()})
    `;

    // Check for streak-based achievements
    const streakInfo = await this.updateUserStreak();
    await this.checkStreakAchievements(streakInfo);
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
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
        // Log achievement using raw SQL
        await prisma.$executeRaw`
          INSERT INTO "UserActivity" ("id", "userAddress", "type", "description", "metadata", "timestamp")
          VALUES (${this.generateId()}, ${
          this.userAddress
        }, ${"achievement_earned"}, ${`Earned achievement: ${milestone.name}`}, ${JSON.stringify(
          {
            achievementName: milestone.name,
            achievementDescription: milestone.description,
            streakLength: milestone.streak,
          }
        )}, ${new Date()})
        `;
        break;
      }
    }
  }

  static async getLeaderboard(limit = 10): Promise<
    Array<{
      userAddress: string;
      currentStreak: number;
      longestStreak: number;
    }>
  > {
    const users = await prisma.user.findMany({
      select: {
        wallet: true,
        currentStreak: true,
        longestStreak: true,
      },
      orderBy: {
        currentStreak: "desc",
      },
      take: limit,
    });

    return users.map((user) => ({
      userAddress: user.wallet,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    }));
  }
}
