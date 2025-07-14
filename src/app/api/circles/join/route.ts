import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { circleId, address, email } = await request.json();

    console.log("🔄 Join request received:", { circleId, address, email });

    if (!circleId || !address || !email) {
      console.log("❌ Missing required fields:", { circleId, address, email });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Robust upsert for user (never throws on duplicate)
    console.log("👤 Creating/updating user...");
    const user = await prisma.user.upsert({
      where: { email },
      update: { wallet: address },
      create: { email, wallet: address },
    });
    console.log("✅ User created/updated:", { id: user.id, email: user.email });

    // Find the circle by id (UUID string) OR onChainId (number)
    console.log("🔍 Looking for circle with ID:", circleId);

    // First, try both UUID and onChainId search
    const circle = await prisma.circle.findFirst({
      where: {
        OR: [
          { id: circleId }, // Direct UUID match
          ...(!isNaN(Number(circleId)) && !circleId.includes("-")
            ? [{ onChainId: parseInt(circleId) }]
            : []), // onChainId number match only if it's numeric
        ],
      },
      include: { members: true },
    });

    console.log(
      "🔍 Search result:",
      circle
        ? {
            id: circle.id,
            name: circle.name,
            onChainId: circle.onChainId,
          }
        : "Not found"
    );

    if (!circle) {
      console.log("❌ Circle not found for ID:", circleId);
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    console.log("✅ Found circle:", {
      id: circle.id,
      name: circle.name,
      onChainId: circle.onChainId,
      memberCount: circle.members.length,
    });

    // Add user to members if not already present
    const alreadyMember = circle.members.some((m) => m.id === user.id);
    console.log("🔍 User membership check:", {
      userId: user.id,
      alreadyMember,
      existingMembers: circle.members.map((m) => ({
        id: m.id,
        email: m.email,
      })),
    });

    if (!alreadyMember) {
      console.log("➕ Adding user to circle...");
      try {
        await prisma.circle.update({
          where: { id: circle.id },
          data: {
            members: {
              connect: { id: user.id },
            },
          },
        });
        console.log("✅ User added to circle successfully");
      } catch (dbError) {
        console.error("❌ Database error adding user to circle:", dbError);
        // Even if DB fails, if user is on blockchain, we should handle gracefully
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
      console.log("ℹ️ User already a member, skipping add");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to join circle:", error);

    // More detailed error logging
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
