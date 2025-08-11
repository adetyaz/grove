import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const appeals = await prisma.punishmentAppeal.findMany({
      include: {
        punishment: {
          select: {
            type: true,
            description: true,
            userAddress: true,
            circleId: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      appeals,
    });
  } catch (error) {
    console.error("Failed to fetch appeals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch appeals" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { appealId, action, reviewedBy, reviewNotes } = await request.json();

    if (!appealId || !action || !reviewedBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const appeal = await prisma.punishmentAppeal.update({
      where: { id: appealId },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes,
      },
    });

    // If approved, overturn the punishment
    if (action === "approve") {
      await prisma.userPunishment.update({
        where: { id: appeal.punishmentId },
        data: { status: "OVERTURNED" },
      });
    }

    return NextResponse.json({
      success: true,
      appeal,
    });
  } catch (error) {
    console.error("Failed to process appeal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process appeal" },
      { status: 500 }
    );
  }
}
