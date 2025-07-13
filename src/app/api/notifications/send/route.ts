import { NextRequest, NextResponse } from "next/server";
import { circleNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { event, circleId, data } = await request.json();

    if (!event || !circleId) {
      return NextResponse.json(
        { error: "Missing event type or circleId" },
        { status: 400 }
      );
    }

    // Get circle data from database
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        owner: true,
        members: true,
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    let results;

    switch (event) {
      case "circle_created":
        results = await circleNotifications.sendCircleCreated({
          id: circle.id,
          name: circle.name,
          onChainId: circle.onChainId,
          owner: {
            email: circle.owner.email,
            name: circle.owner.name || undefined,
            wallet: circle.owner.wallet,
          },
          members: circle.members.map((member) => ({
            email: member.email,
            name: member.name || undefined,
            wallet: member.wallet,
          })),
        });
        break;

      case "circle_synced":
        if (!circle.onChainId) {
          return NextResponse.json(
            { error: "Circle not synced with contract" },
            { status: 400 }
          );
        }

        results = await circleNotifications.sendCircleSynced({
          id: circle.id,
          name: circle.name,
          onChainId: circle.onChainId,
          owner: {
            email: circle.owner.email,
            name: circle.owner.name || undefined,
          },
          members: circle.members.map((member) => ({
            email: member.email,
            name: member.name || undefined,
          })),
        });
        break;

      case "member_joined":
        const newMemberWallet = data?.memberWallet;
        if (!newMemberWallet) {
          return NextResponse.json(
            { error: "Missing member wallet address" },
            { status: 400 }
          );
        }

        // Find the new member
        const newMember = await prisma.user.findUnique({
          where: { wallet: newMemberWallet },
        });

        if (!newMember) {
          return NextResponse.json(
            { error: "New member not found" },
            { status: 404 }
          );
        }

        // Get existing members (excluding the new member)
        const existingMembers = circle.members.filter(
          (member) => member.wallet !== newMemberWallet
        );

        results = await circleNotifications.sendMemberJoined(
          {
            id: circle.id,
            name: circle.name,
            onChainId: circle.onChainId,
          },
          {
            email: newMember.email,
            name: newMember.name || undefined,
            wallet: newMember.wallet,
          },
          existingMembers.map((member) => ({
            email: member.email,
            name: member.name || undefined,
          }))
        );
        break;

      case "contribution_made":
        const contributorWallet = data?.contributorWallet;
        const amount = data?.amount;

        if (!contributorWallet || !amount) {
          return NextResponse.json(
            { error: "Missing contributor wallet or amount" },
            { status: 400 }
          );
        }

        // Find the contributor
        const contributor = await prisma.user.findUnique({
          where: { wallet: contributorWallet },
        });

        if (!contributor) {
          return NextResponse.json(
            { error: "Contributor not found" },
            { status: 404 }
          );
        }

        // Get all members except the contributor
        const recipients = circle.members.filter(
          (member) => member.wallet !== contributorWallet
        );

        results = await circleNotifications.sendContribution(
          {
            id: circle.id,
            name: circle.name,
            onChainId: circle.onChainId,
          },
          {
            email: contributor.email,
            name: contributor.name || undefined,
            wallet: contributor.wallet,
          },
          amount,
          recipients.map((member) => ({
            email: member.email,
            name: member.name || undefined,
          }))
        );
        break;

      case "send_invitation":
        const invitationData = data;
        if (!invitationData?.recipientEmail || !invitationData?.inviterName) {
          return NextResponse.json(
            { error: "Missing invitation data" },
            { status: 400 }
          );
        }

        results = await circleNotifications.sendInvitation({
          circleId: circle.id,
          circleName: circle.name,
          inviterName: invitationData.inviterName,
          inviterEmail: invitationData.inviterEmail,
          inviterAddress: invitationData.inviterAddress,
          recipientEmail: invitationData.recipientEmail,
          recipientTelegram: invitationData.recipientTelegram,
          recipientWhatsApp: invitationData.recipientWhatsApp,
          circleDescription: circle.description || undefined,
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown event type: ${event}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      event,
      circleId,
      results,
    });
  } catch (error) {
    console.error("❌ Notification API error:", error);
    return NextResponse.json(
      {
        error: "Failed to send notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
