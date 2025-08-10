import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { userAddress, userEmail } = body;

    if (!token || !userAddress) {
      return NextResponse.json(
        { error: "Claim token and user address are required" },
        { status: 400 }
      );
    }

    // Find and validate the gift claim invite
    const giftClaimInvite = await prisma.giftClaimInvite.findUnique({
      where: { claimToken: token },
    });

    if (!giftClaimInvite) {
      return NextResponse.json(
        { error: "Invalid claim token" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (new Date() > giftClaimInvite.expiresAt) {
      return NextResponse.json(
        { error: "Claim token has expired" },
        { status: 410 }
      );
    }

    // Check if already claimed
    if (giftClaimInvite.claimedAt) {
      return NextResponse.json(
        { error: "Gift has already been claimed" },
        { status: 409 }
      );
    }

    // Validate that the user email matches (if provided during claim)
    if (
      userEmail &&
      userEmail.toLowerCase() !== giftClaimInvite.recipientEmail
    ) {
      return NextResponse.json(
        { error: "Email address does not match gift recipient" },
        { status: 403 }
      );
    }

    // Create or update user record
    await prisma.user.upsert({
      where: {
        wallet: userAddress.toLowerCase(),
      },
      update: {
        lastActivityDate: new Date(),
        email: userEmail || giftClaimInvite.recipientEmail,
      },
      create: {
        wallet: userAddress.toLowerCase(),
        email: userEmail || giftClaimInvite.recipientEmail,
        lastActivityDate: new Date(),
      },
    });

    // Process the gift transfer
    try {
      // Claim the escrow gift from the blockchain
      const { giftEngineContract } = await import("@/lib/giftengine-contract");

      try {
        const claimResult = await giftEngineContract.claimEscrowGift(
          giftClaimInvite.giftId,
          userAddress as `0x${string}`
        );
        console.log("Gift successfully claimed from escrow:", claimResult.hash);
      } catch (contractError: any) {
        console.error("Failed to claim from escrow contract:", contractError);
        throw new Error(`Escrow claim failed: ${contractError.message}`);
      }

      // Mark the gift as claimed in database
      await prisma.giftClaimInvite.update({
        where: { id: giftClaimInvite.id },
        data: {
          claimedAt: new Date(),
          claimedByAddress: userAddress.toLowerCase(),
        },
      });

      // Log the activity
      await prisma.userActivity.create({
        data: {
          userAddress: userAddress.toLowerCase(),
          type: "GIFT_CLAIMED",
          description: `Claimed ${giftClaimInvite.amount} BTC gift from ${giftClaimInvite.senderName}`,
          metadata: JSON.stringify({
            giftId: giftClaimInvite.giftId,
            amount: giftClaimInvite.amount,
            senderAddress: giftClaimInvite.senderAddress,
            senderName: giftClaimInvite.senderName,
            circleName: giftClaimInvite.circleName,
            message: giftClaimInvite.message,
            occasion: giftClaimInvite.occasion,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Gift claimed successfully!",
        giftDetails: {
          amount: giftClaimInvite.amount,
          senderName: giftClaimInvite.senderName,
          circleName: giftClaimInvite.circleName,
          message: giftClaimInvite.message,
          claimedAt: new Date(),
        },
      });
    } catch (transferError) {
      console.error("Error processing gift transfer:", transferError);

      // If the transfer fails, we should not mark it as claimed
      return NextResponse.json(
        {
          error:
            "Gift claim processed but transfer failed. Please contact support.",
          details:
            transferError instanceof Error
              ? transferError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing gift claim:", error);
    return NextResponse.json(
      { error: "Failed to process gift claim" },
      { status: 500 }
    );
  }
}
