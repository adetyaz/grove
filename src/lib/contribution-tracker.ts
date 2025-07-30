import { logContribution, logGift } from "@/lib/activity-logger";
import { prisma } from "@/lib/db";

export async function trackContribution(
  userAddress: string,
  circleId: string,
  amount: string,
  txHash: string,
  circleName?: string
) {
  try {
    // Ensure user exists in database
    await prisma.user.upsert({
      where: { wallet: userAddress.toLowerCase() },
      update: {
        totalContributions: { increment: 1 },
        lastActivityDate: new Date(),
      },
      create: {
        wallet: userAddress.toLowerCase(),
        email: `${userAddress.toLowerCase()}@wallet.local`, // Temporary email
        totalContributions: 1,
        lastActivityDate: new Date(),
      },
    });

    // Update user stats
    await prisma.user.upsert({
      where: { wallet: userAddress.toLowerCase() },
      update: {
        totalContributions: { increment: 1 },
        lastActivityDate: new Date(),
      },
      create: {
        wallet: userAddress.toLowerCase(),
        email: `${userAddress.toLowerCase()}@wallet.local`, // Temporary email
        totalContributions: 1,
        lastActivityDate: new Date(),
      },
    });

    // Log the activity
    await logContribution(
      userAddress,
      circleName || `Circle ${circleId}`,
      circleId,
      amount,
      txHash
    );

    console.log(
      `Tracked contribution: ${amount} by ${userAddress} to circle ${circleId}`
    );
  } catch (error) {
    console.error("Error tracking contribution:", error);
  }
}

export async function trackGift(
  senderAddress: string,
  recipientAddress: string,
  circleId: string,
  amount: string,
  txHash: string,
  message?: string,
  circleName?: string
) {
  try {
    // Ensure sender exists
    await prisma.user.upsert({
      where: { wallet: senderAddress.toLowerCase() },
      update: { lastActivityDate: new Date() },
      create: {
        wallet: senderAddress.toLowerCase(),
        email: `${senderAddress.toLowerCase()}@wallet.local`,
        lastActivityDate: new Date(),
      },
    });

    // Log the gift activity
    await logGift(
      senderAddress,
      recipientAddress,
      circleName || `Circle ${circleId}`,
      circleId,
      amount,
      message,
      txHash
    );

    console.log(
      `Tracked gift: ${amount} from ${senderAddress} to ${recipientAddress}`
    );
  } catch (error) {
    console.error("Error tracking gift:", error);
  }
}
