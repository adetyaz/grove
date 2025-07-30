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
  inviteeEmail?: string;
  recipient?: string;
  txHash?: string;
  [key: string]: any;
}

export async function logUserActivity(
  userAddress: string,
  type: ActivityType,
  description: string,
  metadata?: ActivityMetadata
) {
  try {
    await prisma.userActivity.create({
      data: {
        userAddress: userAddress.toLowerCase(),
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
    console.log(`Activity logged: ${type} for ${userAddress}`);
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
  await logUserActivity(
    userAddress,
    "contribution",
    `Contributed ${amount} BTC to ${circleName}`,
    {
      amount,
      circleName,
      circleId,
      txHash,
    }
  );
}

export async function logGift(
  senderAddress: string,
  recipientAddress: string,
  circleName: string,
  circleId: string,
  amount: string,
  message?: string,
  txHash?: string
) {
  await logUserActivity(
    senderAddress,
    "gift_sent",
    `Sent ${amount} BTC gift to ${recipientAddress.slice(
      0,
      6
    )}...${recipientAddress.slice(-4)} in ${circleName}`,
    {
      amount,
      circleName,
      circleId,
      recipient: recipientAddress,
      message,
      txHash,
    }
  );
}

export async function logCircleCreation(
  userAddress: string,
  circleName: string,
  circleId: string
) {
  await logUserActivity(
    userAddress,
    "circle_created",
    `Created new savings circle "${circleName}"`,
    {
      circleName,
      circleId,
    }
  );
}

export async function logCircleJoin(
  userAddress: string,
  circleName: string,
  circleId: string
) {
  await logUserActivity(
    userAddress,
    "circle_joined",
    `Joined savings circle "${circleName}"`,
    {
      circleName,
      circleId,
    }
  );
}

export async function logAchievement(
  userAddress: string,
  achievementName: string,
  achievementId: string
) {
  await logUserActivity(
    userAddress,
    "achievement",
    `Earned achievement: ${achievementName}`,
    {
      achievementName,
      achievementId,
    }
  );
}
