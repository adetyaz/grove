import { SATVAULT_CONTRACT_ADDRESS, SATVAULT_ABI } from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";
import { type Address } from "viem";

export class SatVaultContractService {
  private publicClient = getPublicClient();

  async getBalance(circleId: number): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: SATVAULT_CONTRACT_ADDRESS,
      abi: SATVAULT_ABI,
      functionName: "getBalance",
      args: [BigInt(circleId)],
    })) as bigint;
  }

  async deposit(circleId: number, amount: bigint, account: Address) {
    return await this.publicClient.simulateContract({
      address: SATVAULT_CONTRACT_ADDRESS,
      abi: SATVAULT_ABI,
      functionName: "deposit",
      args: [BigInt(circleId)],
      account,
      value: amount,
    });
  }

  async withdraw(
    circleId: number,
    amount: bigint,
    receiver: Address,
    account: Address
  ) {
    return await this.publicClient.simulateContract({
      address: SATVAULT_CONTRACT_ADDRESS,
      abi: SATVAULT_ABI,
      functionName: "withdraw",
      args: [BigInt(circleId), amount, receiver],
      account,
    });
  }

  async isPaymentDue(circleId: number, member: Address): Promise<boolean> {
    return (await this.publicClient.readContract({
      address: SATVAULT_CONTRACT_ADDRESS,
      abi: SATVAULT_ABI,
      functionName: "isPaymentDue",
      args: [BigInt(circleId), member],
    })) as boolean;
  }
}

export const satVaultContract = new SatVaultContractService();
