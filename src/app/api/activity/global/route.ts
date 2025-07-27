import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // const { searchParams } = new URL(request.url);
    // const type = searchParams.get("type"); // For future filtering

    // For now, return empty activities since the table doesn't exist yet
    // This will be populated once the Prisma migration is run
    return NextResponse.json({
      activities: [],
    });
  } catch (error) {
    console.error("Error fetching global activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
