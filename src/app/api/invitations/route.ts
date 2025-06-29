import { NextRequest, NextResponse } from "next/server";
import { resend, createCircleInviteEmail } from "@/lib/resend";
import { prisma } from "@/lib/db";
import {
  groveContract,
  formatBTCAmount,
  formatDeadline,
} from "@/lib/grove-contract";
import { getDynamicUser } from "@/lib/dynamic";

// Type for invitation with circle data
interface InvitationWithCircle {
  id: string;
  circleId: number;
  inviterEmail: string;
  inviteeEmail: string | null;
  inviteeWalletAddress: string | null;
  inviteType: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt: Date | null;
  acceptedByEmail: string | null;
  acceptedByWalletAddress: string | null;
  circle: {
    id: number;
    name: string;
    description: string | null;
    targetAmount: string;
    deadline: Date;
  };
}

export async function POST(req: NextRequest) {
  try {
    const {
      circleId,
      inviteeEmail,
      inviteeWalletAddress,
      inviterEmail,
      inviteType = "email", // 'email' or 'wallet'
    } = await req.json();

    if (
      !circleId ||
      (!inviteeEmail && !inviteeWalletAddress) ||
      !inviterEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get inviter details
    const inviter = await getDynamicUser(inviterEmail);
    if (!inviter) {
      return NextResponse.json({ error: "Inviter not found" }, { status: 404 });
    }

    // Get circle details from contract
    const circle = await groveContract.getCircle(Number(circleId));
    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Check if inviter is the circle owner or member
    const isOwner =
      circle.owner.toLowerCase() === inviter.address?.toLowerCase();
    const isMember = await groveContract.isCircleMember(
      Number(circleId),
      inviter.address! as `0x${string}`
    );

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Only circle members can send invitations" },
        { status: 403 }
      );
    }

    // Create invitation record in database
    const invitation = await prisma.circleInvitation.create({
      data: {
        circleId: Number(circleId),
        inviterEmail,
        inviteeEmail: inviteeEmail || null,
        inviteeWalletAddress: inviteeWalletAddress || null,
        status: "PENDING",
        inviteType: inviteType.toUpperCase(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send email invitation if email is provided
    if (inviteeEmail) {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.id}`;

      const emailData = {
        recipientEmail: inviteeEmail,
        inviterName: inviter.name || inviter.email || "A Grove user",
        circleName: circle.name,
        circleDescription: circle.description,
        targetAmount: formatBTCAmount(circle.targetAmount),
        deadline: formatDeadline(circle.deadline),
        inviteLink,
      };

      await resend.emails.send(createCircleInviteEmail(emailData));
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.id}`,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch pending invitations for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const walletAddress = searchParams.get("walletAddress");

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: "Email or wallet address required" },
        { status: 400 }
      );
    }

    const whereClause = email
      ? { inviteeEmail: email }
      : { inviteeWalletAddress: walletAddress };

    const invitations = await prisma.circleInvitation.findMany({
      where: {
        ...whereClause,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        circle: {
          select: {
            id: true,
            name: true,
            description: true,
            targetAmount: true,
            deadline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with contract data
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation: InvitationWithCircle) => {
        const circleData = await groveContract.getCircle(invitation.circleId);
        return {
          ...invitation,
          circle: {
            ...invitation.circle,
            currentAmount: circleData?.currentAmount || BigInt(0),
            memberCount: circleData?.memberCount || 0,
            isActive: circleData?.isActive || false,
          },
        };
      })
    );

    return NextResponse.json({ invitations: enrichedInvitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
