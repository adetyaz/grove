import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPublicClient, http } from "viem";
import { citreaTestnet } from "viem/chains";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/lib/contracts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const sort = searchParams.get("sort") || "latest";
    const search = searchParams.get("search") || "";

    // Build where clause
    let whereClause: any = {
      syncStatus: "SYNCED", // Only show synced circles
    };

    // Apply filter
    if (filter === "public") {
      whereClause = { ...whereClause, isPublic: true };
    } else if (filter === "private") {
      whereClause = { ...whereClause, isPublic: false };
    }

    // Apply search
    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "amount_high":
        orderBy = { targetAmount: "desc" };
        break;
      case "amount_low":
        orderBy = { targetAmount: "asc" };
        break;
      case "duration_short":
        orderBy = { durationDays: "asc" };
        break;
      case "duration_long":
        orderBy = { durationDays: "desc" };
        break;
      case "popular":
        // For now, order by creation date. Later we can add member count
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const circles = await prisma.circle.findMany({
      where: whereClause,
      orderBy,
      include: {
        owner: {
          select: {
            name: true,
            wallet: true,
          },
        },
      },
      take: 50, // Limit to 50 circles for performance
    });

    // Get real blockchain data for each circle
    const publicClient = createPublicClient({
      chain: citreaTestnet,
      transport: http(),
    });

    const circlesWithStats = await Promise.all(
      circles.map(async (circle) => {
        let memberCount = 1; // Creator is always a member
        let currentAmount = "0";

        if (circle.onChainId) {
          try {
            // Get circle data from blockchain
            const circleData = await publicClient.readContract({
              address: GROVE_CONTRACT_ADDRESS,
              abi: GROVE_ABI,
              functionName: "getCircle",
              args: [BigInt(circle.onChainId)],
            }) as any[];
            
            // Extract data from contract response
            // Index 11 is members array, index 5 is currentAmount (wrong - checking the ABI again)
            const members = circleData[11] as string[] || [];
            memberCount = members.length;
            
            // Current amount might be calculated from contributions, for now use 0
            currentAmount = "0"; // TODO: Calculate from contributions
          } catch (error) {
            console.error(`Error fetching blockchain data for circle ${circle.onChainId}:`, error);
            // Keep default values if blockchain call fails
          }
        }

        return {
          ...circle,
          memberCount,
          currentAmount,
        };
      })
    );

    return NextResponse.json({
      circles: circlesWithStats,
      total: circlesWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching public circles:", error);
    return NextResponse.json(
      { error: "Failed to fetch circles" },
      { status: 500 }
    );
  }
}
