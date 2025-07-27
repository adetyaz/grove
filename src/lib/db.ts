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
