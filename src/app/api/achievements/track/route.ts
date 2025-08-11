import { NextRequest, NextResponse } from "next/server";
import { parseEther } from "viem";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, contributionAmount } = await request.json();

    if (!userAddress || !contributionAmount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Convert contribution amount to wei (assuming it's in BTC/ETH)
    const amountInWei = parseEther(contributionAmount);

   

    // Store the contribution data that can be used for manual syncing

    return NextResponse.json({
      success: true,
      message: "Contribution tracked - user can sync achievements manually",
      userAddress,
      amount: contributionAmount,
      amountInWei: amountInWei.toString(),
      note: "Call the sync endpoint or use the achievements panel to sync your contributions with the contract",
    });
  } catch (error) {
    console.error("Error tracking achievement contribution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
