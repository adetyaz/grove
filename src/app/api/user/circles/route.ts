import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
    }

    // Find circles where user is the owner
    const ownedCircles = await prisma.circle.findMany({
      where: {
        owner: {
          wallet,
        },
      },
      include: {
        owner: {
          select: {
            name: true,
            wallet: true,
          },
        },
      },
    });

    // For now, we'll only return owned circles
    // In production, you'd also fetch circles where the user is a member from the blockchain
    const circlesWithStats = ownedCircles.map((circle) => ({
      ...circle,
      memberCount: Math.floor(Math.random() * 10) + 1, // Mock member count
      currentAmount: (parseInt(circle.targetAmount) * (Math.random() * 0.8)).toString(), // Mock progress
      isOwner: true,
      status: Math.random() > 0.7 ? "completed" : "active", // Mock status
    }));

    return NextResponse.json({
      circles: circlesWithStats,
      total: circlesWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching user circles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user circles" },
      { status: 500 }
    );
  }
}
