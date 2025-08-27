import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { groveContract } from "@/lib/grove-contract";

// Utility function to parse circle description that might be JSON
const parseCircleDescription = (description: string | null): string => {
  if (!description) return "";

  try {
    const parsed = JSON.parse(description);
    // If it's our JSON format, return just the description part
    if (typeof parsed === "object" && parsed.description !== undefined) {
      return parsed.description || "";
    }
    // If JSON parsing worked but it's not our format, return the original
    return description;
  } catch {
    // If JSON parsing fails, it's a plain string description
    return description;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const circleId = params.id;

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
        invitations: {
          where: { status: "ACCEPTED" },
          select: {
            inviterWallet: true,
            recipientEmail: true,
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
      id: circle.id,
      onChainId: circle.onChainId,
      name: circle.name,
      description: parseCircleDescription(circle.description),
      targetAmount: circle.targetAmount,
      currentAmount,
      deadline:
        Math.floor(Date.now() / 1000) +
        parseInt(circle.durationDays) * 24 * 60 * 60, // Calculate deadline from duration
      paymentType: circle.isPublic ? "PUBLIC" : "PRIVATE", // Map isPublic to paymentType
      frequency: circle.contributionInterval, // Use contributionInterval as frequency
      contributionAmount: circle.contributionAmount,
      isActive: circle.syncStatus === "SYNCED",
      syncStatus: circle.syncStatus,
      memberCount:
        circle.invitations.filter((inv) => inv.acceptedAt).length + 1, // Owner + accepted invitations
      members: [
        circle.owner.wallet,
        // For now, just include owner since invitation system is not fully integrated
      ],
      creator: circle.owner.wallet,
      contractAddress: circle.transactionHash, // Use transaction hash as contract reference
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
