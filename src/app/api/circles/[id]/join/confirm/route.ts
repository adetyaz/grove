import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logUserActivity } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    const { circleId, memberWallet, txHash } = await request.json();

    if (!circleId || !memberWallet || !txHash) {
      return NextResponse.json(
        { error: "Missing circleId, memberWallet, or txHash" },
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

    // Check if already logged
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
        message: "Join already recorded",
        alreadyMember: true,
      });
    }

    // Log the successful blockchain join
    await logUserActivity(memberWallet, "circle_joined", {
      circleName: circle.name,
      circleId: circle.id,
      txHash: txHash,
      description: `Joined savings circle "${circle.name}" on blockchain`,
    });

    return NextResponse.json({
      success: true,
      message: "Circle join confirmed on blockchain",
      txHash,
    });
  } catch (error) {
    console.error("❌ Error confirming circle join:", error);
    return NextResponse.json(
      {
        error: "Failed to confirm circle join",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
