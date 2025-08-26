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

    // Get proposal voting info
    const votingInfo = (await publicClient.readContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: "getProposalVoting",
      args: [BigInt(proposalId)],
    })) as [bigint, bigint, bigint, boolean, boolean];

    const [votesFor, votesAgainst, votingEnds, executed, passed] = votingInfo;

    return NextResponse.json({
      votesFor: Number(votesFor),
      votesAgainst: Number(votesAgainst),
      votingEnds: Number(votingEnds),
      executed,
      passed,
    });
  } catch (error) {
    console.error("Error fetching proposal voting info:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal voting info" },
      { status: 500 }
    );
  }
}
