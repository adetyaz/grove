import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { walletAddress } = await request.json();

    if (!token || !walletAddress) {
      return NextResponse.json(
        { error: "Gift token and wallet address are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual gift claiming logic
    // 1. Verify gift token exists and is not expired
    // 2. Verify gift hasn't been claimed already
    // 3. Transfer the funds to the recipient's wallet
    // 4. Mark gift as claimed in database

    // For now, simulate the claiming process
    console.log(`Claiming gift ${token} to wallet ${walletAddress}`);

    // Simulate checking gift status
    if (!token.startsWith("gift_")) {
      return NextResponse.json(
        { error: "Invalid gift token" },
        { status: 400 }
      );
    }

    // TODO: Query database to check gift status
    // const gift = await db.giftInvitations.findUnique({
    //   where: { giftToken: token }
    // });

    // if (!gift) {
    //   return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    // }

    // if (gift.status === 'CLAIMED') {
    //   return NextResponse.json({ error: "Gift already claimed" }, { status: 410 });
    // }

    // if (new Date() > gift.expiresAt) {
    //   return NextResponse.json({ error: "Gift has expired" }, { status: 410 });
    // }

    // TODO: Execute blockchain transaction to transfer funds
    // const txResult = await groveContract.claimGift(gift.circleId, walletAddress);

    // TODO: Update gift status in database
    // await db.giftInvitations.update({
    //   where: { giftToken: token },
    //   data: {
    //     status: 'CLAIMED',
    //     claimedAt: new Date(),
    //     claimedByAddress: walletAddress
    //   }
    // });

    // Simulate successful claim
    const claimResult = {
      success: true,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      amount: "0.005", // This should come from the actual gift data
      claimedAt: new Date().toISOString(),
      claimedBy: walletAddress,
    };

    console.log("Gift claimed successfully:", claimResult);

    return NextResponse.json(claimResult);
  } catch (error) {
    console.error("Error claiming gift:", error);
    return NextResponse.json(
      { error: "Failed to claim gift" },
      { status: 500 }
    );
  }
}
