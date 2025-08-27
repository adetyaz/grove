import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Utility function to parse circle description that might be JSON
const parseCircleDescription = (description: string | null): string => {
  if (!description) return "";

  try {
    const parsed = JSON.parse(description);
    // If it's our JSON format, return just the description part
    if (typeof parsed === "object" && parsed.description !== undefined) {
      return parsed.description || "";
    }
    // If JSON parsing worked but it's not our format, return the original
    return description;
  } catch {
    // If JSON parsing fails, it's a plain string description
    return description;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const circleId = params.id;

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(circleId)) {
      return NextResponse.json(
        { error: "Invalid circle ID format" },
        { status: 400 }
      );
    }

    // Fetch circle from database using UUID
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
        invitations: {
          where: { status: "ACCEPTED" },
          select: {
            inviterWallet: true,
            recipientEmail: true,
            acceptedAt: true,
          },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    // Get real member list from UserActivity (where joins are logged)
    let memberCount = 1; // Creator is always a member
    const members: string[] = [circle.owner.wallet];
    const currentAmount = "0"; // Current amount from contributions

    // Get all users who joined this circle from UserActivity
    const joinActivities = await prisma.userActivity.findMany({
      where: {
        type: "circle_joined",
        metadata: {
          contains: `"circleId":"${circleId}"`,
        },
      },
      select: {
        userAddress: true,
      },
    });

    // Add joined members to the list (avoid duplicates)
    joinActivities.forEach((activity) => {
      const userAddress = activity.userAddress;
      if (!members.some(addr => addr.toLowerCase() === userAddress.toLowerCase())) {
        members.push(userAddress);
      }
    });

    memberCount = members.length;

    // Get contribution activities for this circle
    const contributionActivities = await prisma.userActivity.findMany({
      where: {
        type: "contribution",
        metadata: {
          contains: `"circleId":"${circleId}"`,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Parse contributions from activities
    const contributions = contributionActivities.map((activity) => {
      try {
        const metadata = JSON.parse(activity.metadata || "{}");
        return {
          id: activity.id,
          amount: metadata.amount || "0",
          contributor: activity.userAddress,
          timestamp: Math.floor(activity.timestamp.getTime() / 1000),
          txHash: metadata.txHash || "",
        };
      } catch (error) {
        console.error("Error parsing contribution metadata:", error);
        return {
          id: activity.id,
          amount: "0",
          contributor: activity.userAddress,
          timestamp: Math.floor(activity.timestamp.getTime() / 1000),
          txHash: "",
        };
      }
    });

    // Return circle data with proper format expected by frontend
    const circleData = {
      id: circle.id,
      onChainId: circle.onChainId || 0,
      name: circle.name,
      description: parseCircleDescription(circle.description),
      targetAmount: circle.targetAmount, // Raw string from DB
      currentAmount: currentAmount,
      deadline: Math.floor(Date.now() / 1000) + parseInt(circle.durationDays) * 24 * 60 * 60, // Unix timestamp as number
      isActive: circle.syncStatus === "SYNCED",
      syncStatus: circle.syncStatus,
      memberCount,
      members,
      creator: circle.owner.wallet,
      paymentType: circle.isPublic ? "public" : "private",
      contributionAmount: circle.contributionAmount, // Raw string from DB
      createdAt: circle.createdAt.toISOString(),
      owner: circle.owner,
      contributions,
    };

    return NextResponse.json({ circle: circleData });
  } catch (error) {
    console.error("Error fetching circle details:", error);
    return NextResponse.json(
      { error: "Failed to fetch circle details" },
      { status: 500 }
    );
  }
}
