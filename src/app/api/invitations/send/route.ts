import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications";
import { logUserActivity } from "@/lib/activity-logger";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      circleId,
      recipientEmail,
      // recipientTelegram, // Commented out for app focus
      // recipientWhatsApp, // Commented out for app focus
      inviterName,
      inviterAddress,
      inviterEmail,
      circleName,
      inviteLink,
    } = body;

    // Validate required fields
    if (
      !circleId ||
      !recipientEmail ||
      !inviterName ||
      !inviterAddress ||
      !circleName ||
      !inviteLink
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that we have sender email for sending
    if (!inviterEmail) {
      return NextResponse.json(
        { error: "Sender email is required for email delivery" },
        { status: 400 }
      );
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid recipient email format" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(inviterEmail)) {
      return NextResponse.json(
        { error: "Invalid sender email format" },
        { status: 400 }
      );
    }

    // Validate wallet address
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(inviterAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("host")
        ? `${
            request.headers.get("x-forwarded-proto") || "http"
          }://${request.headers.get("host")}`
        : "https://grove-wine.vercel.app");

    // Send invitation across all channels using the new notification system
    const results = await fetch(`${baseUrl}/api/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "send_invitation",
        circleId: circleId,
        data: {
          recipientEmail,
          // recipientTelegram, // Commented out for app focus
          // recipientWhatsApp, // Commented out for app focus
          inviterName,
          inviterEmail,
          inviterAddress,
          inviteLink,
        },
      }),
    });

    const notificationResponse = await results.json();

    // Check if the notification was successful
    const hasSuccess = notificationResponse.success;

    if (!hasSuccess) {
      return NextResponse.json(
        {
          error: "Failed to send invitation through any channel",
          details: notificationResponse.results || notificationResponse.error,
        },
        { status: 500 }
      );
    }

    // Log the invitation activity
    try {
      // Ensure user exists
      await prisma.user.upsert({
        where: { wallet: inviterAddress.toLowerCase() },
        update: { lastActivityDate: new Date() },
        create: {
          wallet: inviterAddress.toLowerCase(),
          email: inviterEmail,
          name: inviterName,
          lastActivityDate: new Date(),
        },
      });

      // Log the activity
      await logUserActivity(
        inviterAddress,
        "invitation_sent",
        `Invited ${recipientEmail} to join ${circleName}`,
        {
          inviteeEmail: recipientEmail,
          circleName,
          circleId,
        }
      );
    } catch (activityError) {
      console.error("Error logging invitation activity:", activityError);
      // Don't fail the invitation if activity logging fails
    }

    // Return success with notification details
    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      results: notificationResponse.results,
    });
  } catch (error) {
    console.error("❌ Error sending invitation:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test notification services
export async function GET() {
  try {
    const serviceStatus = await notificationService.testServices();

    return NextResponse.json({
      status: "Notification services status",
      services: serviceStatus,
      configured: {
        email: !!process.env.GMAIL_APP_PASSWORD,
        telegram: !!process.env.TELEGRAM_BOT_TOKEN,
        whatsapp: !!(
          process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ),
      },
      environment: {
        smtp_host: process.env.SMTP_HOST || "Not set",
        gmail_app_password: process.env.GMAIL_APP_PASSWORD ? "Set" : "Not set",
        telegram_bot: process.env.TELEGRAM_BOT_TOKEN ? "Set" : "Not set",
        twilio_sid: process.env.TWILIO_ACCOUNT_SID ? "Set" : "Not set",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check services",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
