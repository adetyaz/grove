import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { punishmentSystem } from "@/lib/punishment-system";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.RECURRING_PAYMENT_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const dueSchedules = await prisma.paymentSchedule.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          lte: now,
        },
      },
      include: {
        circle: true,
      },
    });

    console.log(`Found ${dueSchedules.length} due payment schedules`);

    const results = [];

    for (const schedule of dueSchedules) {
      let payment: any = null;

      try {
        if (
          schedule.maxPayments &&
          schedule.totalPayments >= schedule.maxPayments
        ) {
          await prisma.paymentSchedule.update({
            where: { id: schedule.id },
            data: { isActive: false },
          });

          results.push({
            scheduleId: schedule.id,
            status: "completed",
            message: "Max payments reached, schedule deactivated",
          });
          continue;
        }

        payment = await prisma.recurringPayment.create({
          data: {
            scheduleId: schedule.id,
            userAddress: schedule.userAddress,
            circleId: schedule.circleId,
            amount: schedule.amount,
            status: "PENDING",
            scheduledFor: schedule.nextPaymentDate,
          },
        });

        await prisma.recurringPayment.update({
          where: { id: payment.id },
          data: { status: "PROCESSING" },
        });

        // NOTE: Automated transactions are disabled for security reasons
        // All recurring payments are now simulated
        console.log(
          `Simulating payment for circle ${schedule.circle.onChainId}, amount: ${schedule.amount}`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const txResult = {
          success: true,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        };
        console.log(`Simulated transaction: ${txResult.txHash}`);

        await prisma.recurringPayment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            transactionHash: txResult.txHash,
            processedAt: new Date(),
          },
        });

        // Log the contribution activity
        await fetch(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "https://grove-wine.vercel.app"
          }/api/activity/track-contribution`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userAddress: schedule.userAddress,
              circleId: schedule.circleId,
              amount: schedule.amount,
              txHash: txResult.txHash,
              circleName: schedule.circle.name,
              isRecurring: true,
            }),
          }
        );

        const nextPaymentDate = new Date(schedule.nextPaymentDate);
        switch (schedule.frequency) {
          case "DAILY":
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
            break;
          case "WEEKLY":
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
            break;
          case "MONTHLY":
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            break;
        }

        await prisma.paymentSchedule.update({
          where: { id: schedule.id },
          data: {
            nextPaymentDate,
            lastPaymentDate: new Date(),
            totalPayments: schedule.totalPayments + 1,
          },
        });

        results.push({
          scheduleId: schedule.id,
          paymentId: payment.id,
          status: "success",
          amount: schedule.amount,
          txHash: txResult.txHash,
          real: process.env.USE_REAL_TRANSACTIONS === "true",
        });
      } catch (error) {
        console.error(
          `Error processing payment for schedule ${schedule.id}:`,
          error
        );

        if (payment?.id) {
          await prisma.recurringPayment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              failureReason:
                error instanceof Error ? error.message : "Unknown error",
              retryCount: { increment: 1 },
            },
          });

          // Apply punishment for payment failure
          await punishmentSystem.handlePaymentFailure(
            schedule.userAddress,
            schedule.circleId,
            payment.id,
            error instanceof Error ? error.message : "Unknown error"
          );
        }

        const failedPayments = await prisma.recurringPayment.count({
          where: {
            scheduleId: schedule.id,
            status: "FAILED",
          },
        });

        if (failedPayments >= 3) {
          await prisma.paymentSchedule.update({
            where: { id: schedule.id },
            data: { isActive: false },
          });
        }

        results.push({
          scheduleId: schedule.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: dueSchedules.length,
      results,
    });
  } catch (error) {
    console.error("Error processing recurring payments:", error);
    return NextResponse.json(
      { error: "Failed to process recurring payments" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const activeSchedules = await prisma.paymentSchedule.count({
      where: { isActive: true },
    });

    const pendingPayments = await prisma.recurringPayment.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      activeSchedules,
      pendingPayments,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in payment processor health check:", error);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
