"use client";
import { useReadContract, useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
  GROVE_ACHIEVEMENTS_ABI,
} from "@/contracts/constants";
import { useCallback, useMemo } from "react";
import { groveToast } from "@/lib/toast";

// Achievement types matching the smart contract
export enum AchievementType {
  FIRST_CONTRIBUTION = 0,
  MILESTONE_001_BTC = 1,
  MILESTONE_01_BTC = 2,
  CIRCLE_COMPLETED = 3,
  STREAK_7_DAYS = 4,
  SOCIAL_BUTTERFLY = 5, // Invited 5+ members
}

export interface Achievement {
  id: AchievementType;
  name: string;
  description: string;
  icon: string;
  threshold?: number;
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: AchievementType.FIRST_CONTRIBUTION,
    name: "First Steps",
    description: "Made your first contribution to a savings circle",
    icon: "🌱",
  },
  {
    id: AchievementType.MILESTONE_001_BTC,
    name: "Penny Saver",
    description: "Contributed 0.001 BTC total",
    icon: "🪙",
    threshold: 0.001,
  },
  {
    id: AchievementType.MILESTONE_01_BTC,
    name: "Serious Saver",
    description: "Contributed 0.01 BTC total",
    icon: "💰",
    threshold: 0.01,
  },
  {
    id: AchievementType.CIRCLE_COMPLETED,
    name: "Goal Crusher",
    description: "Completed a savings circle goal",
    icon: "🎯",
  },
  {
    id: AchievementType.STREAK_7_DAYS,
    name: "Consistency King",
    description: "Maintained a 7-day contribution streak",
    icon: "🔥",
    threshold: 7,
  },
  {
    id: AchievementType.SOCIAL_BUTTERFLY,
    name: "Circle Builder",
    description: "Invited 5 or more members to circles",
    icon: "🦋",
    threshold: 5,
  },
];

export function useAchievements() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const { writeContractAsync } = useWriteContract();

  // Get user's earned achievements from GroveAchievements contract
  const {
    data: userStats,
    isLoading: loadingAchievements,
    refetch: refetchAchievements,
  } = useReadContract({
    address: GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
    abi: GROVE_ACHIEVEMENTS_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  });

  // Extract achievements from user stats
  const userAchievements =
    userStats && Array.isArray(userStats) ? userStats[2] : undefined;

  // Check if user has a specific achievement
  const hasAchievement = useCallback(
    (achievementId: AchievementType): boolean => {
      if (!userAchievements || !Array.isArray(userAchievements)) return false;
      return userAchievements.includes(BigInt(achievementId));
    },
    [userAchievements]
  );

  // Get achievement progress/statistics from GroveAchievements
  const { data: achievementStats } = useReadContract({
    address: GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
    abi: GROVE_ACHIEVEMENTS_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  });

  // Mint achievement NFT through GroveAchievements contract
  const mintAchievement = useCallback(
    async (achievementId: AchievementType) => {
      if (!address) {
        groveToast.error("Please connect your wallet first");
        return false;
      }

      // Check if user already has this achievement
      if (hasAchievement(achievementId)) {
        groveToast.info("You already have this achievement!");
        return false;
      }

      try {
        groveToast.info("Minting achievement NFT...");

        const txHash = await writeContractAsync({
          address: GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
          abi: GROVE_ACHIEVEMENTS_ABI,
          functionName: "awardAchievement",
          args: [address, BigInt(achievementId)],
        });

        groveToast.transactionPending(txHash);

        // Wait for confirmation and refetch achievements
        setTimeout(() => {
          refetchAchievements();
        }, 5000);

        return true;
      } catch (error: any) {
        console.error("Failed to mint achievement:", error);
        groveToast.error(
          "Failed to mint achievement: " + (error.message || "Unknown error")
        );
        return false;
      }
    },
    [address, hasAchievement, writeContractAsync, refetchAchievements]
  );

  // Check and award achievements based on user activity
  const checkAndAwardAchievements = useCallback(
    async (userStats: {
      totalContributed: bigint;
      circlesCompleted: number;
      currentStreak: number;
      invitedMembers: number;
      isFirstContribution?: boolean;
    }) => {
      const newAchievements: AchievementType[] = [];

      // First contribution
      if (
        userStats.isFirstContribution &&
        !hasAchievement(AchievementType.FIRST_CONTRIBUTION)
      ) {
        newAchievements.push(AchievementType.FIRST_CONTRIBUTION);
      }

      // Contribution milestones
      const totalBTC = Number(userStats.totalContributed) / 1e18;
      if (
        totalBTC >= 0.001 &&
        !hasAchievement(AchievementType.MILESTONE_001_BTC)
      ) {
        newAchievements.push(AchievementType.MILESTONE_001_BTC);
      }
      if (
        totalBTC >= 0.01 &&
        !hasAchievement(AchievementType.MILESTONE_01_BTC)
      ) {
        newAchievements.push(AchievementType.MILESTONE_01_BTC);
      }

      // Circle completion
      if (
        userStats.circlesCompleted > 0 &&
        !hasAchievement(AchievementType.CIRCLE_COMPLETED)
      ) {
        newAchievements.push(AchievementType.CIRCLE_COMPLETED);
      }

      // Streak achievement
      if (
        userStats.currentStreak >= 7 &&
        !hasAchievement(AchievementType.STREAK_7_DAYS)
      ) {
        newAchievements.push(AchievementType.STREAK_7_DAYS);
      }

      // Social achievement
      if (
        userStats.invitedMembers >= 5 &&
        !hasAchievement(AchievementType.SOCIAL_BUTTERFLY)
      ) {
        newAchievements.push(AchievementType.SOCIAL_BUTTERFLY);
      }

      // Mint new achievements
      for (const achievementId of newAchievements) {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(
          (a) => a.id === achievementId
        );
        if (achievement) {
          groveToast.achievement(
            `${achievement.icon} Achievement Unlocked!`,
            `${achievement.name}: ${achievement.description}`
          );
          await mintAchievement(achievementId);
        }
      }

      return newAchievements;
    },
    [hasAchievement, mintAchievement]
  );

  // Get user's achievement progress
  const achievementProgress = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      ...achievement,
      earned: hasAchievement(achievement.id),
      progress: hasAchievement(achievement.id) ? 100 : 0, // Could be enhanced with partial progress
    }));
  }, [hasAchievement]);

  // Get total achievements count
  const achievementCount = useMemo(() => {
    if (!userAchievements || !Array.isArray(userAchievements)) return 0;
    return userAchievements.length;
  }, [userAchievements]);

  return {
    // Data
    userAchievements,
    achievementStats,
    achievementProgress,
    achievementCount,
    loadingAchievements,

    // Functions
    hasAchievement,
    mintAchievement,
    checkAndAwardAchievements,
    refetchAchievements,

    // Constants
    ACHIEVEMENT_DEFINITIONS,
  };
}
