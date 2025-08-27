import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { logUserActivity } from "@/lib/activity-logger";

// POST endpoint to save circle data AFTER blockchain deployment
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      targetAmount,
      ownerWallet,
      ownerEmail,
      contributionAmount,
      contributionInterval,
      durationDays,
      isPublic,
      // REQUIRED blockchain data
      onChainId,
      transactionHash,
    } = await req.json();

    // Validate required blockchain data - must be real values
    if (
      !onChainId ||
      !transactionHash ||
      onChainId <= 0 ||
      transactionHash.length < 10
    ) {
      return Response.json(
        {
          error:
            "Circle must be deployed to blockchain first with valid onChainId and transactionHash",
        },
        { status: 400 }
      );
    }

    // First, ensure the user exists in database
    let user = await prisma.user.findUnique({
      where: { wallet: ownerWallet },
    });

    if (!user) {
      if (!ownerEmail) {
        return Response.json(
          { error: "Owner email is required for new users" },
          { status: 400 }
        );
      }
      user = await prisma.user.create({
        data: {
          wallet: ownerWallet,
          email: ownerEmail,
          name: `User ${ownerWallet.slice(0, 6)}`,
        },
      });
    }

    // Create circle in database with blockchain data
    const circle = await prisma.circle.create({
      data: {
        name,
        description: description || "",
        targetAmount: targetAmount.toString(),
        contributionAmount: contributionAmount.toString(),
        contributionInterval: contributionInterval.toString(),
        durationDays: durationDays.toString(),
        isPublic: Boolean(isPublic),
        ownerId: user.id,
        onChainId: onChainId,
        transactionHash: transactionHash,
        syncStatus: "SYNCED", // Mark as synced since we have valid blockchain data
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
      },
    });

    // Log circle creation activity
    try {
      await logUserActivity(ownerWallet, "circle_created", {
        circleName: name,
        circleId: circle.id,
        targetAmount: targetAmount.toString(),
        contributionAmount: contributionAmount.toString(),
        durationDays: durationDays.toString(),
        isPublic: Boolean(isPublic),
      });
    } catch (activityError) {
      console.error("Error logging circle creation activity:", activityError);
      // Don't fail circle creation if activity logging fails
    }

    return Response.json({
      success: true,
      circle,
      databaseId: circle.id,
    });
  } catch (error) {
    console.error("Error creating circle in database:", error);
    return Response.json(
      { error: "Failed to create circle", details: error },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch circles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");
    const userEmail = searchParams.get("userEmail");

    if (!userWallet && !userEmail) {
      // No user context, return nothing
      return Response.json({ circles: [] });
    } // Find the user by wallet or email

    const userOr: any[] = [];
    if (userWallet) userOr.push({ wallet: userWallet });
    if (userEmail) userOr.push({ email: userEmail });

    const user = await prisma.user.findFirst({
      where: { OR: userOr },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ circles: [] });
    }

    // Find all circles where user is owner
    const circles = await prisma.circle.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
        invitations: {
          where: { status: "ACCEPTED" },
          select: {
            recipientEmail: true,
            acceptedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      { circles },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching circles:", error);
    return Response.json({ error: "Failed to fetch circles" }, { status: 500 });
  }
}
