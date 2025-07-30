import { NextResponse } from "next/server";
import { AutomatedPaymentService } from "@/lib/automated-payment-service";

export async function GET() {
  try {
    // Initialize automated payment service
    let paymentService: AutomatedPaymentService;
    try {
      paymentService = new AutomatedPaymentService();
    } catch (err) {
      console.warn("Service wallet not configured:", err);
      return NextResponse.json({
        configured: false,
        error: "SERVICE_WALLET_PRIVATE_KEY not configured",
      });
    }

    // Check service wallet balance
    const walletBalance = await paymentService.checkServiceWalletBalance();

    if (!walletBalance) {
      return NextResponse.json(
        {
          configured: true,
          error: "Failed to fetch wallet balance",
        },
        { status: 500 }
      );
    }

    const gasCost = await paymentService.estimateGasCost(1, "0.001");

    return NextResponse.json({
      configured: true,
      wallet: {
        address: walletBalance.address,
        balance: walletBalance.balanceInBTC,
        balanceWei: walletBalance.balance,
      },
      gasEstimate: gasCost,
      realTransactionsEnabled: process.env.USE_REAL_TRANSACTIONS === "true",
      rpcUrl: process.env.CITREA_RPC_URL || "https://rpc.citrea.io",
    });
  } catch (error) {
    console.error("Error checking service wallet:", error);
    return NextResponse.json(
      {
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
