import {
  INHERITANCEMODULE_CONTRACT_ADDRESS,
  INHERITANCEMODULE_ABI,
} from "@/contracts/constants";
import { getPublicClient } from "@/lib/clients";
import { type Address } from "viem";

export class InheritanceModuleContractService {
  private publicClient = getPublicClient();

  async getBeneficiaries(circleId: number, owner: Address) {
    return await this.publicClient.readContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "circleBeneficiaries",
      args: [BigInt(circleId), owner],
    });
  }

  async setBeneficiaries(
    circleId: number,
    beneficiaries: { beneficiary: Address; share: bigint }[],
    account: Address
  ) {
    // Convert to tuple array for contract call
    const formatted = beneficiaries.map((b) => [b.beneficiary, b.share]);
    return await this.publicClient.simulateContract({
      address: INHERITANCEMODULE_CONTRACT_ADDRESS,
      abi: INHERITANCEMODULE_ABI,
      functionName: "setBeneficiaries",
      args: [BigInt(circleId), formatted],
      account,
    });
  }
}

export const inheritanceModuleContract = new InheritanceModuleContractService();
