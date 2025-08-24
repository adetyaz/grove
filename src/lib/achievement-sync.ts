// Helper function to sync contribution with GroveAchievements contract
import { createWalletClient, custom, parseEther } from "viem";
import {
  ACHIEVEMENTS_CONTRACT_ADDRESS,
  ACHIEVEMENTS_ABI,
  CITREA_TESTNET,
} from "@/lib/contracts";

export async function syncContributionWithAchievements(
  userAddress: string,
  contributionAmount: string
) {
  try {
    // This would be called after a successful contribution
    // to track the contribution in the GroveAchievements contract

    if (typeof window !== "undefined" && window.ethereum) {
      const walletClient = createWalletClient({
        chain: CITREA_TESTNET,
        transport: custom(window.ethereum),
      });

      // Track contribution manually in GroveAchievements contract
      const amountWei = parseEther(contributionAmount);

      const hash = await walletClient.writeContract({
        address: ACHIEVEMENTS_CONTRACT_ADDRESS,
        abi: ACHIEVEMENTS_ABI,
        functionName: "manualTrackContribution",
        args: [userAddress as `0x${string}`, amountWei],
        account: userAddress as `0x${string}`,
      });

      console.log("✅ Contribution synced with achievements contract:", hash);
      return hash;
    }
  } catch (error) {
    console.warn("Failed to sync with achievements contract:", error);
    // Don't throw - this is supplementary functionality
    return null;
  }
}

export async function syncUserDataWithContract(
  userAddress: string,
  totalContributed: string
) {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const walletClient = createWalletClient({
        chain: CITREA_TESTNET,
        transport: custom(window.ethereum),
      });

      // Batch sync user data
      const amountWei = parseEther(totalContributed);

      const hash = await walletClient.writeContract({
        address: ACHIEVEMENTS_CONTRACT_ADDRESS,
        abi: ACHIEVEMENTS_ABI,
        functionName: "manualTrackContribution",
        args: [userAddress as `0x${string}`, amountWei],
        account: userAddress as `0x${string}`,
      });

      console.log("✅ User data synced with achievements contract:", hash);
      return hash;
    }
  } catch (error) {
    console.warn("Failed to sync user data with contract:", error);
    return null;
  }
}
