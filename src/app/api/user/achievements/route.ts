import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { citreaTestnet } from "viem/chains";
import {
  ACHIEVEMENTS_CONTRACT_ADDRESS,
  ACHIEVEMENTS_ABI,
} from "@/lib/contracts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("address");

    if (!userAddress) {
      return NextResponse.json(
        { error: "Address parameter required" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: citreaTestnet,
      transport: http(),
    });

    // Get total achievement types from contract
    const totalTypes = (await publicClient.readContract({
      address: ACHIEVEMENTS_CONTRACT_ADDRESS,
      abi: ACHIEVEMENTS_ABI,
      functionName: "totalAchievementTypes",
    })) as bigint;

    // Get user progress from contract
    const userProgressData = (await publicClient.readContract({
      address: ACHIEVEMENTS_CONTRACT_ADDRESS,
      abi: ACHIEVEMENTS_ABI,
      functionName: "getUserProgress",
      args: [userAddress],
    })) as [bigint, bigint, bigint, bigint, bigint, bigint];

    // Get user unlocked achievements
    const userTokensData = (await publicClient.readContract({
      address: ACHIEVEMENTS_CONTRACT_ADDRESS,
      abi: ACHIEVEMENTS_ABI,
      functionName: "getUserTokens",
      args: [userAddress],
    })) as bigint[];

    const unlockedAchievementIds = new Set(
      userTokensData.map((id) => Number(id))
    );

    // Fetch each achievement type and calculate progress
    const achievements = [];
    for (let i = 0; i < Number(totalTypes); i++) {
      try {
        const achievementType = (await publicClient.readContract({
          address: ACHIEVEMENTS_CONTRACT_ADDRESS,
          abi: ACHIEVEMENTS_ABI,
          functionName: "achievementTypes",
          args: [BigInt(i)],
        })) as any[];

        if (!achievementType[5]) continue; // Skip if not exists

        const name = achievementType[0];
        const description = achievementType[1];
        const icon = achievementType[2];
        const threshold = Number(achievementType[3]);
        const category = achievementType[4];

        // Calculate progress based on category and user data
        let currentValue = 0;
        switch (category) {
          case "contribution":
            currentValue = Number(userProgressData[0]) / 1e18; // Convert from wei to BTC
            break;
          case "social":
            if (name.includes("Invited")) {
              currentValue = Number(userProgressData[2]); // invitesSent
            } else if (name.includes("Joined")) {
              currentValue = Number(userProgressData[1]); // circlesJoined
            }
            break;
          case "streak":
            currentValue = Number(userProgressData[3]); // currentStreak
            break;
          case "milestone":
            if (name.includes("contribution")) {
              currentValue = Number(userProgressData[0]) / 1e18; // Convert from wei to BTC
            } else {
              currentValue = 1; // For binary milestones like "First Steps"
            }
            break;
        }

        const progress = Math.min((currentValue / threshold) * 100, 100);
        const unlocked = progress >= 100; // Mark as unlocked when progress reaches 100%
        const nftClaimed = unlockedAchievementIds.has(i); // Separate flag for NFT status

        achievements.push({
          id: i.toString(),
          name,
          description,
          icon,
          category,
          progress: Math.round(progress),
          threshold,
          unlocked,
          nftClaimed,
        });
      } catch (error) {
        console.error(`Error fetching achievement ${i}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      achievements,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
