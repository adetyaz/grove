import { prisma } from "@/lib/db";

export type ActivityType =
  | "contribution"
  | "recurring_payment"
  | "achievement"
  | "achievement_earned"
  | "invitation_sent"
  | "gift_sent"
  | "circle_created"
  | "circle_joined"
  | "withdrawal";

export interface ActivityMetadata {
  amount?: string;
  circleName?: string;
  circleId?: string;
  achievementName?: string;
  achievementId?: string;
  inviteeEmail?: string;
  recipient?: string;
  message?: string;
  txHash?: string;
  [key: string]: any;
}

export async function logUserActivity(
  userAddress: string, // User wallet address
  type: ActivityType,
  metadata?: ActivityMetadata
) {
  try {
    await prisma.userActivity.create({
      data: {
        userAddress: userAddress.toLowerCase(),
        type: type,
        metadata: JSON.stringify(metadata || {}),
      },
    });
    console.log(`Activity logged: ${type} for user ${userAddress}`, metadata);
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
}

export async function logContribution(
  userAddress: string,
  circleName: string,
  circleId: string,
  amount: string,
  txHash?: string
) {
  await logUserActivity(userAddress, "contribution", {
    amount,
    circleName,
    circleId,
    txHash,
  });
}

export async function logCircleCreation(
  userAddress: string,
  circleName: string,
  circleId: string
) {
  await logUserActivity(userAddress, "circle_created", {
    circleName,
    circleId,
  });
}

export async function logCircleJoin(
  userAddress: string,
  circleName: string,
  circleId: string
) {
  await logUserActivity(userAddress, "circle_joined", {
    circleName,
    circleId,
  });
}

export async function logAchievement(
  userAddress: string,
  achievementName: string,
  achievementId: string
) {
  await logUserActivity(userAddress, "achievement_earned", {
    achievementName,
    achievementId,
  });
}
