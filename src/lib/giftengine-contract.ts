import {
  GIFTENGINE_CONTRACT_ADDRESS,
  GIFTENGINE_ABI,
  CITREA_TESTNET,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/clients";
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

export interface EscrowGift {
  circleId: number;
  sender: Address;
  recipient: Address;
  amount: bigint;
  message: string;
  claimed: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface GiftParams {
  circleId: number;
  to: Address;
  amount: bigint;
  message: string;
}

export interface EscrowGiftParams {
  circleId: number;
  recipient: Address;
  amount: bigint;
  message: string;
  expirationDays?: number;
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
   * Send a gift using the GiftEngine contract (immediate transfer)
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
   * Create an escrow gift that needs to be claimed
   */
  async createEscrowGift(params: EscrowGiftParams, senderAddress: Address) {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet connection found");
    }

    const walletClient = createWalletClient({
      chain: CITREA_TESTNET,
      transport: custom(window.ethereum),
    });

    const expirationDays = params.expirationDays || 30; // Default 30 days

    // First simulate the transaction
    const { request } = await this.publicClient.simulateContract({
      address: GIFTENGINE_CONTRACT_ADDRESS,
      abi: GIFTENGINE_ABI,
      functionName: "createEscrowGift",
      args: [
        BigInt(params.circleId),
        params.recipient,
        params.message,
        BigInt(expirationDays),
      ],
      value: params.amount,
      account: senderAddress,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
    });

    // Get the giftId from the transaction logs
    const log = receipt.logs.find(
      (log) => log.topics[0] === "0x" + "EscrowGiftCreated".padEnd(64, "0") // This should be the proper event signature
    );

    const giftId = log?.topics[1] || "0x";

    return {
      hash,
      receipt,
      giftId,
      escrowGift: {
        circleId: params.circleId,
        sender: senderAddress,
        recipient: params.recipient,
        amount: params.amount,
        message: params.message,
        claimed: false,
        createdAt: Date.now(),
        expiresAt: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
      } as EscrowGift,
    };
  }

  /**
   * Claim an escrow gift
   */
  async claimEscrowGift(giftId: string, recipientAddress: Address) {
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
      functionName: "claimEscrowGift",
      args: [giftId as `0x${string}`],
      account: recipientAddress,
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
    };
  }

  /**
   * Get escrow gift details
   */
  async getEscrowGift(giftId: string): Promise<EscrowGift | null> {
    try {
      const result = (await this.publicClient.readContract({
        address: GIFTENGINE_CONTRACT_ADDRESS,
        abi: GIFTENGINE_ABI,
        functionName: "getEscrowGift",
        args: [giftId as `0x${string}`],
      })) as [
        bigint,
        Address,
        Address,
        bigint,
        string,
        boolean,
        bigint,
        bigint
      ];

      if (result[3] === 0n) return null; // No gift found (amount is 0)

      return {
        circleId: Number(result[0]),
        sender: result[1],
        recipient: result[2],
        amount: result[3],
        message: result[4],
        claimed: result[5],
        createdAt: Number(result[6]) * 1000, // Convert from seconds to ms
        expiresAt: Number(result[7]) * 1000, // Convert from seconds to ms
      };
    } catch (error) {
      console.error("Error fetching escrow gift:", error);
      return null;
    }
  }

  /**
   * Check if a gift is claimable
   */
  async isGiftClaimable(giftId: string): Promise<boolean> {
    try {
      return (await this.publicClient.readContract({
        address: GIFTENGINE_CONTRACT_ADDRESS,
        abi: GIFTENGINE_ABI,
        functionName: "isGiftClaimable",
        args: [giftId as `0x${string}`],
      })) as boolean;
    } catch (error) {
      console.error("Error checking gift claimability:", error);
      return false;
    }
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
