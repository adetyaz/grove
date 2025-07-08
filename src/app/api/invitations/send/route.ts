import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications";
import { groveToast } from "@/lib/toast";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      recipientEmail,
      recipientTelegram,
      recipientWhatsApp,
      inviterName,
      inviterAddress,
      inviterEmail, // Get sender email from frontend
      circleName,
      inviteLink,
      circleDescription,
    } = body;

    // Validate required fields
    if (
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

    // Send invitation across all channels
    const results = await notificationService.sendInvitation({
      recipientEmail,
      recipientTelegram,
      recipientWhatsApp,
      inviterName,
      inviterAddress,
      inviterEmail, // Pass sender email to service
      circleName,
      inviteLink,
      circleDescription,
    });

    console.log("📨 Invitation results:", results);

    // Check if at least one channel succeeded
    const hasSuccess = Object.values(results).some((result) => result.success);

    if (!hasSuccess) {
      return NextResponse.json(
        {
          error: "Failed to send invitation through any channel",
          details: results,
        },
        { status: 500 }
      );
    }

    // Return success with details of which channels worked
    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      results,
      channels: {
        email: results.email.success,
        telegram: results.telegram.success,
        whatsapp: results.whatsapp.success,
      },
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
