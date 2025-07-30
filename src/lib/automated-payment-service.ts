import { createWalletClient, createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { citreaTestnet } from "viem/chains";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";

export class AutomatedPaymentService {
  private walletClient;
  private publicClient;
  private account;

  constructor() {
    // Service wallet private key (should be stored securely in production)
    const servicePrivateKey = process.env.SERVICE_WALLET_PRIVATE_KEY;

    if (!servicePrivateKey) {
      throw new Error(
        "SERVICE_WALLET_PRIVATE_KEY environment variable is required"
      );
    }

    const transport = http(
      process.env.CITREA_RPC_URL || "https://rpc.citrea.io"
    );

    this.account = privateKeyToAccount(servicePrivateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account: this.account,
      chain: citreaTestnet,
      transport,
    });

    this.publicClient = createPublicClient({
      chain: citreaTestnet,
      transport,
    });
  }

  /**
   * Execute a contribution on behalf of a user
   * Note: This requires the user to have pre-approved the service wallet
   * or deposited funds into a custody contract
   */
  async executeContribution(
    circleOnChainId: number,
    amount: string,
    userAddress: string
  ) {
    try {
      console.log(`Executing contribution for user ${userAddress}`);
      console.log(`Circle: ${circleOnChainId}, Amount: ${amount}`);

      // Approach 1: Direct contribution (requires service wallet to hold funds)
      const txHash = await this.walletClient.writeContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "contribute",
        args: [BigInt(circleOnChainId)],
        value: parseEther(amount),
      });

      console.log(`Transaction submitted: ${txHash}`);
      return { success: true, txHash };
    } catch (error) {
      console.error("Failed to execute contribution:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute contribution using user's deposited funds
   * This would require a custody contract that holds user funds
   */
  async executeContributionFromCustody(
    circleOnChainId: number,
    amount: string,
    userAddress: string,
    custodyContractAddress: string
  ) {
    try {
      // This would call a custody contract method that:
      // 1. Verifies the user has sufficient deposited funds
      // 2. Deducts the amount from their balance
      // 3. Makes the contribution to the Grove contract

      // Example custody contract call (pseudo-code):
      const txHash = await this.walletClient.writeContract({
        address: custodyContractAddress as `0x${string}`,
        abi: [], // Custody contract ABI
        functionName: "executeUserContribution",
        args: [userAddress, BigInt(circleOnChainId), parseEther(amount)],
      });

      return { success: true, txHash };
    } catch (error) {
      console.error("Failed to execute custody contribution:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if service wallet has sufficient funds
   */
  async checkServiceWalletBalance() {
    try {
      const balance = await this.publicClient.getBalance({
        address: this.account.address,
      });

      return {
        address: this.account.address,
        balance: balance.toString(),
        balanceInBTC: (Number(balance) / 1e18).toFixed(8),
      };
    } catch (error) {
      console.error("Failed to check service wallet balance:", error);
      return null;
    }
  }

  /**
   * Estimate gas cost for a contribution
   */
  async estimateGasCost(circleOnChainId: number, amount: string) {
    try {
      const gasEstimate = await this.publicClient.estimateGas({
        account: this.account.address,
        to: GROVE_CONTRACT_ADDRESS,
        data: "0x", // Would encode the contribute function call
        value: parseEther(amount),
      });

      const gasPrice = await this.publicClient.getGasPrice();
      const gasCost = gasEstimate * gasPrice;

      return {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasCost: gasCost.toString(),
        gasCostInBTC: (Number(gasCost) / 1e18).toFixed(8),
      };
    } catch (error) {
      console.error("Failed to estimate gas cost:", error);
      return null;
    }
  }
}
