import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Claim token is required" },
        { status: 400 }
      );
    }

    // Find the gift claim invite
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
        {
          error: "Gift has already been claimed",
          claimedAt: giftClaimInvite.claimedAt,
          claimedByAddress: giftClaimInvite.claimedByAddress,
        },
        { status: 409 }
      );
    }

    // Return gift details for claim page
    return NextResponse.json({
      success: true,
      giftDetails: {
        id: giftClaimInvite.id,
        senderName: giftClaimInvite.senderName,
        senderAddress: giftClaimInvite.senderAddress,
        amount: giftClaimInvite.amount,
        message: giftClaimInvite.message,
        occasion: giftClaimInvite.occasion,
        circleName: giftClaimInvite.circleName,
        expiresAt: giftClaimInvite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error verifying claim token:", error);
    return NextResponse.json(
      { error: "Failed to verify claim token" },
      { status: 500 }
    );
  }
}
