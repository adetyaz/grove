import {
  ACHIEVEMENTNFT_CONTRACT_ADDRESS,
  ACHIEVEMENTNFT_ABI,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";
import { type Address } from "viem";

export class AchievementNFTContractService {
  private publicClient = getPublicClient();

  async getAchievementsByUser(user: Address): Promise<bigint[]> {
    return (await this.publicClient.readContract({
      address: ACHIEVEMENTNFT_CONTRACT_ADDRESS,
      abi: ACHIEVEMENTNFT_ABI,
      functionName: "achievementsByUser",
      args: [user],
    })) as bigint[];
  }

  async mintAchievement(
    to: Address,
    achievementId: string,
    tokenURI: string,
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: ACHIEVEMENTNFT_CONTRACT_ADDRESS,
      abi: ACHIEVEMENTNFT_ABI,
      functionName: "mintAchievement",
      args: [to, achievementId, tokenURI],
      account,
    });
  }
}

export const achievementNFTContract = new AchievementNFTContractService();
