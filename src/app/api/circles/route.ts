import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// POST endpoint to store circle data BEFORE on-chain creation
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      targetAmount,
      paymentType,
      fixedAmount,
      deadline,
      ownerWallet,
      ownerEmail,
    } = await req.json();

    console.log("Creating circle in database:", {
      name,
      description,
      targetAmount,
      paymentType,
      fixedAmount,
      deadline,
      ownerWallet,
      ownerEmail,
    });

    // First, ensure the user exists in our database
    let user = await prisma.user.findUnique({
      where: { wallet: ownerWallet },
    });

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          wallet: ownerWallet,
          email: ownerEmail || `${ownerWallet}@temp.com`, // Temporary email
          name: `User ${ownerWallet.slice(0, 6)}`, // Default name
        },
      });
    }

    // Create circle in database with UUID, but no onChainId yet
    const circle = await prisma.circle.create({
      data: {
        name,
        description: description || "",
        targetAmount: targetAmount.toString(),
        paymentType: paymentType === 1 ? "RECURRING" : "ONETIME",
        fixedAmount: fixedAmount ? fixedAmount.toString() : null,
        deadline: new Date(Number(deadline) * 1000),
        ownerId: user.id,
        syncStatus: "PENDING", // Will be updated after blockchain transaction
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, wallet: true },
        },
      },
    });

    return Response.json({
      success: true,
      circle,
      databaseId: circle.id, // Return UUID for frontend to track
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
    }

    // Find the user by wallet or email
    // Build user OR clause safely (no undefined)
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
