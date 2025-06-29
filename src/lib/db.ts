import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Helper to get or create user by email
export async function getOrCreateUser(email: string, wallet: string) {
  return prisma.user.upsert({
    where: { email },
    create: { email, wallet },
    update: { wallet },
  });
}

// Create a new circle (stores both on-chain and off-chain)
export async function createCircle(
  name: string,
  paymentType: string,
  amount: number,
  ownerEmail: string,
  ownerWallet: string,
  onChainId: number
) {
  return prisma.circle.create({
    data: {
      name,
      paymentType,
      amount,
      onChainId,
      owner: {
        connectOrCreate: {
          where: { email: ownerEmail },
          create: { email: ownerEmail, wallet: ownerWallet },
        },
      },
    },
  });
}
