import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereClause: any = {};
    if (userAddress) {
      whereClause.userAddress = userAddress;
    }

    const violations = await prisma.userViolation.findMany({
      where: whereClause,
      include: {
        punishments: {
          orderBy: { appliedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      violations,
      total: violations.length,
    });
  } catch (error) {
    console.error("Failed to fetch violations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch violations" },
      { status: 500 }
    );
  }
}
