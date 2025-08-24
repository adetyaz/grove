"use client";
import { useReadContract, useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  ACHIEVEMENTS_CONTRACT_ADDRESS,
  ACHIEVEMENTS_ABI,
} from "@/lib/contracts";
import { useCallback, useMemo } from "react";
import { groveToast } from "@/lib/toast";
import { useAchievementClaiming } from "@/hooks/useAchievementClaiming";

export enum AchievementType {
  FIRST_CONTRIBUTION = 0,
  MILESTONE_001_BTC = 1,
  MILESTONE_01_BTC = 2,
  CIRCLE_COMPLETED = 3,
  STREAK_7_DAYS = 4,
  SOCIAL_BUTTERFLY = 5,
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

  // Use the new achievement claiming functionality
  const {
    claimAchievement: claimAchievementNFT,
    claimMultipleAchievements,
    checkClaimableAchievements,
    isConnected,
  } = useAchievementClaiming();

  const {
    data: userStats,
    isLoading: loadingAchievements,
    refetch: refetchAchievements,
  } = useReadContract({
    address: ACHIEVEMENTS_CONTRACT_ADDRESS,
    abi: ACHIEVEMENTS_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 1000 * 60 * 5,
    },
  });

  const userAchievements =
    userStats && Array.isArray(userStats) ? userStats[2] : undefined;

  const hasAchievement = useCallback(
    (achievementId: AchievementType): boolean => {
      if (!userAchievements || !Array.isArray(userAchievements)) return false;
      return userAchievements.includes(BigInt(achievementId));
    },
    [userAchievements]
  );

  const { data: achievementStats } = useReadContract({
    address: ACHIEVEMENTS_CONTRACT_ADDRESS,
    abi: ACHIEVEMENTS_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 1000 * 60 * 2,
    },
  });

  const mintAchievement = useCallback(
    async (achievementId: AchievementType) => {
      if (!address) {
        groveToast.error("Please connect your wallet first");
        return false;
      }

      if (hasAchievement(achievementId)) {
        groveToast.info("You already have this achievement!");
        return false;
      }

      try {
        // Use the new claim functionality which handles the permissionless claiming
        await claimAchievementNFT(achievementId);

        // Refetch achievements after successful claim
        setTimeout(() => {
          refetchAchievements();
        }, 5000);

        return true;
      } catch (error: any) {
        console.error("Failed to claim achievement:", error);

        // Fallback to the old method if new claim fails
        try {
          groveToast.info("Trying alternative minting method...");

          let txHash;
          try {
            txHash = await writeContractAsync({
              address: ACHIEVEMENTS_CONTRACT_ADDRESS,
              abi: ACHIEVEMENTS_ABI,
              functionName: "claimAchievement",
              args: [BigInt(achievementId)],
            });
          } catch (claimError: any) {
            console.warn(
              "claimAchievement failed, trying awardAchievement:",
              claimError
            );
            txHash = await writeContractAsync({
              address: ACHIEVEMENTS_CONTRACT_ADDRESS,
              abi: ACHIEVEMENTS_ABI,
              functionName: "awardAchievement",
              args: [address, BigInt(achievementId)],
            });
          }

          groveToast.transactionPending(txHash);

          setTimeout(() => {
            refetchAchievements();
          }, 5000);

          return true;
        } catch (fallbackError: any) {
          console.error("Both claim methods failed:", fallbackError);
          groveToast.error(
            "Failed to mint achievement: " +
              (fallbackError.message || "Unknown error")
          );
          return false;
        }
      }
    },
    [
      address,
      hasAchievement,
      claimAchievementNFT,
      writeContractAsync,
      refetchAchievements,
    ]
  );

  const checkAndAwardAchievements = useCallback(
    async (userStats: {
      totalContributed: bigint;
      circlesCompleted: number;
      currentStreak: number;
      invitedMembers: number;
      isFirstContribution?: boolean;
    }) => {
      const newAchievements: AchievementType[] = [];

      if (
        userStats.isFirstContribution &&
        !hasAchievement(AchievementType.FIRST_CONTRIBUTION)
      ) {
        newAchievements.push(AchievementType.FIRST_CONTRIBUTION);
      }

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

      if (
        userStats.circlesCompleted > 0 &&
        !hasAchievement(AchievementType.CIRCLE_COMPLETED)
      ) {
        newAchievements.push(AchievementType.CIRCLE_COMPLETED);
      }

      if (
        userStats.currentStreak >= 7 &&
        !hasAchievement(AchievementType.STREAK_7_DAYS)
      ) {
        newAchievements.push(AchievementType.STREAK_7_DAYS);
      }

      if (
        userStats.invitedMembers >= 5 &&
        !hasAchievement(AchievementType.SOCIAL_BUTTERFLY)
      ) {
        newAchievements.push(AchievementType.SOCIAL_BUTTERFLY);
      }

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

  const achievementProgress = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      ...achievement,
      earned: hasAchievement(achievement.id),
      progress: hasAchievement(achievement.id) ? 100 : 0,
    }));
  }, [hasAchievement]);

  const achievementCount = useMemo(() => {
    if (!userAchievements || !Array.isArray(userAchievements)) return 0;
    return userAchievements.length;
  }, [userAchievements]);

  const syncContributions = useCallback(async () => {
    if (!address) {
      groveToast.error("Please connect your wallet first");
      return false;
    }

    try {
      groveToast.info("Syncing contributions with achievement contract...");

      // For now, we'll create a manual sync that reads user's contribution data
      // from the API and tries to update the contract
      const response = await fetch(`/api/user/stats?address=${address}`);
      const userStats = await response.json();

      if (userStats.totalContributed && userStats.totalContributed !== "0") {
        groveToast.info(
          `Found ${userStats.totalContributed} total contributions. Check achievements manually for now.`
        );
      } else {
        groveToast.info("No contributions found to sync");
      }

      return true;
    } catch (error: any) {
      console.error("Failed to sync contributions:", error);
      groveToast.error(
        "Failed to sync contributions: " + (error.message || "Unknown error")
      );
      return false;
    }
  }, [address]);

  return {
    userAchievements,
    achievementStats,
    achievementProgress,
    achievementCount,
    loadingAchievements,

    hasAchievement,
    mintAchievement,
    checkAndAwardAchievements,
    refetchAchievements,
    syncContributions,

    // New achievement claiming functionality
    claimAchievementNFT,
    claimMultipleAchievements,
    checkClaimableAchievements,

    ACHIEVEMENT_DEFINITIONS,
  };
}
