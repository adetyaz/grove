import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications";

export async function POST() {
  try {
    console.log("🧪 Testing notification services...");

    const serviceStatus = await notificationService.testServices();

    console.log("📊 Service test results:", serviceStatus);

    return NextResponse.json(serviceStatus);
  } catch (error) {
    console.error("❌ Error testing services:", error);
    return NextResponse.json(
      { error: "Failed to test notification services" },
      { status: 500 }
    );
  }
}
