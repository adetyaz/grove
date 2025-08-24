import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import {
  CITREA_TESTNET,
  ACHIEVEMENTS_CONTRACT_ADDRESS,
} from "@/lib/contracts";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, achievementIds } = await request.json();

    if (!userAddress || !achievementIds || !Array.isArray(achievementIds)) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: userAddress and achievementIds array",
        },
        { status: 400 }
      );
    }

  
    // Create viem client to read contract data
    const client = createPublicClient({
      chain: CITREA_TESTNET,
      transport: http(),
    });

    const claimableAchievements = [];
    const alreadyMinted = [];
    const notEarned = [];

    // Check each achievement ID
    for (const achievementId of achievementIds) {
      try {
        // First check if they earned it in our database
        const earned = await prisma.userActivity.findFirst({
          where: {
            userAddress: userAddress.toLowerCase(),
            type: "achievement_earned",
            metadata: {
              contains: `"achievementId":${achievementId}`,
            },
          },
        });

        if (!earned) {
          notEarned.push({
            id: achievementId,
            claimable: false,
            reason: "Achievement not earned according to activity records",
          });
          continue;
        }

        // Check if user already has this achievement NFT
        let hasNFT = false;
        try {
          // Check AchievementNFT contract directly for hasAchievement
          hasNFT = await client.readContract({
            address: "0x30325a1fF2361F72059191aD4Cb97599442B3247",
            abi: [
              {
                inputs: [
                  { name: "user", type: "address" },
                  { name: "achievementId", type: "uint256" },
                ],
                name: "hasAchievement",
                outputs: [{ name: "", type: "bool" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "hasAchievement",
            args: [userAddress, BigInt(achievementId)],
          });
        } catch (nftError) {
          console.warn(
            `Error checking NFT status for ${achievementId}:`,
            nftError
          );
          // If we can't check NFT status, assume it's not minted
          hasNFT = false;
        }

        if (hasNFT) {
          alreadyMinted.push({
            id: achievementId,
            claimable: false,
            reason: "Achievement NFT already minted",
          });
        } else {
          claimableAchievements.push({
            id: achievementId,
            claimable: true,
            reason: "Achievement earned and ready to claim",
          });
        }
      } catch (error) {
        console.error(`Error checking achievement ${achievementId}:`, error);
        notEarned.push({
          id: achievementId,
          claimable: false,
          reason: `Error checking achievement: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }

    const response = {
      success: true,
      userAddress,
      claimableAchievements,
      alreadyMinted,
      notEarned,
      summary: {
        total: achievementIds.length,
        claimable: claimableAchievements.length,
        alreadyMinted: alreadyMinted.length,
        notEarned: notEarned.length,
      },
      contractAddress: ACHIEVEMENTS_CONTRACT_ADDRESS,
      instructions:
        claimableAchievements.length > 0
          ? "Call claimAchievement(achievementId) on the contract for each claimable achievement"
          : "No achievements ready to claim",
    };

   

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking claimable achievements:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
