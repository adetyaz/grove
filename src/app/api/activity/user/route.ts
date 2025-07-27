import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const type = searchParams.get("type");

    if (!address) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    // Build the where clause
    const whereClause: any = {
      userAddress: address.toLowerCase(),
    };

    if (type) {
      whereClause.type = type;
    }

    // Fetch activities from the database
    const activities = await prisma.userActivity.findMany({
      where: whereClause,
      orderBy: {
        timestamp: "desc",
      },
      take: 50, // Limit to last 50 activities
    });

    return NextResponse.json({
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        userAddress: activity.userAddress,
        timestamp: activity.timestamp.toISOString(),
        description: activity.description,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
