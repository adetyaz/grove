import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logUserActivity } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    const { circleId, memberWallet } = await request.json();

    if (!circleId || !memberWallet) {
      return NextResponse.json(
        { error: "Missing circleId or memberWallet" },
        { status: 400 }
      );
    }

    // Validate that the circle exists
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        owner: true,
        members: true,
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Find the member by wallet address
    const member = await prisma.user.findUnique({
      where: { wallet: memberWallet },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if member is already in the circle
    const isAlreadyMember = circle.members.some(
      (m) => m.wallet.toLowerCase() === memberWallet.toLowerCase()
    );

    if (isAlreadyMember) {
      return NextResponse.json({
        success: true,
        message: "Member already in circle",
        alreadyMember: true,
      });
    }

    // Add member to the circle in database
    await prisma.circle.update({
      where: { id: circleId },
      data: {
        members: {
          connect: { id: member.id },
        },
      },
    });

    // Log circle join activity
    try {
      await logUserActivity(
        memberWallet,
        "circle_joined",
        `Joined savings circle "${circle.name}"`,
        {
          circleName: circle.name,
          circleId: circle.id,
        }
      );
    } catch (activityError) {
      console.error("Error logging circle join activity:", activityError);
      // Don't fail join if activity logging fails
    }

    // Send member joined notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "member_joined",
          circleId,
          data: {
            memberWallet,
          },
        }),
      });
    } catch (notificationError) {
      console.warn(
        "⚠️ Failed to send member joined notification:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member added to circle successfully",
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        wallet: member.wallet,
      },
    });
  } catch (error) {
    console.error("❌ Error in member join:", error);
    return NextResponse.json(
      {
        error: "Failed to join member to circle",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
