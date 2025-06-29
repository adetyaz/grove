import {
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
  type Circle,
  type CreateCircleParams,
  type AddMemberParams,
  type ContributeParams,
  PaymentType,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";
import { type Address } from "viem";

export class GroveContractService {
  private publicClient = getPublicClient();

  /**
   * Read a circle's details from the contract
   */
  async getCircle(circleId: number): Promise<Circle | null> {
    try {
      const result = await this.publicClient.readContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "getCircle",
        args: [BigInt(circleId)],
      });

      // Transform the contract result to our Circle interface
      const [
        id,
        owner,
        name,
        description,
        targetAmount,
        currentAmount,
        paymentType,
        fixedAmount,
        deadline,
        isActive,
        memberCount,
      ] = result as [
        bigint, // id
        Address, // owner
        string, // name
        string, // description
        bigint, // targetAmount
        bigint, // currentAmount
        number, // paymentType
        bigint, // fixedAmount
        bigint, // deadline
        boolean, // isActive
        bigint, // memberCount
      ];

      return {
        id: Number(id),
        owner: owner as Address,
        name: name as string,
        description: description as string,
        targetAmount: targetAmount as bigint,
        currentAmount: currentAmount as bigint,
        paymentType: paymentType as PaymentType,
        fixedAmount: fixedAmount as bigint,
        deadline: deadline as bigint,
        isActive: isActive as boolean,
        memberCount: Number(memberCount),
        members: [], // Would need separate call to get members
      };
    } catch (error) {
      console.error("Error fetching circle:", error);
      return null;
    }
  }

  /**
   * Get all circles for a user
   */
  async getUserCircles(userAddress: Address): Promise<number[]> {
    try {
      const result = await this.publicClient.readContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "getUserCircles",
        args: [userAddress],
      });

      return (result as bigint[]).map((id) => Number(id));
    } catch (error) {
      console.error("Error fetching user circles:", error);
      return [];
    }
  }

  /**
   * Get members of a circle
   */
  async getCircleMembers(circleId: number): Promise<Address[]> {
    try {
      const result = await this.publicClient.readContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "getCircleMembers",
        args: [BigInt(circleId)],
      });

      return result as Address[];
    } catch (error) {
      console.error("Error fetching circle members:", error);
      return [];
    }
  }

  /**
   * Check if a user is a member of a circle
   */
  async isCircleMember(
    circleId: number,
    userAddress: Address
  ): Promise<boolean> {
    try {
      const members = await this.getCircleMembers(circleId);
      return members.includes(userAddress);
    } catch (error) {
      console.error("Error checking circle membership:", error);
      return false;
    }
  }

  /**
   * Get the next circle ID (useful for tracking new circles)
   */
  async getNextCircleId(): Promise<number> {
    try {
      const result = await this.publicClient.readContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "nextCircleId",
        args: [],
      });

      return Number(result);
    } catch (error) {
      console.error("Error fetching next circle ID:", error);
      return 0;
    }
  }

  /**
   * Simulate contract calls before executing them
   */
  async simulateCreateCircle(params: CreateCircleParams, account: Address) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "createCircle",
      args: [
        params.name,
        params.description,
        params.targetAmount,
        params.paymentType,
        params.fixedAmount || BigInt(0),
        params.deadline,
      ],
      account,
    });
  }

  async simulateAddMember(params: AddMemberParams, account: Address) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "addMember",
      args: [BigInt(params.circleId), params.newMember],
      account,
    });
  }

  async simulateContribute(params: ContributeParams, account: Address) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "contribute",
      args: [BigInt(params.circleId)],
      account,
      value: params.amount,
    });
  }
}

// Export a singleton instance
export const groveContract = new GroveContractService();

// Helper function to format amounts for display
export function formatBTCAmount(amount: bigint, decimals: number = 4): string {
  const btcAmount = Number(amount) / 1e18; // Convert from wei to BTC
  return btcAmount.toFixed(decimals);
}

// Helper function to calculate circle progress percentage
export function calculateProgress(
  currentAmount: bigint,
  targetAmount: bigint
): number {
  if (targetAmount === BigInt(0)) return 0;
  return Math.min(100, (Number(currentAmount) / Number(targetAmount)) * 100);
}

// Helper function to check if circle deadline has passed
export function isCircleExpired(deadline: bigint): boolean {
  const deadlineMs = Number(deadline) * 1000;
  return Date.now() > deadlineMs;
}

// Helper function to format deadline for display
export function formatDeadline(deadline: bigint): string {
  const deadlineMs = Number(deadline) * 1000;
  return new Date(deadlineMs).toLocaleDateString();
}
