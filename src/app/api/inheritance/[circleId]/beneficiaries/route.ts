import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { CITREA_TESTNET } from "@/lib/contracts";
import { INHERITANCE_CONTRACT_ADDRESS, INHERITANCE_ABI } from "@/lib/contracts";

const publicClient = createPublicClient({
  chain: CITREA_TESTNET,
  transport: http(),
});

// POST /api/inheritance/[circleId]/beneficiaries - Set beneficiaries for inheritance
export async function POST(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { beneficiaries, userAddress } = await request.json();
    const circleId = parseInt(params.circleId);

    if (!beneficiaries || !Array.isArray(beneficiaries)) {
      return NextResponse.json({ error: "Invalid beneficiaries data" }, { status: 400 });
    }

    if (!userAddress) {
      return NextResponse.json({ error: "User address required" }, { status: 400 });
    }

    // Validate beneficiaries format and total shares
    let totalShares = 0;
    for (const beneficiary of beneficiaries) {
      if (!beneficiary.beneficiary || !beneficiary.share) {
        return NextResponse.json({ error: "Each beneficiary must have address and share" }, { status: 400 });
      }
      totalShares += parseInt(beneficiary.share);
    }

    if (totalShares !== 10000) {
      return NextResponse.json({ error: "Total shares must equal 10000 (100%)" }, { status: 400 });
    }

    // Extract addresses and shares for contract call
    const beneficiaryAddresses = beneficiaries.map((b: any) => b.beneficiary);
    const beneficiaryShares = beneficiaries.map((b: any) => parseInt(b.share));

    // Return the transaction data for the frontend to execute
    return NextResponse.json({
      success: true,
      transactionData: {
        contractAddress: INHERITANCE_CONTRACT_ADDRESS,
        functionName: "setBeneficiaries",
        args: [circleId, beneficiaryAddresses, beneficiaryShares],
        abi: INHERITANCE_ABI,
      },
    });
  } catch (error) {
    console.error("Error setting beneficiaries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/inheritance/[circleId]/beneficiaries?member=address - Get beneficiaries for a member
export async function GET(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const memberAddress = searchParams.get("member");
    const circleId = parseInt(params.circleId);

    if (!memberAddress) {
      return NextResponse.json({ error: "Member address required" }, { status: 400 });
    }

    // Read beneficiaries from contract
    const result = await publicClient.readContract({
      address: INHERITANCE_CONTRACT_ADDRESS as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: "getBeneficiaries",
      args: [circleId, memberAddress],
    }) as [string[], bigint[]];

    const [addresses, shares] = result;
    
    const beneficiaries = addresses.map((address, index) => ({
      beneficiary: address,
      share: Number(shares[index]),
    }));

    return NextResponse.json({
      beneficiaries,
      totalShares: beneficiaries.reduce((sum, b) => sum + b.share, 0),
    });
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
