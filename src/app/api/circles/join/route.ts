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

    const user = await prisma.user.upsert({
      where: { email },
      update: { wallet: address },
      create: { email, wallet: address },
    });

    const circle = await prisma.circle.findFirst({
      where: {
        OR: [
          { id: circleId },
          ...(!isNaN(Number(circleId)) && !circleId.includes("-")
            ? [{ onChainId: parseInt(circleId) }]
            : []),
        ],
      },
      include: { members: true },
    });

    if (!circle) {
      console.log("❌ Circle not found for ID:", circleId);
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Add user to members if not already present
    const alreadyMember = circle.members.some((m) => m.id === user.id);

    if (!alreadyMember) {
      try {
        await prisma.circle.update({
          where: { id: circle.id },
          data: {
            members: {
              connect: { id: user.id },
            },
          },
        });
      } catch (dbError) {
        return NextResponse.json(
          {
            error: "Database sync failed but you may already be a member",
            details:
              dbError instanceof Error ? dbError.message : String(dbError),
          },
          { status: 500 }
        );
      }
    } else {
      console.log("User already a member");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to join circle:", error);

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to join circle",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
