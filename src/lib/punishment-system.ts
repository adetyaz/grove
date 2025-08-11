import { prisma } from "./db";

// Punishment Types
export enum PunishmentType {
  WARNING = "WARNING",
  FINE = "FINE",
  SUSPENSION = "SUSPENSION",
  CONTRIBUTION_PENALTY = "CONTRIBUTION_PENALTY",
  STREAK_RESET = "STREAK_RESET",
  MEMBERSHIP_TERMINATION = "MEMBERSHIP_TERMINATION",
  CONTRIBUTION_HOLD = "CONTRIBUTION_HOLD",
}

// Violation Types
export enum ViolationType {
  MISSED_PAYMENT = "MISSED_PAYMENT",
  LATE_PAYMENT = "LATE_PAYMENT",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  REPEATED_FAILURES = "REPEATED_FAILURES",
  CIRCLE_ABANDONMENT = "CIRCLE_ABANDONMENT",
  FRAUDULENT_ACTIVITY = "FRAUDULENT_ACTIVITY",
  SPAM_INVITATIONS = "SPAM_INVITATIONS",
}

// Simplified punishment configuration for existing database
export interface PunishmentPreset {
  name: string;
  description: string;
  enabled: boolean;
  maxWarnings: number;
  autoSuspendAfter: number; // Number of violations
  allowAppeals: boolean;
  penaltyMultiplier: number; // Multiplier for contribution penalties
}

// Predefined punishment presets for circles
export const PUNISHMENT_PRESETS: Record<string, PunishmentPreset> = {
  DISABLED: {
    name: "Disabled",
    description: "No punishments applied",
    enabled: false,
    maxWarnings: 0,
    autoSuspendAfter: 999,
    allowAppeals: false,
    penaltyMultiplier: 1.0,
  },
  LENIENT: {
    name: "Lenient",
    description: "Warnings only, no automatic suspensions",
    enabled: true,
    maxWarnings: 5,
    autoSuspendAfter: 10,
    allowAppeals: true,
    penaltyMultiplier: 1.1,
  },
  MODERATE: {
    name: "Moderate",
    description: "Balanced approach with escalating consequences",
    enabled: true,
    maxWarnings: 3,
    autoSuspendAfter: 5,
    allowAppeals: true,
    penaltyMultiplier: 1.25,
  },
  STRICT: {
    name: "Strict",
    description: "Low tolerance with quick escalation",
    enabled: true,
    maxWarnings: 2,
    autoSuspendAfter: 3,
    allowAppeals: false,
    penaltyMultiplier: 1.5,
  },
};

