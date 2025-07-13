import { NextRequest, NextResponse } from "next/server";
import { verifyEmailConnection } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: "Test email is required" },
        { status: 400 }
      );
    }

    console.log("🧪 Testing email service with:", testEmail);

    // Test email connection
    const isWorking = await verifyEmailConnection();

    return NextResponse.json({
      success: isWorking,
      message: isWorking
        ? "Email service is working!"
        : "Email service configuration failed",
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        hasPassword: !!process.env.GMAIL_APP_PASSWORD,
        testEmail,
      },
    });
  } catch (error) {
    console.error("❌ Email test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Email test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
