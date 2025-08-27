"use client";

import { useState, useEffect, useCallback } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";

interface StreakUser {
  userAddress: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  lastActivityDate: string | null;
  rank: number;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  daysUntilReset: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
}

export default function StreakLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<StreakUser[]>([]);
  const [userStreak, setUserStreak] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/user/streak/leaderboard");
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching streak leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStreak = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/user/streak?address=${address}`);
      const data = await response.json();

      if (data.currentStreak !== undefined) {
        setUserStreak(data);
      }
    } catch (error) {
      console.error("Error fetching user streak:", error);
    }
  }, [address]);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // Remove fetchUserStreak from dependencies to prevent infinite loop

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 100)
      return { emoji: "👑", label: "Century Club", color: "text-yellow-300" };
    if (streak >= 60)
      return {
        emoji: "🔥",
        label: "Consistency King",
        color: "text-orange-300",
      };
    if (streak >= 30)
      return { emoji: "💎", label: "Monthly Master", color: "text-blue-300" };
    if (streak >= 14)
      return {
        emoji: "🏆",
        label: "Two Week Champion",
        color: "text-purple-300",
      };
    if (streak >= 7)
      return { emoji: "⚡", label: "Week Warrior", color: "text-green-300" };
    if (streak >= 3)
      return { emoji: "🌟", label: "Getting Started", color: "text-gray-300" };
    return { emoji: "🔘", label: "Beginner", color: "text-gray-400" };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
        <div className='animate-pulse'>
          <div className='h-6 bg-white/20 rounded mb-4'></div>
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-12 bg-white/10 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-white mb-2'>
          🔥 Streak Leaderboard
        </h2>
        <p className='text-gray-300'>
          Who has the longest contribution streak?
        </p>
      </div>

      {/* User's Personal Streak */}
      {address && userStreak && (
        <div className='bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-white font-semibold'>Your Streak</h3>
              <p className='text-gray-300 text-sm'>{formatAddress(address)}</p>
            </div>
            <div className='text-right'>
              <div className='flex items-center space-x-2'>
                <span className='text-2xl'>
                  {getStreakBadge(userStreak.currentStreak).emoji}
                </span>
                <div>
                  <div className='text-xl font-bold text-white'>
                    {userStreak.currentStreak} days
                  </div>
                  <div
                    className={`text-xs ${
                      getStreakBadge(userStreak.currentStreak).color
                    }`}
                  >
                    {getStreakBadge(userStreak.currentStreak).label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className='mt-4 space-y-2'>
            <div>
              <div className='flex justify-between text-xs text-gray-400 mb-1'>
                <span>Weekly Goal (3 contributions)</span>
                <span>{userStreak.weeklyGoalProgress.toFixed(0)}%</span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${Math.min(userStreak.weeklyGoalProgress, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className='flex justify-between text-xs text-gray-400 mb-1'>
                <span>Monthly Goal (12 contributions)</span>
                <span>{userStreak.monthlyGoalProgress.toFixed(0)}%</span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${Math.min(userStreak.monthlyGoalProgress, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {userStreak.daysUntilReset > 0 && (
            <div className='mt-3 text-xs text-yellow-300'>
              ⚠️ Contribute in {userStreak.daysUntilReset} day
              {userStreak.daysUntilReset > 1 ? "s" : ""} to maintain your
              streak!
            </div>
          )}
        </div>
      )}

      {/* Top Streaks */}
      <div className='space-y-3'>
        {leaderboard.length === 0 ? (
          <div className='text-center py-8'>
            <div className='text-4xl mb-2'>🔥</div>
            <h3 className='text-white font-semibold mb-2'>No Streaks Yet</h3>
            <p className='text-gray-400'>
              Be the first to start a contribution streak!
            </p>
          </div>
        ) : (
          leaderboard.map((user, index) => {
            const badge = getStreakBadge(user.currentStreak);
            const isCurrentUser =
              address &&
              user.userAddress.toLowerCase() === address.toLowerCase();

            return (
              <div
                key={user.userAddress}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isCurrentUser
                    ? "bg-purple-500/20 border-purple-500/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-xl font-bold text-white min-w-[40px]'>
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <div className='text-white font-medium'>
                      {formatAddress(user.userAddress)}
                      {isCurrentUser && (
                        <span className='text-purple-300 text-xs ml-2'>
                          (You)
                        </span>
                      )}
                    </div>
                    <div className='text-gray-400 text-sm'>
                      {user.totalContributions} total contributions
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-xl'>{badge.emoji}</span>
                    <div>
                      <div className='text-lg font-bold text-white'>
                        {user.currentStreak} days
                      </div>
                      <div className={`text-xs ${badge.color}`}>
                        {badge.label}
                      </div>
                    </div>
                  </div>
                  {user.longestStreak > user.currentStreak && (
                    <div className='text-xs text-gray-400 mt-1'>
                      Best: {user.longestStreak} days
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Streak Achievements Info */}
      <div className='mt-6 p-4 bg-white/5 rounded-lg'>
        <h4 className='text-white font-semibold mb-3'>Streak Achievements</h4>
        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='flex items-center space-x-2'>
            <span>🌟</span>
            <span className='text-gray-300'>3 days - Getting Started</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>⚡</span>
            <span className='text-gray-300'>7 days - Week Warrior</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>🏆</span>
            <span className='text-gray-300'>14 days - Two Week Champion</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>💎</span>
            <span className='text-gray-300'>30 days - Monthly Master</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>🔥</span>
            <span className='text-gray-300'>60 days - Consistency King</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>👑</span>
            <span className='text-gray-300'>100 days - Century Club</span>
          </div>
        </div>
      </div>
    </div>
  );
}
