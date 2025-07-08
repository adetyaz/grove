import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const { testEmail, testTelegram, testWhatsApp } = await request.json();

    console.log("🧪 Sending test invitation...");

    const testInvitation = {
      recipientEmail: testEmail || "test@grove.app",
      recipientTelegram: testTelegram,
      recipientWhatsApp: testWhatsApp,
      inviterName: "Grove Test User",
      inviterAddress: "0x1234567890123456789012345678901234567890",
      inviterEmail: "test-inviter@grove.app",
      circleName: "Test Circle",
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join?test=true`,
      circleDescription:
        "This is a test invitation to verify the notification system is working correctly.",
    };

    const results = await notificationService.sendInvitation(testInvitation);

    console.log("📊 Test invitation results:", results);

    // Check if at least one channel succeeded
    const hasSuccess =
      results.email.success ||
      results.telegram.success ||
      results.whatsapp.success;

    if (hasSuccess) {
      return NextResponse.json({
        success: true,
        message: "Test invitation sent successfully",
        results,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to send test invitation through any channel",
          results,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error sending test invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
