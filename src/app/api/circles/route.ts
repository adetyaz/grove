import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// POST endpoint to store circle data after on-chain creation
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      targetAmount,
      paymentType,
      fixedAmount,
      deadline,
      transactionHash,
      onChainId,
      ownerWallet,
      ownerEmail,
    } = await req.json();

    console.log("Storing circle data:", {
      name,
      description,
      targetAmount,
      paymentType,
      fixedAmount,
      deadline,
      transactionHash,
      onChainId,
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

    // Store circle in database
    const circle = await prisma.circle.create({
      data: {
        name,
        description: description || "",
        targetAmount: targetAmount.toString(),
        paymentType: paymentType === 1 ? "RECURRING" : "ONETIME",
        fixedAmount: fixedAmount ? fixedAmount.toString() : null,
        deadline: new Date(Number(deadline) * 1000),
        transactionHash,
        onChainId: onChainId ? Number(onChainId) : null,
        ownerId: user.id,
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
    });
  } catch (error) {
    console.error("Error storing circle data:", error);
    return Response.json(
      { error: "Failed to store circle data", details: error },
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

    let whereClause = {};

    if (userWallet) {
      whereClause = { owner: { wallet: userWallet } };
    } else if (userEmail) {
      whereClause = { owner: { email: userEmail } };
    }

    const circles = await prisma.circle.findMany({
      where: whereClause,
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
