import { type Address, type Hash } from "viem";
import { getPublicClient, getWalletClient } from "@/lib/clients";
import ACHIEVEMENT_NFT_ABI from "@/contracts/ABIs/AchievementNFT.json";

// AchievementNFT contract address - deployed on testnet
export const ACHIEVEMENT_NFT_ADDRESS =
  "0x30325a1fF2361F72059191aD4Cb97599442B3247" as Address;

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  exists: boolean;
}

export interface UserAchievement {
  achievementId: number;
  tokenId: number;
  name: string;
  description: string;
  icon: string;
}

export class AchievementNFTContractService {
  private publicClient = getPublicClient();

  /**
   * Claim an achievement NFT
   */
  async claimAchievement(
    achievementId: number,
    account: Address
  ): Promise<Hash> {
    const walletClient = await getWalletClient();

    const { request } = await this.publicClient.simulateContract({
      address: ACHIEVEMENT_NFT_ADDRESS,
      abi: ACHIEVEMENT_NFT_ABI,
      functionName: "claimAchievement",
      args: [BigInt(achievementId)],
      account,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Check if user has a specific achievement
   */
  async hasAchievement(
    userAddress: Address,
    achievementId: number
  ): Promise<boolean> {
    return (await this.publicClient.readContract({
      address: ACHIEVEMENT_NFT_ADDRESS,
      abi: ACHIEVEMENT_NFT_ABI,
      functionName: "hasAchievement",
      args: [userAddress, BigInt(achievementId)],
    })) as boolean;
  }

  /**
   * Get all achievement IDs for a user
   */
  async getUserAchievements(userAddress: Address): Promise<number[]> {
    const result = (await this.publicClient.readContract({
      address: ACHIEVEMENT_NFT_ADDRESS,
      abi: ACHIEVEMENT_NFT_ABI,
      functionName: "getUserAchievements",
      args: [userAddress],
    })) as bigint[];

    return result.map((id) => Number(id));
  }

  /**
   * Get achievement metadata
   */
  async getAchievementMetadata(achievementId: number): Promise<Achievement> {
    const result = (await this.publicClient.readContract({
      address: ACHIEVEMENT_NFT_ADDRESS,
      abi: ACHIEVEMENT_NFT_ABI,
      functionName: "getAchievementMetadata",
      args: [BigInt(achievementId)],
    })) as [string, string, string, boolean];

    const [name, description, icon, exists] = result;

    return {
      id: achievementId,
      name,
      description,
      icon,
      exists,
    };
  }

  /**
   * Get all user's achievements with metadata
   */
  async getUserAchievementsWithMetadata(
    userAddress: Address
  ): Promise<UserAchievement[]> {
    const achievementIds = await this.getUserAchievements(userAddress);

    const achievements = await Promise.all(
      achievementIds.map(async (id) => {
        const metadata = await this.getAchievementMetadata(id);
        return {
          achievementId: id,
          tokenId: 0, // We don't track individual token IDs in the UI
          name: metadata.name,
          description: metadata.description,
          icon: metadata.icon,
        };
      })
    );

    return achievements;
  }

  /**
   * Generate Farcaster cast text for achievement
   */
  generateFarcasterCast(achievement: Achievement): string {
    const shareText = `🏅 Just earned the "${achievement.name}" achievement in Grove! 🎉\n\n${achievement.description}\n\n💪 Building wealth one savings circle at a time.\n\n#Grove #Bitcoin #Savings #Achievement`;
    return shareText;
  }

  /**
   * Generate Farcaster share URL
   */
  generateFarcasterShareUrl(achievement: Achievement): string {
    const text = this.generateFarcasterCast(achievement);
    const encodedText = encodeURIComponent(text);
    return `https://warpcast.com/~/compose?text=${encodedText}`;
  }
}

// Export a singleton instance
export const achievementNFTContract = new AchievementNFTContractService();
