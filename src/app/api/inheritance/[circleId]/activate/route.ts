import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { CITREA_TESTNET } from "@/lib/contracts";
import { INHERITANCE_CONTRACT_ADDRESS, INHERITANCE_ABI } from "@/lib/contracts";

const publicClient = createPublicClient({
  chain: CITREA_TESTNET,
  transport: http(),
});

// POST /api/inheritance/[circleId]/activate - Activate inheritance for a deceased member
export async function POST(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { deceasedAddress, reason, activatorAddress } = await request.json();
    const circleId = parseInt(params.circleId);

    if (!deceasedAddress || !activatorAddress) {
      return NextResponse.json({ error: "Deceased and activator addresses required" }, { status: 400 });
    }

    // Check if inheritance can be activated
    const canActivate = await publicClient.readContract({
      address: INHERITANCE_CONTRACT_ADDRESS as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: "canActivateInheritance",
      args: [circleId, deceasedAddress, activatorAddress],
    });

    if (!canActivate) {
      return NextResponse.json({ error: "Cannot activate inheritance for this member" }, { status: 400 });
    }

    // Return transaction data for frontend to execute
    return NextResponse.json({
      success: true,
      transactionData: {
        contractAddress: INHERITANCE_CONTRACT_ADDRESS,
        functionName: "activateInheritance",
        args: [circleId, deceasedAddress, reason || ""],
        abi: INHERITANCE_ABI,
      },
    });
  } catch (error) {
    console.error("Error activating inheritance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/inheritance/[circleId]/activate?deceased=address&activator=address - Check if inheritance can be activated
export async function GET(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const deceasedAddress = searchParams.get("deceased");
    const activatorAddress = searchParams.get("activator");
    const circleId = parseInt(params.circleId);

    if (!deceasedAddress || !activatorAddress) {
      return NextResponse.json({ error: "Deceased and activator addresses required" }, { status: 400 });
    }

    // Check if inheritance can be activated
    const canActivate = await publicClient.readContract({
      address: INHERITANCE_CONTRACT_ADDRESS as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: "canActivateInheritance",
      args: [circleId, deceasedAddress, activatorAddress],
    });

    // Get inheritance status
    const status = await publicClient.readContract({
      address: INHERITANCE_CONTRACT_ADDRESS as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: "getInheritanceStatus",
      args: [circleId, deceasedAddress],
    }) as [boolean, bigint, bigint, string, string];

    const [isActive, activatedAt, totalAmount, activatedBy, activationReason] = status;

    return NextResponse.json({
      canActivate,
      isActive,
      activatedAt: Number(activatedAt),
      totalAmount: totalAmount.toString(),
      activatedBy,
      activationReason,
    });
  } catch (error) {
    console.error("Error checking inheritance activation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
