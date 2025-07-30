import { NextRequest, NextResponse } from "next/server";
import { logContribution } from "@/lib/activity-logger";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, circleId, amount, txHash, circleName } = body;

    if (!userAddress || !circleId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log the contribution activity
    await logContribution(
      userAddress,
      circleName || `Circle ${circleId}`,
      circleId.toString(),
      amount,
      txHash
    );

    const user = await prisma.user.upsert({
      where: { wallet: userAddress.toLowerCase() },
      update: {
        totalContributions: { increment: 1 },
        lastActivityDate: new Date(),
      },
      create: {
        wallet: userAddress.toLowerCase(),
        email: `${userAddress.toLowerCase()}@wallet.local`,
        totalContributions: 1,
        lastActivityDate: new Date(),
      },
    });

    // Ensure user is a member of the circle they're contributing to
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: { members: true },
    });

    if (circle) {
      const isAlreadyMember = circle.members.some(
        (m) => m.wallet.toLowerCase() === userAddress.toLowerCase()
      );

      if (!isAlreadyMember) {
        // Add user as a member of the circle
        await prisma.circle.update({
          where: { id: circleId },
          data: {
            members: {
              connect: { id: user.id },
            },
          },
        });

        console.log(
          `Added user ${userAddress} as member of circle ${circleId}`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging contribution:", error);
    return NextResponse.json(
      { error: "Failed to log contribution" },
      { status: 500 }
    );
  }
}
