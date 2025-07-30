import { NextRequest, NextResponse } from "next/server";
import { logUserActivity } from "@/lib/activity-logger";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      senderAddress,
      recipientAddress,
      circleId,
      amount,
      txHash,
      message,
      circleName,
    } = body;

    if (!senderAddress || !recipientAddress || !circleId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.user.upsert({
      where: { wallet: senderAddress.toLowerCase() },
      update: { lastActivityDate: new Date() },
      create: {
        wallet: senderAddress.toLowerCase(),
        email: `${senderAddress.toLowerCase()}@wallet.local`,
        lastActivityDate: new Date(),
      },
    });

    await logUserActivity(
      senderAddress,
      "gift_sent",
      `Sent ${amount} BTC gift to ${recipientAddress.slice(
        0,
        6
      )}...${recipientAddress.slice(-4)} in ${
        circleName || `Circle ${circleId}`
      }`,
      {
        amount,
        circleName: circleName || `Circle ${circleId}`,
        circleId,
        recipient: recipientAddress,
        message,
        txHash,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking gift:", error);
    return NextResponse.json(
      { error: "Failed to track gift" },
      { status: 500 }
    );
  }
}
