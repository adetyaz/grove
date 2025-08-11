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

    // Create or update user record - handle email conflicts properly
    try {
      // First, try to find existing user by wallet
      const existingUser = await prisma.user.findUnique({
        where: { wallet: userAddress.toLowerCase() },
      });

      if (existingUser) {
        // User exists with this wallet - just update activity date
        await prisma.user.update({
          where: { wallet: userAddress.toLowerCase() },
          data: {
            lastActivityDate: new Date(),
            // Only update email if it's currently null/empty and new email doesn't conflict
            ...((!existingUser.email ||
              existingUser.email.includes("@wallet.local")) &&
              userEmail && {
                email: userEmail,
              }),
          },
        });
      } else {
        // Check if the email is already taken by another user
        const targetEmail = userEmail || giftClaimInvite.recipientEmail;
        const emailConflict = await prisma.user.findUnique({
          where: { email: targetEmail },
        });

        if (emailConflict) {
          // Email is taken, create user with wallet-based email
          await prisma.user.create({
            data: {
              wallet: userAddress.toLowerCase(),
              email: `${userAddress.toLowerCase()}@wallet.local`,
              name: `User ${userAddress.slice(0, 8)}`,
              lastActivityDate: new Date(),
            },
          });
        } else {
          // Email is free, create user with the target email
          await prisma.user.create({
            data: {
              wallet: userAddress.toLowerCase(),
              email: targetEmail,
              name: `User ${userAddress.slice(0, 8)}`,
              lastActivityDate: new Date(),
            },
          });
        }
      }
    } catch (emailError) {
      console.error("Error handling user record:", emailError);
      // If all else fails, just ensure user exists with a unique wallet-based email
      const uniqueWalletEmail = `${userAddress.toLowerCase()}_${Date.now()}@wallet.local`;

      try {
        await prisma.user.upsert({
          where: { wallet: userAddress.toLowerCase() },
          update: { lastActivityDate: new Date() },
          create: {
            wallet: userAddress.toLowerCase(),
            email: uniqueWalletEmail,
            name: `User ${userAddress.slice(0, 8)}`,
            lastActivityDate: new Date(),
          },
        });
      } catch (finalError) {
        console.error("Final user creation failed:", finalError);
       
      }
    }

    
    try {
   
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
        message: "Gift claim validated successfully!",
        giftDetails: {
          giftId: giftClaimInvite.giftId,
          amount: giftClaimInvite.amount,
          senderName: giftClaimInvite.senderName,
          circleName: giftClaimInvite.circleName,
          message: giftClaimInvite.message,
          claimedAt: new Date(),
        },
      });
    } catch (claimError) {
      console.error("Error processing gift claim:", claimError);
      return NextResponse.json(
        {
          error: "Failed to process gift claim",
          details:
            claimError instanceof Error ? claimError.message : "Unknown error",
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
