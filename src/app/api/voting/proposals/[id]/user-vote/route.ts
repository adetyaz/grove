import { NextRequest, NextResponse } from "next/server";
import { getPublicClient } from "@/lib/clients";
import { VOTING_CONTRACT_ADDRESS, VOTING_ABI } from "@/lib/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const voter = searchParams.get('voter');
    
    if (isNaN(proposalId)) {
      return NextResponse.json(
        { error: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    if (!voter) {
      return NextResponse.json({
        voted: false,
        choice: false,
      });
    }

    const publicClient = getPublicClient();

    // Get user vote info
    const userVote = await publicClient.readContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: "getUserVote",
      args: [BigInt(proposalId), voter as `0x${string}`],
    }) as [boolean, boolean];

    const [voted, choice] = userVote;

    return NextResponse.json({
      voted,
      choice,
    });
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return NextResponse.json(
      { error: "Failed to fetch user vote" },
      { status: 500 }
    );
  }
}
