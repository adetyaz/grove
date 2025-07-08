import { NextRequest, NextResponse } from "next/server";
import { sendEmail, emailTemplates, verifyEmailConnection } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderEmail, recipientEmail, testType = "simple" } = body;

    if (!senderEmail || !recipientEmail) {
      return NextResponse.json(
        { error: "Both senderEmail and recipientEmail are required" },
        { status: 400 }
      );
    }

    console.log("🧪 Testing email functionality...");
    console.log("📧 Sender:", senderEmail);
    console.log("📨 Recipient:", recipientEmail);

    // First verify the connection
    console.log("🔍 Verifying email connection...");
    const connectionValid = await verifyEmailConnection(senderEmail);

    if (!connectionValid) {
      return NextResponse.json(
        {
          error:
            "Failed to verify email connection. Check your Gmail app password.",
        },
        { status: 500 }
      );
    }

    console.log("✅ Email connection verified successfully");

    let emailTemplate;

    if (testType === "invitation") {
      // Test with a full invitation template
      emailTemplate = emailTemplates.circleInvitation({
        inviterName: "Test User",
        inviterAddress: "0x1234567890123456789012345678901234567890",
        circleName: "Test Bitcoin Circle",
        inviteLink: "https://grove.app/join?test=true",
        circleDescription: "This is a test invitation from Grove app",
      });
    } else {
      // Test with a simple test email template
      emailTemplate = emailTemplates.testEmail({
        senderEmail,
        testRecipient: recipientEmail,
      });
    }

    console.log("📤 Sending test email...");
    const result = await sendEmail(senderEmail, recipientEmail, emailTemplate);

    if (result.success) {
      console.log("✅ Test email sent successfully!");
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        messageId: result.messageId,
        connectionVerified: true,
        senderEmail,
        recipientEmail,
      });
    } else {
      console.error("❌ Failed to send test email:", result.error);
      return NextResponse.json(
        {
          error: "Failed to send test email",
          details: result.error,
          connectionVerified: true,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Email test error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during email test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test email configuration
export async function GET() {
  try {
    return NextResponse.json({
      status: "Email service configuration",
      environment: {
        smtp_host: process.env.SMTP_HOST || "Not set",
        smtp_port: process.env.SMTP_PORT || "Not set",
        smtp_secure: process.env.SMTP_SECURE || "Not set",
        gmail_app_password: process.env.GMAIL_APP_PASSWORD
          ? "Set ✅"
          : "Not set ❌",
      },
      instructions:
        'Send a POST request with { "senderEmail": "your@gmail.com", "recipientEmail": "test@example.com" } to test email functionality',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check email configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
