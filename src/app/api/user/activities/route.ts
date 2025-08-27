import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    const activities = await prisma.userActivity.findMany({
      where: {
        userAddress: wallet,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      activities,
      total: activities.length,
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activities" },
      { status: 500 }
    );
  }
}
