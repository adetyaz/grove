import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { giftEngineContract } from "@/lib/giftengine-contract";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const giftId = params.id;
    const { walletAddress } = await request.json();

    if (!giftId || !walletAddress) {
      return NextResponse.json(
        { error: "Gift ID and wallet address are required" },
        { status: 400 }
      );
    }

    // 1. Find the gift claim invite by giftId
    const giftClaim = await prisma.giftClaimInvite.findFirst({
      where: { giftId: giftId },
    });

    if (!giftClaim) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    if (giftClaim.claimedAt) {
      return NextResponse.json(
        {
          error: "Gift already claimed",
          claimedAt: giftClaim.claimedAt,
          claimedBy: giftClaim.claimedByAddress,
        },
        { status: 410 }
      );
    }

    if (new Date() > giftClaim.expiresAt) {
      return NextResponse.json({ error: "Gift has expired" }, { status: 410 });
    }

    // 2. Execute blockchain transaction to claim the gift
    try {
      const claimResult = await giftEngineContract.claimEscrowGift(
        giftId,
        walletAddress as `0x${string}`
      );

      // 3. Mark gift as claimed in database
      const updatedGiftClaim = await prisma.giftClaimInvite.update({
        where: { id: giftClaim.id },
        data: {
          claimedAt: new Date(),
          claimedByAddress: walletAddress,
        },
      });

      console.log("Gift claimed successfully:", {
        giftId: giftId,
        amount: giftClaim.amount,
        claimedBy: walletAddress,
        txHash: claimResult.hash,
      });

      return NextResponse.json({
        success: true,
        txHash: claimResult.hash,
        amount: giftClaim.amount,
        claimedAt: updatedGiftClaim.claimedAt,
        claimedBy: walletAddress,
        senderName: giftClaim.senderName,
        circleName: giftClaim.circleName,
        message: giftClaim.message,
        occasion: giftClaim.occasion,
      });
    } catch (blockchainError: any) {
      console.error("Blockchain claim failed:", blockchainError);

      // Check if it's a specific contract error
      if (blockchainError.message?.includes("Gift already claimed")) {
        // Update database to reflect actual state
        await prisma.giftClaimInvite.update({
          where: { id: giftClaim.id },
          data: {
            claimedAt: new Date(),
            claimedByAddress: "unknown", // Since we don't know who claimed it
          },
        });
        return NextResponse.json(
          {
            error: "Gift has already been claimed on the blockchain",
          },
          { status: 410 }
        );
      }

      if (blockchainError.message?.includes("Gift has expired")) {
        return NextResponse.json(
          {
            error: "Gift has expired on the blockchain",
          },
          { status: 410 }
        );
      }

      if (blockchainError.message?.includes("Not the gift recipient")) {
        return NextResponse.json(
          {
            error: "This wallet address is not authorized to claim this gift",
          },
          { status: 403 }
        );
      }

      // Generic blockchain error
      throw blockchainError;
    }
  } catch (error) {
    console.error("Error claiming gift:", error);
    return NextResponse.json(
      {
        error:
          "Failed to claim gift: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
