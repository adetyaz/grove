import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPublicClient, http } from "viem";
import { citreaTestnet } from "viem/chains";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/lib/contracts";

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
    // Get real blockchain data if circle is deployed
    let currentAmount = "0";
    let memberCount = 1; // Creator is always a member
    let members: string[] = [circle.owner.wallet];

    if (circle.onChainId) {
      try {
        const publicClient = createPublicClient({
          chain: citreaTestnet,
          transport: http(),
        });

        // Get circle data from blockchain (single call)
        const circleData = (await publicClient.readContract({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "getCircle",
          args: [BigInt(circle.onChainId)],
        })) as any[];

        // Extract data from contract response
        // Index 11 is members array
        members = (circleData[11] as string[]) || [circle.owner.wallet];
        memberCount = members.length;

        // Current amount calculation - for now use 0
        currentAmount = "0"; // TODO: Calculate from contributions
      } catch (error) {
        console.error(
          `Error fetching blockchain data for circle ${circle.onChainId}:`,
          error
        );
        // Keep default values if blockchain call fails
      }
    }

    // Return circle data with proper format expected by frontend
    const circleData = {
      id: circle.id,
      onChainId: circle.onChainId || 0,
      name: circle.name,
      description: parseCircleDescription(circle.description),
      targetAmount: BigInt(circle.targetAmount),
      currentAmount: BigInt(currentAmount),
      deadline: BigInt(
        Math.floor(Date.now() / 1000) +
          parseInt(circle.durationDays) * 24 * 60 * 60
      ),
      isActive: circle.syncStatus === "SYNCED",
      syncStatus: circle.syncStatus,
      memberCount,
      members,
      creator: circle.owner.wallet,
      paymentType: circle.isPublic ? "public" : "private",
      contributionAmount: BigInt(circle.contributionAmount),
      createdAt: circle.createdAt.toISOString(),
      owner: circle.owner,
      contributions: [], // TODO: Fetch real contributions from blockchain events
    };

    return NextResponse.json({ circle: circleData });
  } catch (error) {
    console.error("Error fetching circle details:", error);
    return NextResponse.json(
      { error: "Failed to fetch circle details" },
      { status: 500 }
    );
  }
}
