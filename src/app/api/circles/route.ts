import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { logUserActivity } from "@/lib/activity-logger";

// POST endpoint to store circle data BEFORE on-chain creation
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      targetAmount,
      paymentType,
      fixedAmount,
      frequency,
      deadline,
      ownerWallet,
      ownerEmail,
      punishmentPreset,
    } = await req.json();

    

    // First, ensure the user exists in database
    let user = await prisma.user.findUnique({
      where: { wallet: ownerWallet },
    });

    if (!user) {
      // Create user if they don't exist, always use the actual email from Dynamic
      if (!ownerEmail) {
        throw new Error(
          "Owner email is required and must be provided by Dynamic."
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

    // Create circle in database
    const circle = await prisma.circle.create({
      data: {
        name,
        description: description || "",
        targetAmount: targetAmount.toString(),
        paymentType: paymentType === 1 ? "RECURRING" : "ONETIME",
        fixedAmount: fixedAmount ? fixedAmount.toString() : null,
        frequency: paymentType === 1 ? frequency : null,
        deadline: new Date(Number(deadline) * 1000),
        ownerId: user.id,
        syncStatus: "PENDING",
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
      },
    });

    // Log circle creation activity
    try {
      await logUserActivity(
        ownerWallet,
        "circle_created",
        `Created savings circle "${name}"`,
        {
          circleName: name,
          circleId: circle.id,
          targetAmount: targetAmount.toString(),
          paymentType: paymentType === 1 ? "RECURRING" : "ONETIME",
        }
      );
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

    // Find all circles where user is owner or member
    const circles = await prisma.circle.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
        members: {
          select: { id: true, email: true, name: true, wallet: true },
        },
        invitations: {
          where: { status: "ACCEPTED" },
          select: {
            acceptedByWalletAddress: true,
            acceptedByEmail: true,
            acceptedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ circles });
  } catch (error) {
    console.error("Error fetching circles:", error);
    return Response.json({ error: "Failed to fetch circles" }, { status: 500 });
  }
}
