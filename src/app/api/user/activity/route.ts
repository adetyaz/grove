import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

    // Get user to check if they exist
    const user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ activities: [] });
    }

    const activities = [];

    // Get recent circle creations
    const recentCircles = await prisma.circle.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    for (const circle of recentCircles) {
      activities.push({
        id: `circle-${circle.id}`,
        type: "circle_created",
        title: "Circle Created",
        description: `Created savings circle "${circle.name}"`,
        timestamp: circle.createdAt,
        icon: "🌳",
        color: "primary",
      });
    }

    // Get recent invitations sent
    const recentInvites = await prisma.circleInvitation.findMany({
      where: {
        inviterEmail: user.email,
        status: "ACCEPTED",
      },
      orderBy: { acceptedAt: "desc" },
      take: 5,
      include: {
        circle: {
          select: { name: true },
        },
      },
    });

    for (const invite of recentInvites) {
      if (invite.acceptedAt) {
        activities.push({
          id: `invite-${invite.id}`,
          type: "invitation_accepted",
          title: "Invitation Accepted",
          description: `${invite.inviteeEmail || "Someone"} joined "${
            invite.circle.name
          }"`,
          timestamp: invite.acceptedAt,
          icon: "🎉",
          color: "secondary",
        });
      }
    }

    // Get recent circle joins
    const recentJoins = await prisma.circleInvitation.findMany({
      where: {
        OR: [
          { inviteeEmail: user.email },
          { inviteeWalletAddress: address.toLowerCase() },
        ],
        status: "ACCEPTED",
      },
      orderBy: { acceptedAt: "desc" },
      take: 3,
      include: {
        circle: {
          select: { name: true },
        },
      },
    });

    for (const join of recentJoins) {
      if (join.acceptedAt) {
        activities.push({
          id: `join-${join.id}`,
          type: "circle_joined",
          title: "Joined Circle",
          description: `Joined savings circle "${join.circle.name}"`,
          timestamp: join.acceptedAt,
          icon: "🤝",
          color: "trust",
        });
      }
    }

    // Sort all activities by timestamp and take the most recent 10
    const sortedActivities = activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({ activities: sortedActivities });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
