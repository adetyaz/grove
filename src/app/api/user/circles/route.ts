import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log("Fetching circles for wallet:", walletAddress);

    // Find the actual user by wallet address from the schema
    const user = await prisma.user.findUnique({
      where: { wallet: walletAddress },
    });

    if (!user) {
      console.log("No user found for wallet:", walletAddress);
      return NextResponse.json({ circles: [] });
    }

    console.log("Found user:", user.id, user.email);

    // Get circles owned by this user
    const circles = await prisma.circle.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            wallet: true,
            email: true,
            name: true,
          },
        },
        invitations: {
          select: {
            recipientEmail: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found circles:", circles.length);

    return NextResponse.json(
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
    console.error("Error fetching user circles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user circles" },
      { status: 500 }
    );
  }
}
