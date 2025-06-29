import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const circleId = parseInt(params.id);

    if (isNaN(circleId)) {
      return NextResponse.json({ error: "Invalid circle ID" }, { status: 400 });
    }

    // Try to fetch from database first
    const circle = await prisma.circle.findFirst({
      where: {
        OR: [{ id: circleId }, { onChainId: circleId }],
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
        members: {
          select: { id: true, email: true, name: true, wallet: true },
        },
        invitations: {
          where: { status: "ACCEPTED" },
          select: {
            acceptedByWalletAddress: true,
            acceptedByEmail: true,
            acceptedAt: true,
          },
        },
      },
    });

    if (circle) {
      // Return database data
      const circleData = {
        id: circle.onChainId || circle.id,
        name: circle.name,
        description: circle.description,
        targetAmount: circle.targetAmount,
        currentAmount: "0", // TODO: Fetch from blockchain
        deadline: Math.floor(new Date(circle.deadline).getTime() / 1000),
        isActive: true,
        memberCount: circle.members.length + circle.invitations.length + 1,
        members: [
          circle.owner.wallet,
          ...circle.members.map((m: { wallet: string }) => m.wallet),
        ],
        creator: circle.owner.wallet,
      };

      return NextResponse.json(circleData);
    } else {
      // Fallback to mock data for blockchain-only circles
      const mockCircleData = {
        id: circleId,
        name: `Circle #${circleId}`,
        description: `Savings circle #${circleId} for collaborative financial goals`,
        targetAmount: "1000000000000000000", // 1 BTC in wei
        currentAmount: "250000000000000000", // 0.25 BTC in wei
        deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        isActive: true,
        memberCount: 1,
        members: ["0x0000000000000000000000000000000000000000"], // Will be populated with real addresses
        creator: "0x0000000000000000000000000000000000000000",
      };

      return NextResponse.json(mockCircleData);
    }
  } catch (error) {
    console.error("Error fetching circle details:", error);
    return NextResponse.json(
      { error: "Failed to fetch circle details" },
      { status: 500 }
    );
  }
}
