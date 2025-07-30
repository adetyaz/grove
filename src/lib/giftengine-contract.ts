import {
  GIFTENGINE_CONTRACT_ADDRESS,
  GIFTENGINE_ABI,
  CITREA_TESTNET,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";
import { createWalletClient, custom, formatEther, parseEther } from "viem";
import { type Address } from "viem";

export interface Gift {
  circleId: number;
  from: Address;
  to: Address;
  amount: bigint;
  message: string;
  timestamp: number;
  transactionHash: string;
}

export interface GiftParams {
  circleId: number;
  to: Address;
  amount: bigint;
  message: string;
}

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

  /**
   * Send a gift using the GiftEngine contract
   */
  async sendGift(params: GiftParams, senderAddress: Address) {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet connection found");
    }

    const walletClient = createWalletClient({
      chain: CITREA_TESTNET,
      transport: custom(window.ethereum),
    });

    // First simulate the transaction
    const { request } = await this.publicClient.simulateContract({
      address: GIFTENGINE_CONTRACT_ADDRESS,
      abi: GIFTENGINE_ABI,
      functionName: "gift",
      args: [BigInt(params.circleId), params.to, params.message],
      value: params.amount,
      account: senderAddress,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
    });

    return {
      hash,
      receipt,
      gift: {
        circleId: params.circleId,
        from: senderAddress,
        to: params.to,
        amount: params.amount,
        message: params.message,
        timestamp: Date.now(),
        transactionHash: hash,
      } as Gift,
    };
  }

  /**
   * Get gift events for a specific circle
   */
  async getCircleGifts(circleId: number, fromBlock?: bigint): Promise<Gift[]> {
    try {
      const logs = await this.publicClient.getLogs({
        address: GIFTENGINE_CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "Gifted",
          inputs: [
            { indexed: true, name: "circleId", type: "uint256" },
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "message", type: "string" },
          ],
        },
        args: {
          circleId: BigInt(circleId),
        },
        fromBlock: fromBlock || BigInt(0),
        toBlock: "latest",
      });

      const gifts: Gift[] = [];
      for (const log of logs) {
        const block = await this.publicClient.getBlock({
          blockHash: log.blockHash,
        });

        gifts.push({
          circleId: Number(log.args.circleId),
          from: log.args.from as Address,
          to: log.args.to as Address,
          amount: log.args.amount as bigint,
          message: log.args.message as string,
          timestamp: Number(block.timestamp) * 1000,
          transactionHash: log.transactionHash,
        });
      }

      return gifts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching circle gifts:", error);
      return [];
    }
  }

  /**
   * Get gifts sent by a specific user
   */
  async getUserSentGifts(
    userAddress: Address,
    fromBlock?: bigint
  ): Promise<Gift[]> {
    try {
      const logs = await this.publicClient.getLogs({
        address: GIFTENGINE_CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "Gifted",
          inputs: [
            { indexed: true, name: "circleId", type: "uint256" },
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "message", type: "string" },
          ],
        },
        args: {
          from: userAddress,
        },
        fromBlock: fromBlock || BigInt(0),
        toBlock: "latest",
      });

      const gifts: Gift[] = [];
      for (const log of logs) {
        const block = await this.publicClient.getBlock({
          blockHash: log.blockHash,
        });

        gifts.push({
          circleId: Number(log.args.circleId),
          from: log.args.from as Address,
          to: log.args.to as Address,
          amount: log.args.amount as bigint,
          message: log.args.message as string,
          timestamp: Number(block.timestamp) * 1000,
          transactionHash: log.transactionHash,
        });
      }

      return gifts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching user sent gifts:", error);
      return [];
    }
  }

  /**
   * Get gifts received by a specific user
   */
  async getUserReceivedGifts(
    userAddress: Address,
    fromBlock?: bigint
  ): Promise<Gift[]> {
    try {
      const logs = await this.publicClient.getLogs({
        address: GIFTENGINE_CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "Gifted",
          inputs: [
            { indexed: true, name: "circleId", type: "uint256" },
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "message", type: "string" },
          ],
        },
        args: {
          to: userAddress,
        },
        fromBlock: fromBlock || BigInt(0),
        toBlock: "latest",
      });

      const gifts: Gift[] = [];
      for (const log of logs) {
        const block = await this.publicClient.getBlock({
          blockHash: log.blockHash,
        });

        gifts.push({
          circleId: Number(log.args.circleId),
          from: log.args.from as Address,
          to: log.args.to as Address,
          amount: log.args.amount as bigint,
          message: log.args.message as string,
          timestamp: Number(block.timestamp) * 1000,
          transactionHash: log.transactionHash,
        });
      }

      return gifts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching user received gifts:", error);
      return [];
    }
  }

  async getGiftEvents(circleId: number): Promise<Gift[]> {
    return await this.getCircleGifts(circleId);
  }

  /**
   * Format gift amount for display
   */
  formatGiftAmount(amount: bigint): string {
    return formatEther(amount);
  }

  /**
   * Parse gift amount from string input
   */
  parseGiftAmount(amount: string): bigint {
    return parseEther(amount);
  }
}

export const giftEngineContract = new GiftEngineContractService();

// Helper functions
export function formatGiftAmount(amount: bigint): string {
  return giftEngineContract.formatGiftAmount(amount);
}

export function parseGiftAmount(amount: string): bigint {
  return giftEngineContract.parseGiftAmount(amount);
}