export class PunishmentSystem {
  /**
   * Handle payment failure and log violation
   */
  async handlePaymentFailure(
    userAddress: string,
    circleId: string,
    paymentId: string,
    failureReason: string
  ): Promise<void> {
    try {
      // Log the violation as user activity for now
      await prisma.userActivity.create({
        data: {
          userAddress,
          type: "PAYMENT_FAILURE",
          description: `Payment failed: ${failureReason}`,
          metadata: JSON.stringify({
            circleId,
            paymentId,
            failureReason,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      // Count recent failures
      const recentFailures = await prisma.userActivity.count({
        where: {
          userAddress,
          type: "PAYMENT_FAILURE",
          metadata: {
            contains: circleId,
          },
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      // Apply punishment based on failure count
      await this.applyPunishmentForFailures(
        userAddress,
        circleId,
        recentFailures
      );
    } catch (error) {
      console.error("Failed to handle payment failure:", error);
    }
  }

  /**
   * Apply punishment based on failure count
   */
  private async applyPunishmentForFailures(
    userAddress: string,
    circleId: string,
    failureCount: number
  ): Promise<void> {
    // Get circle punishment settings (stored in description for now)
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      select: { description: true },
    });

    let preset: PunishmentPreset = PUNISHMENT_PRESETS.MODERATE;

    try {
      if (circle?.description) {
        const parsed = JSON.parse(circle.description);
        if (parsed.punishmentPreset) {
          const presetKey =
            parsed.punishmentPreset as keyof typeof PUNISHMENT_PRESETS;
          preset = PUNISHMENT_PRESETS[presetKey] || PUNISHMENT_PRESETS.MODERATE;
        }
      }
    } catch {
      // Use default settings if parsing fails
    }

    if (!preset.enabled) return;

    // Apply punishments based on failure count - simplified using preset values
    if (failureCount === 1) {
      await this.logPunishment(
        userAddress,
        circleId,
        "WARNING",
        "First payment failure warning"
      );
    } else if (failureCount >= preset.autoSuspendAfter) {
      if (preset.allowAppeals) {
        await this.logPunishment(
          userAddress,
          circleId,
          "SUSPENSION",
          "User suspended due to repeated failures"
        );
        await this.suspendPaymentSchedules(userAddress, circleId);
      } else {
        await this.terminateMembership(userAddress, circleId);
      }
    } else if (failureCount > preset.maxWarnings) {
      const penaltyPercent = ((preset.penaltyMultiplier - 1) * 100).toFixed(0);
      await this.logPunishment(
        userAddress,
        circleId,
        "PENALTY",
        `Contribution penalty applied: ${penaltyPercent}% increase`
      );
    }
  }

  /**
   * Log punishment as user activity
   */
  private async logPunishment(
    userAddress: string,
    circleId: string,
    type: string,
    description: string
  ): Promise<void> {
    await prisma.userActivity.create({
      data: {
        userAddress,
        type: `PUNISHMENT_${type}`,
        description,
        metadata: JSON.stringify({
          circleId,
          punishmentType: type,
          appliedAt: new Date().toISOString(),
        }),
      },
    });
  }

  /**
   * Suspend user's payment schedules
   */
  private async suspendPaymentSchedules(
    userAddress: string,
    circleId: string
  ): Promise<void> {
    await prisma.paymentSchedule.updateMany({
      where: {
        userAddress,
        circleId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Remove user from circle
   */
  private async terminateMembership(
    userAddress: string,
    circleId: string
  ): Promise<void> {
    try {
      // Find user and remove from circle
      const user = await prisma.user.findUnique({
        where: { wallet: userAddress },
      });

      if (user) {
        await prisma.circle.update({
          where: { id: circleId },
          data: {
            members: {
              disconnect: { id: user.id },
            },
          },
        });

        // Deactivate payment schedules
        await prisma.paymentSchedule.updateMany({
          where: {
            userAddress,
            circleId,
          },
          data: {
            isActive: false,
          },
        });

        // Log the termination
        await this.logPunishment(
          userAddress,
          circleId,
          "TERMINATION",
          "Membership terminated due to repeated violations"
        );
      }
    } catch (error) {
      console.error("Failed to terminate membership:", error);
    }
  }

  /**
   * Get user's punishment history
   */
  async getUserPunishmentHistory(
    userAddress: string,
    circleId?: string
  ): Promise<{
    punishments: any[];
    violations: any[];
    isCurrentlySuspended: boolean;
  }> {
    const whereClause: any = {
      userAddress,
      type: {
        startsWith: "PUNISHMENT_",
      },
    };

    if (circleId) {
      whereClause.metadata = {
        contains: circleId,
      };
    }

    const punishments = await prisma.userActivity.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    const violations = await prisma.userActivity.findMany({
      where: {
        userAddress,
        type: "PAYMENT_FAILURE",
        ...(circleId && { metadata: { contains: circleId } }),
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    // Check if user has active suspensions
    const recentSuspensions = punishments.filter(
      (p) =>
        p.type === "PUNISHMENT_SUSPENSION" &&
        new Date(p.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    return {
      punishments: punishments.map((p) => ({
        id: p.id,
        type: p.type.replace("PUNISHMENT_", ""),
        description: p.description,
        appliedAt: p.timestamp,
        metadata: JSON.parse(p.metadata || "{}"),
      })),
      violations: violations.map((v) => ({
        id: v.id,
        type: v.type,
        description: v.description,
        createdAt: v.timestamp,
        metadata: JSON.parse(v.metadata || "{}"),
      })),
      isCurrentlySuspended: recentSuspensions.length > 0,
    };
  }
}

// Export singleton instance
export const punishmentSystem = new PunishmentSystem();
