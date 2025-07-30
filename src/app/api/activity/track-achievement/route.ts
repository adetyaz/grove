import { NextRequest, NextResponse } from "next/server";
import { logUserActivity } from "@/lib/activity-logger";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, achievementName, achievementId, description } = body;

    if (!userAddress || !achievementName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { wallet: userAddress.toLowerCase() },
      update: { lastActivityDate: new Date() },
      create: {
        wallet: userAddress.toLowerCase(),
        email: `${userAddress.toLowerCase()}@wallet.local`,
        lastActivityDate: new Date(),
      },
    });

    // Log the achievement activity
    await logUserActivity(
      userAddress,
      "achievement",
      description || `Unlocked "${achievementName}" achievement`,
      {
        achievementName,
        achievementId:
          achievementId || achievementName.toLowerCase().replace(/\s+/g, "_"),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking achievement:", error);
    return NextResponse.json(
      { error: "Failed to track achievement" },
      { status: 500 }
    );
  }
}
