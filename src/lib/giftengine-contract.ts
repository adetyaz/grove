import {
  GIFTENGINE_CONTRACT_ADDRESS,
  GIFTENGINE_ABI,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";
import { type Address } from "viem";

export class GiftEngineContractService {
  private publicClient = getPublicClient();

  async gift(
    circleId: number,
    to: Address,
    message: string,
    amount: bigint,
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: GIFTENGINE_CONTRACT_ADDRESS,
      abi: GIFTENGINE_ABI,
      functionName: "gift",
      args: [BigInt(circleId), to, message],
      account,
      value: amount,
    });
  }

  async getGiftEvents(circleId: number): Promise<any[]> {
    // This would require an event indexer or The Graph in production
    // Placeholder for UI integration
    return [];
  }
}

export const giftEngineContract = new GiftEngineContractService();
