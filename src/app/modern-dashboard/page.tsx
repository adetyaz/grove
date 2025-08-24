"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import NavigationHeader from "@/components/navigation-header";

export default function Dashboard() {
  // Mock data - replace with real data from your contracts
  const stats = {
    totalCircles: 5,
    completionRate: 87,
    totalSaved: 2.45,
    achievements: 12,
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <NavigationHeader />

      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Welcome back, Alex 👋
          </h1>
          <p className='text-slate-600'>Stay focused, keep saving!</p>
        </div>

        {/* Key Stats */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <Users className='w-8 h-8 text-white' />
            </div>
            <p className='text-2xl font-bold text-slate-900'>
              {stats.totalCircles}
            </p>
            <p className='text-sm text-slate-600'>Active Circles</p>
          </div>

          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <Target className='w-8 h-8 text-white' />
            </div>
            <p className='text-2xl font-bold text-slate-900'>
              {stats.completionRate}%
            </p>
            <p className='text-sm text-slate-600'>Completion</p>
          </div>

          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <Wallet className='w-8 h-8 text-white' />
            </div>
            <p className='text-2xl font-bold text-slate-900'>
              {stats.totalSaved}
            </p>
            <p className='text-sm text-slate-600'>BTC Saved</p>
          </div>

          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <Trophy className='w-8 h-8 text-white' />
            </div>
            <p className='text-2xl font-bold text-slate-900'>
              {stats.achievements}
            </p>
            <p className='text-sm text-slate-600'>Achievements</p>
          </div>

          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <TrendingUp className='w-8 h-8 text-white' />
            </div>
            <p className='text-2xl font-bold text-slate-900'>+12%</p>
            <p className='text-sm text-slate-600'>Growth</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Active Circles */}
          <div className='lg:col-span-2'>
            <Card className='bg-white/60 backdrop-blur-sm border-0 shadow-lg'>
              <CardHeader className='flex flex-row items-center justify-between pb-4'>
                <CardTitle className='text-xl font-bold text-slate-900'>
                  Your Active Circles
                </CardTitle>
                <Link href='/circles'>
                  <Button size='sm' className='bg-slate-900 hover:bg-slate-800'>
                    View All <ArrowRight className='w-4 h-4 ml-1' />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Circle Card 1 */}
                <div className='p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center'>
                        <Target className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-slate-900'>
                          Emergency Fund
                        </h3>
                        <p className='text-sm text-slate-600'>0.5 BTC Goal</p>
                      </div>
                    </div>
                    <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100'>
                      Active
                    </Badge>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-slate-600'>Progress</span>
                      <span className='font-medium text-slate-900'>
                        0.35 / 0.5 BTC
                      </span>
                    </div>
                    <Progress value={70} className='h-2' />
                  </div>
                </div>

                {/* Circle Card 2 */}
                <div className='p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center'>
                        <Wallet className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-slate-900'>
                          Vacation Savings
                        </h3>
                        <p className='text-sm text-slate-600'>0.2 BTC Goal</p>
                      </div>
                    </div>
                    <Badge className='bg-green-100 text-green-700 hover:bg-green-100'>
                      Active
                    </Badge>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-slate-600'>Progress</span>
                      <span className='font-medium text-slate-900'>
                        0.12 / 0.2 BTC
                      </span>
                    </div>
                    <Progress value={60} className='h-2' />
                  </div>
                </div>

                {/* Circle Card 3 */}
                <div className='p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center'>
                        <Trophy className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-slate-900'>
                          Investment Fund
                        </h3>
                        <p className='text-sm text-slate-600'>1.0 BTC Goal</p>
                      </div>
                    </div>
                    <Badge className='bg-purple-100 text-purple-700 hover:bg-purple-100'>
                      Active
                    </Badge>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-slate-600'>Progress</span>
                      <span className='font-medium text-slate-900'>
                        0.8 / 1.0 BTC
                      </span>
                    </div>
                    <Progress value={80} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card className='bg-white/60 backdrop-blur-sm border-0 shadow-lg'>
              <CardHeader>
                <CardTitle className='text-lg font-bold text-slate-900'>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Link href='/create'>
                  <Button className='w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'>
                    <Target className='w-4 h-4 mr-2' />
                    Create New Circle
                  </Button>
                </Link>
                <Link href='/join'>
                  <Button
                    variant='outline'
                    className='w-full justify-start border-slate-200 hover:bg-slate-50'
                  >
                    <Users className='w-4 h-4 mr-2' />
                    Join a Circle
                  </Button>
                </Link>
                <Link href='/invite'>
                  <Button
                    variant='outline'
                    className='w-full justify-start border-slate-200 hover:bg-slate-50'
                  >
                    <ArrowRight className='w-4 h-4 mr-2' />
                    Invite Friends
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className='bg-white/60 backdrop-blur-sm border-0 shadow-lg'>
              <CardHeader className='flex flex-row items-center justify-between pb-4'>
                <CardTitle className='text-lg font-bold text-slate-900'>
                  Recent Achievements
                </CardTitle>
                <Link href='/achievements'>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='text-slate-600 hover:text-slate-900'
                  >
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                    <Trophy className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <p className='font-medium text-slate-900'>First Circle</p>
                    <p className='text-sm text-slate-600'>
                      Completed your first savings circle
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center'>
                    <Target className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <p className='font-medium text-slate-900'>Goal Getter</p>
                    <p className='text-sm text-slate-600'>
                      Reached 3 savings goals
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center'>
                    <Users className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <p className='font-medium text-slate-900'>Team Player</p>
                    <p className='text-sm text-slate-600'>
                      Joined 5 different circles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className='bg-white/60 backdrop-blur-sm border-0 shadow-lg'>
              <CardHeader>
                <CardTitle className='text-lg font-bold text-slate-900'>
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm text-slate-600'>Savings Goal</span>
                    <span className='text-sm font-medium text-slate-900'>
                      0.12 / 0.15 BTC
                    </span>
                  </div>
                  <Progress value={80} className='h-2' />
                </div>

                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm text-slate-600'>
                      Circle Participation
                    </span>
                    <span className='text-sm font-medium text-slate-900'>
                      18 / 20 days
                    </span>
                  </div>
                  <Progress value={90} className='h-2' />
                </div>

                <div className='pt-2 border-t border-slate-100'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-slate-600'>
                      Overall Score
                    </span>
                    <div className='flex items-center space-x-1'>
                      <span className='text-lg font-bold text-green-600'>
                        4.25
                      </span>
                      <span className='text-yellow-500'>⭐</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
