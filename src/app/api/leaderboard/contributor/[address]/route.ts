import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
      include: {
        ownedCircles: true,
        memberCircles: true,
      },
    });

    // For now, return basic data since contribution tracking isn't fully implemented
    // In a real implementation, this would query the blockchain for actual contribution amounts
    const circlesCount = user
      ? user.ownedCircles.length + user.memberCircles.length
      : 0;

    return NextResponse.json({
      address,
      name: user?.name || null,
      totalContributed: "0", // Would be calculated from blockchain
      circlesCount,
    });
  } catch (error) {
    console.error("Error fetching contributor data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
