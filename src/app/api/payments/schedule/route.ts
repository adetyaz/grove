import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, circleId, amount, frequency, maxPayments } = body;

    if (!userAddress || !circleId || !amount || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate frequency
    const validFrequencies = ["DAILY", "WEEKLY", "MONTHLY"];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency. Must be DAILY, WEEKLY, or MONTHLY" },
        { status: 400 }
      );
    }

    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Calculate next payment date based on frequency
    const now = new Date();
    const nextPaymentDate = new Date(now);

    switch (frequency) {
      case "DAILY":
        nextPaymentDate.setDate(now.getDate() + 1);
        break;
      case "WEEKLY":
        nextPaymentDate.setDate(now.getDate() + 7);
        break;
      case "MONTHLY":
        nextPaymentDate.setMonth(now.getMonth() + 1);
        break;
    }

    // Create payment schedule
    const schedule = await prisma.paymentSchedule.create({
      data: {
        userAddress,
        circleId,
        amount: amount.toString(),
        frequency,
        nextPaymentDate,
        maxPayments: maxPayments || null,
      },
      include: {
        Circle: {
          select: {
            name: true,
            targetAmount: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      schedule,
      message: "Payment schedule created successfully",
    });
  } catch (error) {
    console.error("Error creating payment schedule:", error);
    return NextResponse.json(
      { error: "Failed to create payment schedule" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      );
    }

    const schedules = await prisma.paymentSchedule.findMany({
      where: {
        userAddress: userAddress,
        isActive: true,
      },
      include: {
        Circle: {
          select: {
            name: true,
            targetAmount: true,
          },
        },
        RecurringPayment: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        nextPaymentDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching payment schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment schedules" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const userAddress = searchParams.get("userAddress");

    if (!scheduleId || !userAddress) {
      return NextResponse.json(
        { error: "scheduleId and userAddress are required" },
        { status: 400 }
      );
    }

    // Verify the user owns this schedule
    const schedule = await prisma.paymentSchedule.findFirst({
      where: {
        id: scheduleId,
        userAddress: userAddress,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Payment schedule not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.paymentSchedule.update({
      where: { id: scheduleId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Payment schedule cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling payment schedule:", error);
    return NextResponse.json(
      { error: "Failed to cancel payment schedule" },
      { status: 500 }
    );
  }
}
