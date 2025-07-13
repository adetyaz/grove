import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { circleId, address, email } = await request.json();
    if (!circleId || !address || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Robust upsert for user (never throws on duplicate)
    const user = await prisma.user.upsert({
      where: { email },
      update: { wallet: address },
      create: { email, wallet: address },
    });

    // Find the circle by id or onChainId
    const circle = await prisma.circle.findFirst({
      where: {
        OR: [
          { id: typeof circleId === "string" ? parseInt(circleId) : circleId },
          {
            onChainId:
              typeof circleId === "string" ? parseInt(circleId) : circleId,
          },
        ],
      },
      include: { members: true },
    });
    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Add user to members if not already present
    const alreadyMember = circle.members.some((m) => m.id === user.id);
    if (!alreadyMember) {
      await prisma.circle.update({
        where: { id: circle.id },
        data: {
          members: {
            connect: { id: user.id },
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to join circle", error);
    return NextResponse.json(
      { error: "Failed to join circle" },
      { status: 500 }
    );
  }
}
