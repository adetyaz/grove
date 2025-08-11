import { createPublicClient, http } from "viem";
import { citreaTestnet } from "viem/chains";

export class AutomatedPaymentService {
  private publicClient;

  constructor() {
    const transport = http(
      process.env.CITREA_RPC_URL || "https://rpc.citrea.io"
    );

    this.publicClient = createPublicClient({
      chain: citreaTestnet,
      transport,
    });
  }

  /**
   * Check transaction status on blockchain
   */
  async checkTransactionStatus(txHash: string) {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      return {
        success: true,
        status: receipt.status === "success" ? "confirmed" : "failed",
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("Failed to check transaction status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const chainId = await this.publicClient.getChainId();
      const blockNumber = await this.publicClient.getBlockNumber();

      return {
        chainId: chainId.toString(),
        blockNumber: blockNumber.toString(),
        network: "Citrea Testnet",
      };
    } catch (error) {
      console.error("Failed to get network info:", error);
      return null;
    }
  }
}
