// Phase 2: Streak Tracking Hook
"use client";
import { useState, useEffect, useCallback } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  daysUntilStreakReset: number;
  loading: boolean;
  error: string | null;
}

export function useStreakTracking() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    daysUntilStreakReset: 0,
    loading: false,
    error: null,
  });

  // Fetch current streak data
  const fetchStreak = useCallback(async () => {
    if (!address) return;

    setStreakData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/user/streak?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch streak data");
      }

      const data = await response.json();
      setStreakData((prev) => ({
        ...prev,
        ...data,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching streak:", error);
      setStreakData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [address]);

  // Record activity and update streak
  const recordActivity = useCallback(
    async (activityType: string = "CONTRIBUTION") => {
      if (!address) return null;

      try {
        const response = await fetch("/api/user/streak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            activityType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to record activity");
        }

        const data = await response.json();

        // Update local state
        setStreakData((prev) => ({
          ...prev,
          currentStreak: data.currentStreak,
          longestStreak: Math.max(data.currentStreak, prev.longestStreak),
          lastActivityDate: new Date().toISOString(),
          daysUntilStreakReset: 2, // Reset timer
        }));

        return data;
      } catch (error) {
        console.error("Error recording activity:", error);
        return null;
      }
    },
    [address]
  );

  // Load streak data when address changes
  useEffect(() => {
    if (address) {
      fetchStreak();
    } else {
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        daysUntilStreakReset: 0,
        loading: false,
        error: null,
      });
    }
  }, [address, fetchStreak]);

  // Check if streak achievement should be awarded
  const checkStreakAchievement = useCallback(() => {
    return streakData.currentStreak >= 7;
  }, [streakData.currentStreak]);

  // Get streak status message
  const getStreakStatus = useCallback(() => {
    const { currentStreak, daysUntilStreakReset } = streakData;

    if (currentStreak === 0) {
      return "Start your streak by contributing to a circle!";
    }

    if (currentStreak >= 7) {
      return `🔥 Amazing! ${currentStreak}-day streak! You've earned the Consistency King achievement!`;
    }

    if (daysUntilStreakReset < 1) {
      return `⚠️ Your ${currentStreak}-day streak will reset soon! Contribute today to keep it alive.`;
    }

    return `🔥 ${currentStreak}-day streak! Keep it up! ${
      7 - currentStreak
    } more days for Consistency King achievement.`;
  }, [streakData]);

  return {
    // Data
    ...streakData,

    // Functions
    fetchStreak,
    recordActivity,
    checkStreakAchievement,
    getStreakStatus,

    // Computed values
    isStreakActive: streakData.currentStreak > 0,
    streakProgress: Math.min(streakData.currentStreak / 7, 1) * 100,
    daysToNextMilestone: Math.max(0, 7 - streakData.currentStreak),
  };
}
