"use client";

import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RecentActivity from "@/components/recent-activity";
import Leaderboard from "@/components/leaderboard";
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Shield,
  ExternalLink,
  Activity,
  Crown,
  Award,
  Star,
  Zap,
  Gift,
} from "lucide-react";

interface UserStats {
  totalCircles: number;
  completedCircles: number;
  overallProgress: number;
}

export default function OverviewPage() {
  const { primaryWallet } = useDynamicConnection();
  const {
    currentStreak,
    longestStreak,
    loading: streakLoading,
    getStreakStatus,
    streakProgress,
    daysToNextMilestone,
    isStreakActive,
  } = useStreakTracking();
  const [userStats, setUserStats] = useState<UserStats>({
    totalCircles: 0,
    completedCircles: 0,
    overallProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const userAddress = primaryWallet?.address;
  const userName = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "Guest";
  const userInitials = userName.substring(0, 2).toUpperCase();

  useEffect(() => {
    const fetchData = async () => {
      if (!userAddress) return;

      try {
        setIsLoading(true);

        // Fetch user circles and stats
        const response = await fetch(
          `/api/user/circles?wallet=${userAddress}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const circles = data.circles || [];

          const totalCircles = circles.length;
          const completedCircles = circles.filter(
            (circle: any) => circle.status === "completed"
          ).length;
          const overallProgress =
            totalCircles > 0 ? (completedCircles / totalCircles) * 100 : 0;

          setUserStats({
            totalCircles,
            completedCircles,
            overallProgress,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userAddress]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className='space-y-6 px-4 sm:px-6 lg:px-8'>
      {/* Welcome Card - Full Width */}
      <Card className='bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-none text-white overflow-hidden relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-black/20 to-transparent' />
        <CardContent className='p-4 relative z-10'>
          <div className='flex items-center space-x-6'>
            {/* Profile Avatar */}
            <div className='relative'>
              <Avatar className='w-20 h-20 border-4 border-white/30 shadow-2xl'>
                <AvatarFallback className='bg-white/20 text-white font-bold text-xl'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg'>
                <span className='text-white font-bold text-sm'>🔥</span>
              </div>
            </div>

            {/* Welcome Content */}
            <div className='flex-1'>
              <h1 className='text-xl font-bold mb-2'>
                {getGreeting()}, {userName}!
              </h1>
              <p className='text-emerald-100 text-base mb-4'>
                Welcome back to your Grove dashboard
              </p>

              {/* Streak Display */}
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2'>
                  <Calendar className='w-5 h-5 text-orange-300' />
                  <span className='font-semibold'>
                    {streakLoading ? "..." : currentStreak} day streak
                  </span>
                </div>
                {longestStreak > currentStreak && (
                  <div className='flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1'>
                    <Trophy className='w-4 h-4 text-yellow-300' />
                    <span className='text-sm'>Best: {longestStreak} days</span>
                  </div>
                )}
                <div className='text-sm text-emerald-100'>
                  {isStreakActive ? "Keep it up!" : "Start your streak today!"}
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className='hidden lg:block'>
              <div className='w-32 h-32 bg-white/10 rounded-full flex items-center justify-center'>
                <TrendingUp className='w-8 h-8 text-white/80' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circles Progress Card */}
      <Card className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl font-bold flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <Users className='w-6 h-6 text-white' />
              </div>
              <span>Circles</span>
            </CardTitle>
            <div className='text-right'>
              <div className='text-3xl font-bold text-blue-400'>
                {isLoading
                  ? "..."
                  : `${userStats.completedCircles}/${userStats.totalCircles}`}
              </div>
              <div className='text-sm text-slate-400'>Completed</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Progress Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-slate-700/50 rounded-lg p-4 text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Target className='w-5 h-5 text-green-400 mr-2' />
                <span className='text-sm text-slate-300'>Total Circles</span>
              </div>
              <div className='text-xl font-bold text-white'>
                {isLoading ? "..." : userStats.totalCircles}
              </div>
            </div>

            <div className='bg-slate-700/50 rounded-lg p-4 text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Trophy className='w-5 h-5 text-yellow-400 mr-2' />
                <span className='text-sm text-slate-300'>Completed</span>
              </div>
              <div className='text-xl font-bold text-white'>
                {isLoading ? "..." : userStats.completedCircles}
              </div>
            </div>

            <div className='bg-slate-700/50 rounded-lg p-4 text-center'>
              <div className='flex items-center justify-center mb-2'>
                <TrendingUp className='w-5 h-5 text-blue-400 mr-2' />
                <span className='text-sm text-slate-300'>Success Rate</span>
              </div>
              <div className='text-xl font-bold text-white'>
                {isLoading
                  ? "..."
                  : `${Math.round(userStats.overallProgress)}%`}
              </div>
            </div>
          </div>

          {/* Accumulative Progress Bar */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold text-white'>
                Overall Progress
              </span>
              <span className='text-lg font-bold text-blue-400'>
                {isLoading
                  ? "..."
                  : `${Math.round(userStats.overallProgress)}%`}
              </span>
            </div>

            <div className='relative'>
              <Progress
                value={isLoading ? 0 : userStats.overallProgress}
                className='h-4 bg-slate-700'
              />
              <div
                className='absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full opacity-80'
                style={{
                  width: `${isLoading ? 0 : userStats.overallProgress}%`,
                }}
              />
            </div>

            <div className='flex justify-between text-sm text-slate-400'>
              <span>Starting your journey</span>
              <span>Circle master</span>
            </div>
          </div>

          {/* Motivational Message */}
          {userStats.totalCircles > 0 && (
            <div className='bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-lg p-4 mt-4'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Trophy className='w-4 h-4 text-white' />
                </div>
                <div>
                  <div className='font-semibold text-emerald-300'>
                    {userStats.completedCircles === userStats.totalCircles
                      ? "Congratulations! You've completed all your circles!"
                      : `${
                          userStats.totalCircles - userStats.completedCircles
                        } more circle${
                          userStats.totalCircles -
                            userStats.completedCircles !==
                          1
                            ? "s"
                            : ""
                        } to go!`}
                  </div>
                  <div className='text-sm text-emerald-400'>
                    {userStats.completedCircles === userStats.totalCircles
                      ? "You're a true Grove master!"
                      : "Keep contributing to reach your goals"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streak Progress Section */}
          {currentStreak > 0 && (
            <div className='bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4 mt-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm'>🔥</span>
                  </div>
                  <span className='font-semibold text-orange-300'>
                    Streak Progress
                  </span>
                </div>
                <span className='text-orange-300 font-bold'>
                  {currentStreak}/7 days
                </span>
              </div>

              <div className='relative mb-2'>
                <Progress
                  value={streakProgress}
                  className='h-3 bg-orange-900/50'
                />
                <div
                  className='absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full'
                  style={{ width: `${streakProgress}%` }}
                />
              </div>

              <div className='text-sm text-orange-200'>
                {daysToNextMilestone > 0
                  ? `${daysToNextMilestone} more days to earn the Consistency King achievement!`
                  : "🏆 Consistency King achievement unlocked!"}
              </div>

              {/* Streak Status Message */}
              <div className='mt-2 text-xs text-orange-300 bg-orange-900/30 rounded px-2 py-1'>
                {getStreakStatus()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <a
          href='/create'
          className='flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
        >
          <Plus className='w-6 h-6' />
          <span className='font-semibold'>Create Circle</span>
        </a>

        <a
          href='/dashboard/inheritance/create'
          className='flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
        >
          <Shield className='w-6 h-6' />
          <span className='font-semibold'>Create Inheritance</span>
        </a>
      </div>

      {/* Achievements Card */}
      <Card className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white mb-6'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl font-bold flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center'>
                <Trophy className='w-6 h-6 text-white' />
              </div>
              <span>Achievements</span>
            </CardTitle>
            <a
              href='/dashboard/achievements'
              className='flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors'
            >
              <span className='text-sm'>View All</span>
              <ExternalLink className='w-4 h-4' />
            </a>
          </div>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* Achievement Items */}
            <div className='bg-slate-700/50 rounded-lg p-4 text-center relative'>
              <div className='w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Star className='w-6 h-6 text-white' />
              </div>
              <div className='text-sm font-semibold text-yellow-400 mb-1'>
                First Circle
              </div>
              <div className='text-xs text-slate-400'>
                Join your first circle
              </div>
              <div className='absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full'></div>
            </div>

            <div className='bg-slate-700/50 rounded-lg p-4 text-center relative'>
              <div className='w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Calendar className='w-6 h-6 text-white' />
              </div>
              <div className='text-sm font-semibold text-orange-400 mb-1'>
                Streak Master
              </div>
              <div className='text-xs text-slate-400'>
                7 day contribution streak
              </div>
              {currentStreak >= 7 && (
                <div className='absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full'></div>
              )}
            </div>

            <div className='bg-slate-700/50 rounded-lg p-4 text-center relative'>
              <div className='w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Zap className='w-6 h-6 text-white' />
              </div>
              <div className='text-sm font-semibold text-purple-400 mb-1'>
                Power User
              </div>
              <div className='text-xs text-slate-400'>Complete 5 circles</div>
              {userStats.completedCircles >= 5 && (
                <div className='absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full'></div>
              )}
            </div>

            <div className='bg-slate-700/50 rounded-lg p-4 text-center relative'>
              <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Gift className='w-6 h-6 text-white' />
              </div>
              <div className='text-sm font-semibold text-blue-400 mb-1'>
                Generous
              </div>
              <div className='text-xs text-slate-400'>Send 10 gifts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      {userAddress && <RecentActivity userAddress={userAddress} />}

      {/* Leaderboard Card */}
      {userAddress && <Leaderboard userAddress={userAddress} />}
    </div>
  );
}
