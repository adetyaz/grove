import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [], // Disabled query logging
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper to get or create user by email
export async function getOrCreateUser(email: string, wallet: string) {
  return prisma.user.upsert({
    where: { email },
    create: { email, wallet },
    update: { wallet },
  });
}
