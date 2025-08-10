import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncContributionWithAchievements } from "@/lib/achievement-sync";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, testScenario } = await request.json();

    if (!userAddress) {
      return NextResponse.json(
        { error: "Missing userAddress parameter" },
        { status: 400 }
      );
    }

    console.log(
      `🧪 Testing achievement scenario: ${testScenario} for ${userAddress}`
    );

    const address = userAddress; // Don't convert to lowercase unnecessarily

    // Clear existing test data for clean testing
    if (testScenario === "reset") {
      await prisma.userActivity.deleteMany({
        where: {
          userAddress: address,
          OR: [
            { type: "contribution" },
            { type: "achievement_earned" },
            { type: "test_data" },
          ],
        },
      });

      return NextResponse.json({
        success: true,
        message: "Test data reset successfully",
      });
    }

    // Test scenarios for different achievements
    const scenarios = {
      // Achievement 0: First Steps
      first_contribution: async () => {
        // Clear ALL existing data to ensure clean state for first contribution test
        await prisma.userActivity.deleteMany({
          where: {
            userAddress: address,
            OR: [
              { type: "contribution" },
              { type: "achievement_earned" },
              { type: "test_data" },
            ],
          },
        });

        // Don't create a contribution activity here - let the calculate API count the "current" one
        // This way we'll have 0 existing + 1 current = 1 total (which triggers First Steps)
      },

      // Achievement 1: Penny Saver - 0.001 BTC
      penny_saver: async () => {
        // Clear existing contributions and achievements
        await prisma.userActivity.deleteMany({
          where: {
            userAddress: address,
            OR: [
              { type: "contribution" },
              { type: "achievement_earned" },
              { type: "test_data" },
            ],
          },
        });

        await prisma.userActivity.create({
          data: {
            userAddress: address,
            type: "contribution",
            description: "Test penny saver contribution",
            metadata: JSON.stringify({
              amount: "0.001",
              circleId: "test-circle",
              txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            }),
          },
        });
      },

      // Achievement 2: Serious Saver - 0.01 BTC
      serious_saver: async () => {
        // Clear existing contributions and achievements
        await prisma.userActivity.deleteMany({
          where: {
            userAddress: address,
            OR: [
              { type: "contribution" },
              { type: "achievement_earned" },
              { type: "test_data" },
            ],
          },
        });

        await prisma.userActivity.create({
          data: {
            userAddress: address,
            type: "contribution",
            description: "Test serious saver contribution",
            metadata: JSON.stringify({
              amount: "0.01",
              circleId: "test-circle",
              txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            }),
          },
        });
      },

      // Achievement 3: Goal Crusher - Circle participation
      goal_crusher: async () => {
        // Clear existing data
        await prisma.userActivity.deleteMany({
          where: {
            userAddress: address,
            OR: [
              { type: "contribution" },
              { type: "achievement_earned" },
              { type: "test_data" },
            ],
          },
        });

        // Create or update user with circle participation
        const user = await prisma.user.upsert({
          where: { wallet: address },
          create: {
            wallet: address,
            email: `test-${address}@example.com`,
          },
          update: {
            // Clear any existing circle relationships first
            memberCircles: {
              set: [],
            },
          },
        });

        // Create a test circle owned by another user
        const ownerUser = await prisma.user.upsert({
          where: { wallet: "0x1234567890123456789012345678901234567890" },
          create: {
            wallet: "0x1234567890123456789012345678901234567890",
            email: "owner@example.com",
          },
          update: {},
        });

        const testCircle = await prisma.circle.upsert({
          where: { id: `test-circle-${address}` },
          create: {
            id: `test-circle-${address}`,
            name: "Test Circle for Goal Crusher",
            description: "Test circle for achievement testing",
            targetAmount: "0.1",
            ownerId: ownerUser.id,
            paymentType: "ONETIME",
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
          update: {},
        });

        // Add user as member of the circle
        await prisma.user.update({
          where: { id: user.id },
          data: {
            memberCircles: {
              connect: { id: testCircle.id },
            },
          },
        });

        await prisma.userActivity.create({
          data: {
            userAddress: address,
            type: "test_data",
            description: "Test circle participation for Goal Crusher",
            metadata: JSON.stringify({
              circleId: testCircle.id,
              role: "member",
            }),
          },
        });
      },

      // Achievement 4: Consistency King - 7-day streak
      consistency_king: async () => {
        // Clear existing data
        await prisma.userActivity.deleteMany({
          where: {
            userAddress: address,
            OR: [
              { type: "contribution" },
              { type: "achievement_earned" },
              { type: "test_data" },
            ],
          },
        });

        // Update user with streak data
        await prisma.user.upsert({
          where: { wallet: address },
          create: {
            wallet: address,
            email: `test-${address}@example.com`,
            currentStreak: 7,
            longestStreak: 7,
          },
          update: {
            currentStreak: 7,
            longestStreak: 7,
          },
        });

        // Create multiple contribution activities to simulate streak
        for (let i = 0; i < 7; i++) {
          await prisma.userActivity.create({
            data: {
              userAddress: address,
              type: "contribution",
              description: `Test streak contribution day ${i + 1}`,
              metadata: JSON.stringify({
                amount: "0.0001",
                circleId: "test-circle",
                txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
                streakDay: i + 1,
                date: new Date(
                  Date.now() - (6 - i) * 24 * 60 * 60 * 1000
                ).toISOString(),
              }),
            },
          });
        }
      },

      // Achievement 5: Circle Builder - 5+ invitations
      circle_builder: async () => {
        // Clear existing data
        await prisma.userActivity.deleteMany({
          where: {
            userAddress: address,
            OR: [
              { type: "contribution" },
              { type: "achievement_earned" },
              { type: "test_data" },
            ],
          },
        });

        // Clear existing invitations
        await prisma.circleInvitation.deleteMany({
          where: {
            inviterEmail: `${address}@test.com`,
          },
        });

        // Create test invitations
        for (let i = 0; i < 5; i++) {
          try {
            await prisma.circleInvitation.create({
              data: {
                circleId: `test-circle-${address}`,
                inviterEmail: `${address}@test.com`, // Use proper email format
                inviteeEmail: `test-invitee-${i}@example.com`,
                inviteType: "EMAIL",
                status: "ACCEPTED", // Make sure status is uppercase to match calculation logic
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                acceptedAt: new Date(),
                acceptedByEmail: `test-invitee-${i}@example.com`,
              },
            });
          } catch {
            // Ignore duplicates
            console.log(`Invitation ${i} may already exist`);
          }
        }

        await prisma.userActivity.create({
          data: {
            userAddress: address,
            type: "test_data",
            description: "Test invitations for Circle Builder",
            metadata: JSON.stringify({
              invitationCount: 5,
              testScenario: "circle_builder",
            }),
          },
        });
      },

      // All achievements at once
      all_achievements: async () => {
        await scenarios.first_contribution();
        await scenarios.penny_saver();
        await scenarios.serious_saver();
        await scenarios.goal_crusher();
        await scenarios.consistency_king();
        await scenarios.circle_builder();
      },
    };

    const scenarioFn = scenarios[testScenario as keyof typeof scenarios];
    if (!scenarioFn) {
      return NextResponse.json(
        { error: `Unknown test scenario: ${testScenario}` },
        { status: 400 }
      );
    }

    // Execute the test scenario
    await scenarioFn();

    // Now call the achievement calculation API
    const calculationResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/achievements/calculate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          contributionAmount: "0.0001", // Minimal amount to trigger calculation
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        }),
      }
    );

    const calculationResult = await calculationResponse.json();

    return NextResponse.json({
      success: true,
      message: `Test scenario '${testScenario}' executed successfully`,
      testScenario,
      userAddress: address,
      achievementCalculation: calculationResult,
      contractSyncRequired: true, // Flag to indicate contract sync is needed
      syncInstructions: {
        // Instructions for frontend to sync with contract
        contributions:
          testScenario === "first_contribution"
            ? ["0.0001"]
            : testScenario === "penny_saver"
            ? ["0.001"]
            : testScenario === "serious_saver"
            ? ["0.01"]
            : testScenario === "consistency_king"
            ? Array(7).fill("0.0001")
            : [],
        circleCount: testScenario === "goal_crusher" ? 1 : 0,
        invitationCount: testScenario === "circle_builder" ? 5 : 0,
      },
      simulatedData: {
        scenario: testScenario,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in achievement test:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get("userAddress");

  if (!userAddress) {
    return NextResponse.json(
      { error: "Missing userAddress parameter" },
      { status: 400 }
    );
  }

  try {
    // Get current test data status
    const activities = await prisma.userActivity.findMany({
      where: {
        userAddress: userAddress,
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    const achievements = await prisma.userActivity.findMany({
      where: {
        userAddress: userAddress,
        type: "achievement_earned",
      },
    });

    const user = await prisma.user.findUnique({
      where: { wallet: userAddress },
      include: {
        ownedCircles: true,
        memberCircles: true,
      },
    });

    const invitations = await prisma.circleInvitation.findMany({
      where: {
        inviterEmail: `${userAddress}@test.com`,
      },
    });

    return NextResponse.json({
      success: true,
      userAddress: userAddress,
      summary: {
        totalActivities: activities.length,
        totalAchievements: achievements.length,
        totalCircles: user
          ? user.ownedCircles.length + user.memberCircles.length
          : 0,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalInvitations: invitations.length,
      },
      recentActivities: activities.slice(0, 10),
      achievements: achievements,
      contractAddresses: {
        groveAchievements: "0x33f085b99AA6219CE6eE3174FdB3191B0e29B738",
        achievementNFT: "0x785453Ec2bbbe87b5E5D19f91c810Be0D4704A14",
      },
    });
  } catch (error) {
    console.error("Error getting test status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
