import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      circleId, // UUID of the circle
      recipientEmail,
      recipientTelegram,
      recipientWhatsApp,
      inviterName,
      inviterAddress,
      inviterEmail, // Get sender email from frontend
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

    // Validate wallet address format (basic ETH address check)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(inviterAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    console.log("📧 Sending invitation to:", recipientEmail);
    console.log("📨 From:", inviterEmail);
    console.log("🌳 Circle:", circleName);
    console.log("👤 Inviter:", inviterName);

    // Send invitation across all channels using the new notification system
    const results = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "send_invitation",
          circleId: circleId, // This should be the UUID from the request
          data: {
            recipientEmail,
            recipientTelegram,
            recipientWhatsApp,
            inviterName,
            inviterEmail,
            inviterAddress,
          },
        }),
      }
    );

    const notificationResponse = await results.json();

    console.log("📨 Invitation results:", notificationResponse);

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
