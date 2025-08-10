"use client";
import { useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
  GROVE_ACHIEVEMENTS_ABI,
} from "@/contracts/constants";
import { groveToast } from "@/lib/toast";
import { useCallback } from "react";

export function useAchievementClaiming() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const { writeContractAsync } = useWriteContract();

  const claimAchievement = useCallback(
    async (achievementId: number, testMode = false) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        console.log(`🏆 Claiming achievement ${achievementId}...`);

        // For test mode, try calling awardAchievement directly on the AchievementNFT contract
        if (testMode) {
          try {
            const txHash = await writeContractAsync({
              address: "0x785453Ec2bbbe87b5E5D19f91c810Be0D4704A14", // AchievementNFT contract
              abi: [
                {
                  inputs: [
                    { name: "to", type: "address" },
                    { name: "achievementId", type: "uint256" },
                  ],
                  name: "mintAchievement",
                  outputs: [],
                  stateMutability: "nonpayable",
                  type: "function",
                },
              ],
              functionName: "mintAchievement",
              args: [address as `0x${string}`, BigInt(achievementId)],
            });

            groveToast.success(
              `🧪 Test NFT minted directly! Transaction: ${txHash.slice(
                0,
                6
              )}...${txHash.slice(-4)}`,
              { autoClose: 8000 }
            );

            return txHash;
          } catch (testError: any) {
            console.log("Direct NFT minting failed:", testError.message);
            // Fall through to regular claim method
          }
        }

        const txHash = await writeContractAsync({
          address: GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS,
          abi: GROVE_ACHIEVEMENTS_ABI,
          functionName: "claimAchievement",
          args: [BigInt(achievementId)],
        });

        groveToast.success(
          `🎉 Achievement NFT claimed! Transaction: ${txHash.slice(
            0,
            6
          )}...${txHash.slice(-4)}`,
          { autoClose: 8000 }
        );

        return txHash;
      } catch (error: any) {
        const errorMessage =
          error?.message || error?.toString() || "Unknown error";

        if (errorMessage.includes("User rejected")) {
          groveToast.error("Transaction was cancelled by user");
          throw new Error("Transaction cancelled");
        } else if (errorMessage.includes("User already has this achievement")) {
          groveToast.error("You already have this achievement NFT");
          throw new Error("Achievement already claimed");
        } else if (errorMessage.includes("Achievement not earned")) {
          groveToast.error("You haven't earned this achievement yet");
          throw new Error("Achievement not earned");
        } else {
          groveToast.error(`Failed to claim achievement: ${errorMessage}`);
          throw error;
        }
      }
    },
    [address, writeContractAsync]
  );

  const claimMultipleAchievements = useCallback(
    async (achievementIds: number[], testMode = false) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const results = [];
      let succeeded = 0;
      let failed = 0;

      for (const achievementId of achievementIds) {
        try {
          const txHash = await claimAchievement(achievementId, testMode);
          results.push({ achievementId, success: true, txHash });
          succeeded++;

          // Small delay between claims to avoid potential issues
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          results.push({
            achievementId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      }

      if (succeeded > 0) {
        groveToast.success(
          `🎉 Successfully claimed ${succeeded} achievement${
            succeeded > 1 ? "s" : ""
          }!`,
          { autoClose: 8000 }
        );
      }

      if (failed > 0) {
        groveToast.error(
          `❌ Failed to claim ${failed} achievement${failed > 1 ? "s" : ""}`,
          { autoClose: 8000 }
        );
      }

      return results;
    },
    [address, claimAchievement]
  );

  const checkClaimableAchievements = useCallback(
    async (achievementIds: number[]) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        const response = await fetch("/api/achievements/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address,
            achievementIds,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error checking claimable achievements:", error);
        throw error;
      }
    },
    [address]
  );

  return {
    claimAchievement,
    claimMultipleAchievements,
    checkClaimableAchievements,
    isConnected: !!address,
    userAddress: address,
  };
}
