// Phase 2: Real Streak Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter required' }, { status: 400 });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          wallet: address.toLowerCase(),
          email: `${address.toLowerCase()}@grove.temp`, // Temporary email
        },
      });
    }

    // Calculate streak based on recent activity
    const streak = await calculateCurrentStreak(address);

    // Update user's streak if changed
    if (streak.currentStreak !== user.currentStreak) {
      await prisma.user.update({
        where: { wallet: address.toLowerCase() },
        data: {
          currentStreak: streak.currentStreak,
          longestStreak: Math.max(streak.currentStreak, user.longestStreak),
          lastActivityDate: streak.lastActivityDate,
        },
      });
    }

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: Math.max(streak.currentStreak, user.longestStreak),
      lastActivityDate: streak.lastActivityDate,
      daysUntilStreakReset: streak.daysUntilReset,
    });

  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, activityType } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // Record activity
    await recordActivity(address, activityType || 'CONTRIBUTION');

    // Recalculate streak
    const streak = await calculateCurrentStreak(address);

    // Update user
    await prisma.user.upsert({
      where: { wallet: address.toLowerCase() },
      update: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.currentStreak,
        lastActivityDate: streak.lastActivityDate,
        totalContributions: { increment: 1 },
      },
      create: {
        wallet: address.toLowerCase(),
        email: `${address.toLowerCase()}@grove.temp`,
        currentStreak: streak.currentStreak,
        longestStreak: streak.currentStreak,
        lastActivityDate: streak.lastActivityDate,
        totalContributions: 1,
      },
    });

    return NextResponse.json({
      success: true,
      currentStreak: streak.currentStreak,
      achievementEarned: streak.currentStreak >= 7 ? 'STREAK_7_DAYS' : null,
    });

  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate current streak
async function calculateCurrentStreak(address: string) {
  const activities = await prisma.userActivity.findMany({
    where: { 
      userAddress: address.toLowerCase(),
      type: { in: ['CONTRIBUTION', 'CIRCLE_CREATED', 'INVITE_SENT'] },
    },
    orderBy: { timestamp: 'desc' },
    take: 100, // Look at last 100 activities
  });

  if (activities.length === 0) {
    return {
      currentStreak: 0,
      lastActivityDate: null,
      daysUntilReset: 0,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let streak = 0;
  let currentDate = new Date(today);
  const activityDates = new Set();

  // Group activities by date
  activities.forEach(activity => {
    const activityDate = new Date(activity.timestamp);
    const dateKey = `${activityDate.getFullYear()}-${activityDate.getMonth()}-${activityDate.getDate()}`;
    activityDates.add(dateKey);
  });

  // Calculate consecutive days with activity
  while (true) {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    
    if (activityDates.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Allow 1 day grace period
      if (streak === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        const prevDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        if (activityDates.has(prevDateKey)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  const lastActivity = activities[0];
  const lastActivityDate = lastActivity ? lastActivity.timestamp : null;
  
  // Calculate days until streak resets (grace period)
  const hoursSinceLastActivity = lastActivityDate 
    ? (now.getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60)
    : 48;
  
  const daysUntilReset = Math.max(0, 48 - hoursSinceLastActivity) / 24;

  return {
    currentStreak: streak,
    lastActivityDate,
    daysUntilReset: Math.round(daysUntilReset * 10) / 10,
  };
}

// Helper function to record activity
async function recordActivity(address: string, activityType: string) {
  return await prisma.userActivity.create({
    data: {
      userAddress: address.toLowerCase(),
      type: activityType,
      description: `User ${activityType.toLowerCase()} activity`,
      timestamp: new Date(),
    },
  });
}
