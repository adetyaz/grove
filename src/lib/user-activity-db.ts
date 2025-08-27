// Direct database queries for UserActivity since Prisma client is outdated
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface UserActivityData {
  id?: string;
  userAddress: string;
  type: string;
  description?: string;
  metadata?: string;
  timestamp?: Date;
}

// Use raw SQL to interact with UserActivity table
export class UserActivityDB {
  static async create(data: UserActivityData) {
    try {
      const result = await prisma.$executeRaw`
        INSERT INTO "UserActivity" ("id", "userAddress", "type", "description", "metadata", "timestamp")
        VALUES (gen_random_uuid(), ${data.userAddress}, ${data.type}, ${
        data.description || null
      }, ${data.metadata || null}, NOW())
      `;
      console.log(`Activity logged: ${data.type} for ${data.userAddress}`);
      return result;
    } catch (error) {
      console.error("Failed to log user activity:", error);
      throw error;
    }
  }

  static async findMany(where: {
    userAddress?: string;
    type?: string | string[];
  }) {
    try {
      let typeCondition = "";
      if (where.type) {
        if (Array.isArray(where.type)) {
          const types = where.type.map((t) => `'${t}'`).join(",");
          typeCondition = `AND "type" IN (${types})`;
        } else {
          typeCondition = `AND "type" = '${where.type}'`;
        }
      }

      const userCondition = where.userAddress
        ? `AND "userAddress" = '${where.userAddress}'`
        : "";

      const activities = await prisma.$queryRaw`
        SELECT * FROM "UserActivity" 
        WHERE 1=1 ${
          typeCondition
            ? prisma.$queryRawUnsafe(typeCondition)
            : prisma.$queryRawUnsafe("")
        }
        ${
          userCondition
            ? prisma.$queryRawUnsafe(userCondition)
            : prisma.$queryRawUnsafe("")
        }
        ORDER BY "timestamp" DESC
        LIMIT 100
      `;

      return activities;
    } catch (error) {
      console.error("Failed to fetch user activities:", error);
      return [];
    }
  }

  static async getRecentActivities(limit = 50) {
    try {
      const activities = await prisma.$queryRaw`
        SELECT * FROM "UserActivity" 
        ORDER BY "timestamp" DESC
        LIMIT ${limit}
      `;
      return activities;
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
      return [];
    }
  }
}
