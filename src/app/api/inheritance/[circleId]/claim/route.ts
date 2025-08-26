import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { CITREA_TESTNET } from "@/lib/contracts";
import { INHERITANCE_CONTRACT_ADDRESS, INHERITANCE_ABI } from "@/lib/contracts";

const publicClient = createPublicClient({
  chain: CITREA_TESTNET,
  transport: http(),
});

// POST /api/inheritance/[circleId]/claim - Claim inheritance as a beneficiary
export async function POST(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { deceasedAddress, beneficiaryAddress } = await request.json();
    const circleId = parseInt(params.circleId);

    if (!deceasedAddress || !beneficiaryAddress) {
      return NextResponse.json({ error: "Deceased and beneficiary addresses required" }, { status: 400 });
    }

    // Check claimable amount
    const claimableAmount = await publicClient.readContract({
      address: INHERITANCE_CONTRACT_ADDRESS as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: "getClaimableAmount",
      args: [circleId, deceasedAddress, beneficiaryAddress],
    });

    if (claimableAmount === 0n) {
      return NextResponse.json({ error: "No inheritance to claim" }, { status: 400 });
    }

    // Return transaction data for frontend to execute
    return NextResponse.json({
      success: true,
      claimableAmount: claimableAmount.toString(),
      transactionData: {
        contractAddress: INHERITANCE_CONTRACT_ADDRESS,
        functionName: "claimInheritance",
        args: [circleId, deceasedAddress],
        abi: INHERITANCE_ABI,
      },
    });
  } catch (error) {
    console.error("Error claiming inheritance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/inheritance/[circleId]/claim?deceased=address&beneficiary=address - Check claimable amount
export async function GET(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const deceasedAddress = searchParams.get("deceased");
    const beneficiaryAddress = searchParams.get("beneficiary");
    const circleId = parseInt(params.circleId);

    if (!deceasedAddress || !beneficiaryAddress) {
      return NextResponse.json({ error: "Deceased and beneficiary addresses required" }, { status: 400 });
    }

    // Check claimable amount
    const claimableAmount = await publicClient.readContract({
      address: INHERITANCE_CONTRACT_ADDRESS as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: "getClaimableAmount",
      args: [circleId, deceasedAddress, beneficiaryAddress],
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
      claimableAmount: claimableAmount.toString(),
      isActive,
      activatedAt: Number(activatedAt),
      totalAmount: totalAmount.toString(),
      activatedBy,
      activationReason,
    });
  } catch (error) {
    console.error("Error checking inheritance claim:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
