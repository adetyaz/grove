import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    console.log("Global activity API called with type:", type);

    const whereClause: any = {};
    if (type) {
      whereClause.type = type;
    }

    console.log("Where clause:", whereClause);

    // Fetch global activities from the database
    const activities = await prisma.userActivity.findMany({
      where: whereClause,
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
    });

    console.log("Found activities:", activities.length);

    // fetch user data for each activity
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { wallet: activity.userAddress },
            select: {
              email: true,
              name: true,
              wallet: true,
            },
          });
        } catch (error) {
          console.log("User not found for address:", activity.userAddress);
        }

        return {
          id: activity.id,
          type: activity.type,
          userAddress: activity.userAddress,
          timestamp: activity.timestamp.toISOString(),
          description: activity.description,
          metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
          user,
        };
      })
    );

    return NextResponse.json({
      activities: activitiesWithUsers,
    });
  } catch (error) {
    console.error("Error fetching global activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
