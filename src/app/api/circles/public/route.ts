import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
      whereClause.isPublic = true;
    } else if (filter === "private") {
      whereClause.isPublic = false;
    }

    // Apply search
    if (search) {
      whereClause.OR = [
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
      ];
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

    // For each circle, we would normally fetch member count and current amount from blockchain
    // For now, we'll return mock data. In production, you'd integrate with Grove contract
    const circlesWithStats = circles.map((circle) => ({
      ...circle,
      memberCount: Math.floor(Math.random() * 10) + 1, // Mock member count
      currentAmount: (parseInt(circle.targetAmount) * (Math.random() * 0.8)).toString(), // Mock progress
    }));

    // If no circles found, return some sample circles for demo purposes
    if (circlesWithStats.length === 0) {
      const sampleCircles = [
        {
          id: "sample-1",
          onChainId: 1,
          name: "Bitcoin Hodlers Club",
          description: "Long-term Bitcoin savings for serious investors",
          targetAmount: "100000000", // 1 BTC
          contributionAmount: "1000000", // 0.01 BTC
          contributionInterval: "2592000", // 30 days
          durationDays: "365",
          isPublic: true,
          memberCount: 8,
          currentAmount: "65000000", // 0.65 BTC
          createdAt: new Date().toISOString(),
          owner: {
            name: "Satoshi Nakamoto",
            wallet: "0x1234567890123456789012345678901234567890",
          },
        },
        {
          id: "sample-2",
          onChainId: 2,
          name: "Emergency Fund Squad",
          description: "Building emergency funds together, one satoshi at a time",
          targetAmount: "50000000", // 0.5 BTC
          contributionAmount: "500000", // 0.005 BTC
          contributionInterval: "604800", // 7 days
          durationDays: "180",
          isPublic: true,
          memberCount: 12,
          currentAmount: "32000000", // 0.32 BTC
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          owner: {
            name: "Alice Cooper",
            wallet: "0x2345678901234567890123456789012345678901",
          },
        },
        {
          id: "sample-3",
          onChainId: 3,
          name: "DCA Masters",
          description: "Dollar cost averaging into Bitcoin with discipline",
          targetAmount: "200000000", // 2 BTC
          contributionAmount: "2000000", // 0.02 BTC
          contributionInterval: "1209600", // 14 days
          durationDays: "730",
          isPublic: true,
          memberCount: 6,
          currentAmount: "28000000", // 0.28 BTC
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          owner: {
            name: "Bob Builder",
            wallet: "0x3456789012345678901234567890123456789012",
          },
        },
      ];

      return NextResponse.json({
        circles: sampleCircles,
        total: sampleCircles.length,
      });
    }

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
