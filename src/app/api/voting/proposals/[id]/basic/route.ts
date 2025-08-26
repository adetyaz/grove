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

    // Get proposal basic info
    const basicInfo = (await publicClient.readContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: "getProposalBasics",
      args: [BigInt(proposalId)],
    })) as [bigint, string, string, bigint];

    const [circleId, proposer, recipient, amount] = basicInfo;

    return NextResponse.json({
      circleId: Number(circleId),
      proposer,
      recipient,
      amount: amount.toString(),
    });
  } catch (error) {
    console.error("Error fetching proposal basic info:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal basic info" },
      { status: 500 }
    );
  }
}
