import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { groveContract } from "@/lib/grove-contract";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const circleId = params.id; // Now expects UUID, not numeric ID

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(circleId)) {
      return NextResponse.json(
        { error: "Invalid circle ID format" },
        { status: 400 }
      );
    }

    // Fetch circle from database using UUID
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
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

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    // Fetch current amount from blockchain if circle is synced
    let currentAmount = "0";
    try {
      if (circle.onChainId) {
        const blockchainData = await groveContract.getCircle(circle.onChainId);
        currentAmount = blockchainData?.currentAmount?.toString() || "0";
      }
    } catch (error) {
      console.error("Error fetching current amount from blockchain:", error);
    }

    // Return circle data with UUID as ID
    const circleData = {
      id: circle.id, // Use UUID as primary ID
      onChainId: circle.onChainId, // Include contract ID if synced
      name: circle.name,
      description: circle.description,
      targetAmount: circle.targetAmount,
      currentAmount,
      deadline: Math.floor(new Date(circle.deadline).getTime() / 1000),
      isActive: circle.syncStatus === "SYNCED",
      syncStatus: circle.syncStatus,
      memberCount: circle.members.length + 1, // +1 for owner
      members: [
        circle.owner.wallet,
        ...circle.members.map((m: { wallet: string }) => m.wallet),
      ],
      creator: circle.owner.wallet,
      contractAddress: circle.contractAddress,
    };

    return NextResponse.json(circleData);
  } catch (error) {
    console.error("Error fetching circle details:", error);
    return NextResponse.json(
      { error: "Failed to fetch circle details" },
      { status: 500 }
    );
  }
}
