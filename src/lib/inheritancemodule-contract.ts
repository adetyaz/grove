import {
  INHERITANCEMODULE_CONTRACT_ADDRESS,
  INHERITANCEMODULE_ABI,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/clients";
import { type Address } from "viem";

export class InheritanceModuleContractService {
  private publicClient = getPublicClient();

  // EXISTING FUNCTION - Keep backward compatibility
  async getBeneficiaries(circleId: number, owner: Address) {
    return await this.publicClient.readContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "getBeneficiaries",
      args: [BigInt(circleId), owner],
    });
  }

  async setBeneficiaries(
    circleId: number,
    beneficiaries: { beneficiary: Address; share: bigint }[],
    account: Address
  ) {
    const formatted = beneficiaries.map((b) => [b.beneficiary, b.share]);
    return await this.publicClient.simulateContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "setBeneficiaries",
      args: [BigInt(circleId), formatted],
      account,
    });
  }

  // NEW ENHANCED FUNCTIONS
  async canActivateInheritance(circleId: number, member: Address) {
    return (await this.publicClient.readContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "canActivateInheritance",
      args: [BigInt(circleId), member],
    })) as boolean;
  }

  async activateInheritance(
    circleId: number,
    deceased: Address,
    amount: bigint,
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "activateInheritance",
      args: [BigInt(circleId), deceased, amount],
      account,
    });
  }

  async claimInheritance(
    circleId: number,
    deceased: Address,
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "claimInheritance",
      args: [BigInt(circleId), deceased],
      account,
    });
  }

  async getInheritanceInfo(circleId: number, deceased: Address) {
    return (await this.publicClient.readContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "getInheritanceInfo",
      args: [BigInt(circleId), deceased],
    })) as [boolean, bigint]; // [active, amount]
  }

  async hasClaimed(circleId: number, deceased: Address, beneficiary: Address) {
    return (await this.publicClient.readContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "hasClaimed",
      args: [BigInt(circleId), deceased, beneficiary],
    })) as boolean;
  }
}

export const inheritanceModuleContract = new InheritanceModuleContractService();
