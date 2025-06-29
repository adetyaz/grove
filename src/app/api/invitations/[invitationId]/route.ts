import { NextRequest, NextResponse } from "next/server";
import { resend, createWelcomeEmail } from "@/lib/resend";
import { prisma } from "@/lib/db";
import { groveContract } from "@/lib/grove-contract";
import { getDynamicUser } from "@/lib/dynamic";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { getPublicClient } from "@/lib/web3";

export async function POST(req: NextRequest) {
  try {
    const { invitationId, userEmail, walletAddress } = await req.json();

    if (!invitationId || !userEmail || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get invitation details
    const invitation = await prisma.circleInvitation.findUnique({
      where: { id: invitationId },
      include: {
        circle: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation already processed" },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Verify user credentials
    const user = await getDynamicUser(userEmail);
    if (!user || user.address?.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Invalid user credentials" },
        { status: 401 }
      );
    }

    // Get circle details to verify it exists and is active
    const circle = await groveContract.getCircle(invitation.circleId);
    if (!circle || !circle.isActive) {
      return NextResponse.json(
        { error: "Circle not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isAlreadyMember = await groveContract.isCircleMember(
      invitation.circleId,
      walletAddress as `0x${string}`
    );

    if (isAlreadyMember) {
      // Update invitation status but don't fail
      await prisma.circleInvitation.update({
        where: { id: invitationId },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          acceptedByEmail: userEmail,
          acceptedByWalletAddress: walletAddress,
        },
      });

      return NextResponse.json({
        success: true,
        message: "You are already a member of this circle",
        alreadyMember: true,
      });
    }

    // Simulate the addMember contract call to ensure it will work
    const publicClient = getPublicClient();

    try {
      await publicClient.simulateContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "addMember",
        args: [BigInt(invitation.circleId), walletAddress as `0x${string}`],
        account: circle.owner, // Circle owner should be able to add members
      });
    } catch (contractError) {
      console.error("Contract simulation failed:", contractError);
      return NextResponse.json(
        { error: "Unable to add member to circle on-chain" },
        { status: 400 }
      );
    }

    // Update invitation status
    await prisma.circleInvitation.update({
      where: { id: invitationId },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        acceptedByEmail: userEmail,
        acceptedByWalletAddress: walletAddress,
      },
    });

    // Send welcome email
    try {
      const welcomeEmailData = {
        recipientEmail: userEmail,
        recipientName: user.name || undefined,
        circleName: circle.name,
      };

      await resend.emails.send(createWelcomeEmail(welcomeEmailData));
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      circle: {
        id: circle.id,
        name: circle.name,
        description: circle.description,
      },
      nextStep: "add_member_on_chain",
      contractCall: {
        address: GROVE_CONTRACT_ADDRESS,
        functionName: "addMember",
        args: [BigInt(invitation.circleId), walletAddress],
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch invitation details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID required" },
        { status: 400 }
      );
    }

    const invitation = await prisma.circleInvitation.findUnique({
      where: { id: invitationId },
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
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check expiration
    const isExpired = invitation.expiresAt < new Date();
    const isValid = invitation.status === "PENDING" && !isExpired;

    // Get additional circle data from contract
    let circleData = null;
    if (isValid) {
      circleData = await groveContract.getCircle(invitation.circleId);
    }

    return NextResponse.json({
      invitation: {
        ...invitation,
        isValid,
        isExpired,
        circle: circleData
          ? {
              ...invitation.circle,
              currentAmount: circleData.currentAmount,
              memberCount: circleData.memberCount,
              isActive: circleData.isActive,
            }
          : invitation.circle,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
