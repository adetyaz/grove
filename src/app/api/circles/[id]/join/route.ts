import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GROVE_CONTRACT_ADDRESS } from "@/lib/contracts";

export async function POST(request: NextRequest) {
  try {
    const { circleId, memberWallet } = await request.json();

    if (!circleId || !memberWallet) {
      return NextResponse.json(
        { error: "Missing circleId or memberWallet" },
        { status: 400 }
      );
    }

    // Validate that the circle exists
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        owner: true,
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Find the member by wallet address
    const member = await prisma.user.findUnique({
      where: { wallet: memberWallet },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if member is already in the circle by looking at UserActivity
    const existingJoinActivity = await prisma.userActivity.findFirst({
      where: {
        userAddress: memberWallet,
        type: "circle_joined",
        metadata: {
          contains: `"circleId":"${circleId}"`,
        },
      },
    });

    if (existingJoinActivity) {
      return NextResponse.json({
        success: true,
        message: "Member already in circle",
        alreadyMember: true,
      });
    }

    if (!circle.onChainId) {
      return NextResponse.json(
        { error: "Circle not deployed to blockchain yet" },
        { status: 400 }
      );
    }

    // Return the contract details for frontend to make the blockchain call
    return NextResponse.json({
      success: true,
      requiresBlockchainTx: true,
      contractAddress: GROVE_CONTRACT_ADDRESS,
      onChainId: circle.onChainId,
      memberWallet,
      circleId,
      circleName: circle.name,
      message: "Ready to join circle on blockchain",
    });
  } catch (error) {
    console.error("❌ Error in member join:", error);
    return NextResponse.json(
      {
        error: "Failed to prepare circle join",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
