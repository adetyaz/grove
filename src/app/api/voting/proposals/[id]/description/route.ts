import { NextRequest, NextResponse } from "next/server";
import { getPublicClient } from "@/lib/clients";
import { VOTING_CONTRACT_ADDRESS, VOTING_ABI } from "@/lib/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = parseInt(params.id);
    
    if (isNaN(proposalId)) {
      return NextResponse.json(
        { error: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    const publicClient = getPublicClient();

    // Get proposal description
    const description = await publicClient.readContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: "getProposalDescription",
      args: [BigInt(proposalId)],
    }) as string;

    return NextResponse.json({
      description,
    });
  } catch (error) {
    console.error("Error fetching proposal description:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal description" },
      { status: 500 }
    );
  }
}
