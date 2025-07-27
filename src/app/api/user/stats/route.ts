import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Get user's profile and statistics
    const user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
      include: {
        ownedCircles: true,
        memberCircles: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        totalContributed: "0",
        totalContributions: 0,
        circlesCompleted: 0,
        currentStreak: 0,
        invitedMembers: 0,
        activeCircles: 0,
      });
    }

    // Since contribution tracking isn't fully implemented in the database yet,
    // we'll return calculated values based on available data
    const totalCircles = user.ownedCircles.length + user.memberCircles.length;
    const activeCircles = totalCircles; // Assume all circles are active for now
    
    // Calculate streak based on active circles (simplified)
    const currentStreak = Math.min(activeCircles, 7);

    // Count invited members from CircleInvitation table
    const invitedMembers = await prisma.circleInvitation.count({
      where: {
        inviterEmail: user.email,
        status: "ACCEPTED"
      }
    });

    return NextResponse.json({
      totalContributed: "0", // Will be calculated from blockchain data
      totalContributions: 0, // Will be calculated from blockchain data
      circlesCompleted: 0,   // Will be calculated from circle progress
      currentStreak,
      invitedMembers,
      activeCircles,
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
