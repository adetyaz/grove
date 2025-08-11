import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Since we removed automated payment service for security,
    // this endpoint now returns a disabled status
    return NextResponse.json({
      configured: false,
      disabled: true,
      message:
        "Automated payments disabled for security. All payments are now simulated.",
      balance: null,
      realTransactionsEnabled: false,
      rpcUrl: process.env.CITREA_RPC_URL || "https://rpc.citrea.io",
    });
  } catch (error) {
    console.error("Wallet status check error:", error);
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check wallet status",
      },
      { status: 500 }
    );
  }
}
