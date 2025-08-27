// Local storage-based activity and streak tracking
export interface UserActivity {
  id: string;
  userAddress: string;
  type: string;
  description?: string;
  metadata?: any;
  timestamp: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

class LocalActivityTracker {
  private getStorageKey(
    userAddress: string,
    type: "activities" | "streaks"
  ): string {
    return `grove_${type}_${userAddress.toLowerCase()}`;
  }

  private getGlobalStorageKey(): string {
    return "grove_global_activities";
  }

  // User-specific activities
  getUserActivities(userAddress: string): UserActivity[] {
    const key = this.getStorageKey(userAddress, "activities");
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  // Global activities (all users)
  getGlobalActivities(): UserActivity[] {
    const stored = localStorage.getItem(this.getGlobalStorageKey());
    return stored ? JSON.parse(stored) : [];
  }

  logActivity(
    userAddress: string,
    type: string,
    metadata?: any,
    description?: string
  ): void {
    const activity: UserActivity = {
      id: `${Date.now()}_${Math.random()}`,
      userAddress: userAddress.toLowerCase(),
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Add to user's activities
    const userActivities = this.getUserActivities(userAddress);
    userActivities.unshift(activity); // Add to beginning
    userActivities.splice(100); // Keep only last 100
    localStorage.setItem(
      this.getStorageKey(userAddress, "activities"),
      JSON.stringify(userActivities)
    );

    // Add to global activities
    const globalActivities = this.getGlobalActivities();
    globalActivities.unshift(activity);
    globalActivities.splice(200); // Keep only last 200 globally
    localStorage.setItem(
      this.getGlobalStorageKey(),
      JSON.stringify(globalActivities)
    );

    console.log(`Activity logged: ${type} for ${userAddress}`, metadata);
  }

  // Streak management
  getUserStreak(userAddress: string): StreakInfo {
    const key = this.getStorageKey(userAddress, "streaks");
    const stored = localStorage.getItem(key);
    return stored
      ? JSON.parse(stored)
      : {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
        };
  }

  updateStreak(userAddress: string): StreakInfo {
    const activities = this.getUserActivities(userAddress);
    const contributionActivities = activities.filter(
      (a) => a.type === "contribution" || a.type === "recurring_payment"
    );

    if (contributionActivities.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      };
    }

    // Calculate streak from activities
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    // Group activities by date
    const dateGroups = new Map<string, boolean>();
    for (const activity of contributionActivities) {
      const date = new Date(activity.timestamp).toDateString();
      dateGroups.set(date, true);
    }

    // Check consecutive days starting from today
    for (let i = 0; i <= 365; i++) {
      // Check up to a year back
      const checkDate = new Date(today.getTime() - i * oneDayMs);
      const dateStr = checkDate.toDateString();

      if (dateGroups.has(dateStr)) {
        if (
          i === 0 ||
          (lastDate && checkDate.getTime() === lastDate.getTime() - oneDayMs)
        ) {
          currentStreak = i === 0 ? 1 : currentStreak + 1;
          tempStreak++;
          lastDate = checkDate;
        } else {
          break; // Streak broken
        }
      } else if (i === 0) {
        break; // No activity today, streak is 0
      }
    }

    // Calculate longest streak from all activities
    const sortedDates = Array.from(dateGroups.keys()).sort();
    tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]).getTime();
        const currDate = new Date(sortedDates[i]).getTime();
        if (currDate - prevDate <= oneDayMs) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const streakInfo: StreakInfo = {
      currentStreak,
      longestStreak,
      lastActivityDate: contributionActivities[0]?.timestamp || null,
    };

    // Save streak info
    const key = this.getStorageKey(userAddress, "streaks");
    localStorage.setItem(key, JSON.stringify(streakInfo));

    return streakInfo;
  }

  // Helper methods for specific activity types
  logContribution(
    userAddress: string,
    circleName: string,
    circleId: string,
    amount: string,
    txHash?: string
  ): void {
    this.logActivity(
      userAddress,
      "contribution",
      {
        circleName,
        circleId,
        amount,
        txHash,
      },
      `Contributed ${amount} BTC to ${circleName}`
    );
  }

  logCircleCreation(
    userAddress: string,
    circleName: string,
    circleId: string
  ): void {
    this.logActivity(
      userAddress,
      "circle_created",
      {
        circleName,
        circleId,
      },
      `Created circle: ${circleName}`
    );
  }

  logCircleJoin(
    userAddress: string,
    circleName: string,
    circleId: string
  ): void {
    this.logActivity(
      userAddress,
      "circle_joined",
      {
        circleName,
        circleId,
      },
      `Joined circle: ${circleName}`
    );
  }

  logAchievement(
    userAddress: string,
    achievementName: string,
    achievementId: string
  ): void {
    this.logActivity(
      userAddress,
      "achievement_earned",
      {
        achievementName,
        achievementId,
      },
      `Earned achievement: ${achievementName}`
    );
  }

  logRecurringPayment(
    userAddress: string,
    circleName: string,
    circleId: string,
    amount: string
  ): void {
    this.logActivity(
      userAddress,
      "recurring_payment",
      {
        circleName,
        circleId,
        amount,
      },
      `Automatic payment of ${amount} BTC to ${circleName}`
    );
  }

  // Get activities for dashboard display
  getRecentActivities(
    userAddress?: string,
    limit: number = 10
  ): UserActivity[] {
    if (userAddress) {
      return this.getUserActivities(userAddress).slice(0, limit);
    }
    return this.getGlobalActivities().slice(0, limit);
  }

  // Get leaderboard data
  getLeaderboardData(): Array<{
    userAddress: string;
    contributionCount: number;
    totalAmount: number;
  }> {
    const globalActivities = this.getGlobalActivities();
    const userStats = new Map<
      string,
      { contributionCount: number; totalAmount: number }
    >();

    for (const activity of globalActivities) {
      if (
        activity.type === "contribution" ||
        activity.type === "recurring_payment"
      ) {
        const stats = userStats.get(activity.userAddress) || {
          contributionCount: 0,
          totalAmount: 0,
        };
        stats.contributionCount++;
        if (activity.metadata?.amount) {
          stats.totalAmount += parseFloat(activity.metadata.amount) || 0;
        }
        userStats.set(activity.userAddress, stats);
      }
    }

    return Array.from(userStats.entries())
      .map(([userAddress, stats]) => ({ userAddress, ...stats }))
      .sort((a, b) => b.contributionCount - a.contributionCount);
  }
}

export const localActivityTracker = new LocalActivityTracker();
