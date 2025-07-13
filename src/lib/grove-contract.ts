// (Removed stray simulateClaimAchievement method from top of file)
import {
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
  type Circle,
  type CreateCircleParams,
  type AddMemberParams,
  type ContributeParams,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";
import { type Address } from "viem";

export class GroveContractService {
  /**
   * Simulate claiming an achievement NFT
   * @param params { circleId: number, achievementId: string }
   * @param account {Address}
   */
  async simulateClaimAchievement(
    params: { circleId: number; achievementId: string },
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "claimAchievement",
      args: [BigInt(params.circleId), params.achievementId],
      account,
    });
  }
  private publicClient = getPublicClient();

  /**
   * Read a circle's details from the contract
   */
  async getCircle(circleId: number): Promise<Partial<Circle> | null> {
    try {
      // Use the 'circles' mapping getter from the contract (returns id, owner, name)
      const result = await this.publicClient.readContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "circles",
        args: [BigInt(circleId)],
      });

      // The mapping returns: id, owner, name (NO members array from public mapping)
      const [id, owner, name] = result as [
        bigint, // id
        Address, // owner
        string, // name
      ];

      // Get members separately using getMembers function
      let members: Address[] = [];
      try {
        members = (await this.publicClient.readContract({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "getMembers",
          args: [BigInt(circleId)],
        })) as Address[];
      } catch {
        members = []; // Fallback to empty array
      }

      // Try to get current amount from SatVault if available
      let currentAmount = BigInt(0);
      try {
        currentAmount = (await this.publicClient.readContract({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "getCircleBalance",
          args: [BigInt(circleId)],
        })) as bigint;
      } catch {
        // fallback to 0
      }

      return {
        id: Number(id),
        owner: owner as Address,
        name: name as string,
        targetAmount: BigInt(0), // Not stored in this simple contract
        currentAmount,
        deadline: BigInt(0), // Not stored in this simple contract
        isActive: Number(id) > 0, // Circle exists if id > 0
        memberCount: members.length,
        members: members,
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
        functionName: "getMembers",
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
    // Map frontend params to contract params
    // Contract expects: (name, contributionAmount, interval, goal)
    // NOTE: Skip SatVault for now due to ownership issues
    const contributionAmount = BigInt(1); // Minimal amount to avoid zero
    const interval = BigInt(86400); // Default to 1 day interval
    const goal = params.targetAmount;

    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "createCircle",
      args: [
        params.name, // string _name
        contributionAmount, // uint _contributionAmount
        interval, // uint _interval
        goal, // uint _goal
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

  async simulateJoinCircle(circleId: number, account: Address) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "joinCircle",
      args: [BigInt(circleId)],
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

  /**
   * Simulate a withdrawal from a circle
   * @param params { circleId: number, amount: bigint }
   * @param account {Address}
   */
  async simulateWithdraw(
    params: { circleId: number; amount: bigint },
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "withdraw",
      args: [BigInt(params.circleId), params.amount],
      account,
    });
  }

  /**
   * Simulate sending a gift within a circle
   * @param params { circleId: number, recipient: string, amount: bigint }
   * @param account {Address}
   */
  async simulateGift(
    params: { circleId: number; recipient: string; amount: bigint },
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "gift",
      args: [BigInt(params.circleId), params.recipient, params.amount],
      account,
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
