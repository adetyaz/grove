"use client";

import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Crown,
  Users,
  Bitcoin,
  Target,
  Zap,
} from "lucide-react";

interface LeaderboardEntry {
  address: string;
  score: number;
  rank: number;
  totalContributions: number;
  activeCircles: number;
  achievements: number;
}

export default function LeaderboardPage() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/user/streak/leaderboard");
        if (response.ok) {
          const data = await response.json();
          setLeaderboardData(data.leaderboard || []);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className='w-6 h-6 text-yellow-500' />;
      case 2:
        return <Medal className='w-6 h-6 text-slate-400' />;
      case 3:
        return <Medal className='w-6 h-6 text-amber-600' />;
      default:
        return (
          <span className='w-6 h-6 flex items-center justify-center text-slate-400 font-bold'>
            #{rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default:
        return "bg-slate-800/50 border-slate-700";
    }
  };

  const LeaderboardCard = ({ entry }: { entry: LeaderboardEntry }) => {
    const isCurrentUser =
      address && entry.address.toLowerCase() === address.toLowerCase();

    return (
      <Card
        className={`${getRankColor(entry.rank)} ${
          isCurrentUser ? "ring-2 ring-blue-500/50" : ""
        }`}
      >
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center justify-center w-12 h-12 bg-slate-700/50 rounded-full'>
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <div className='flex items-center space-x-2'>
                  <p className='font-semibold text-white'>{entry.address}</p>
                  {isCurrentUser && (
                    <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>
                      You
                    </Badge>
                  )}
                </div>
                <p className='text-slate-400 text-sm'>Rank #{entry.rank}</p>
              </div>
            </div>

            <div className='text-right'>
              <p className='text-2xl font-bold text-white'>
                {entry.score.toLocaleString()}
              </p>
              <p className='text-slate-400 text-sm'>Grove Points</p>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50'>
            <div className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Bitcoin className='w-4 h-4 text-orange-500' />
              </div>
              <p className='text-lg font-semibold text-white'>
                {entry.totalContributions.toFixed(2)}
              </p>
              <p className='text-xs text-slate-400'>Total BTC</p>
            </div>

            <div className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Users className='w-4 h-4 text-blue-500' />
              </div>
              <p className='text-lg font-semibold text-white'>
                {entry.activeCircles}
              </p>
              <p className='text-xs text-slate-400'>Active Circles</p>
            </div>

            <div className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Trophy className='w-4 h-4 text-purple-500' />
              </div>
              <p className='text-lg font-semibold text-white'>
                {entry.achievements}
              </p>
              <p className='text-xs text-slate-400'>Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <Trophy className='w-16 h-16 text-slate-600 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-4'>
            Connect Your Wallet
          </h2>
          <p className='text-slate-400'>
            Please connect your wallet to view the leaderboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Leaderboard</h1>
        <p className='text-slate-400'>
          See how you stack up against the Grove community
        </p>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue='overall' className='space-y-8'>
        <TabsList className='grid w-full grid-cols-4 bg-slate-800/50'>
          <TabsTrigger
            value='overall'
            className='data-[state=active]:bg-slate-700'
          >
            Overall
          </TabsTrigger>
          <TabsTrigger
            value='contributions'
            className='data-[state=active]:bg-slate-700'
          >
            Contributions
          </TabsTrigger>
          <TabsTrigger
            value='achievements'
            className='data-[state=active]:bg-slate-700'
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value='streaks'
            className='data-[state=active]:bg-slate-700'
          >
            Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overall' className='space-y-4'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-xl font-semibold text-white'>
              Top Contributors
            </h3>
            <div className='flex items-center space-x-2 text-slate-400'>
              <Zap className='w-4 h-4' />
              <span className='text-sm'>Updated in real-time</span>
            </div>
          </div>

          <div className='space-y-4'>
            {isLoading ? (
              <div className='text-center py-8 text-slate-400'>Loading...</div>
            ) : leaderboardData.length === 0 ? (
              <div className='text-center py-8 text-slate-400'>
                No leaderboard data available
              </div>
            ) : (
              leaderboardData.map((entry, index) => (
                <LeaderboardCard key={index} entry={entry} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='contributions' className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardContent className='text-center py-12'>
              <Bitcoin className='w-16 h-16 text-slate-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Contribution Leaderboard
              </h3>
              <p className='text-slate-400'>
                Rankings based on total BTC contributed to circles.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='achievements' className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardContent className='text-center py-12'>
              <Trophy className='w-16 h-16 text-slate-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Achievement Leaders
              </h3>
              <p className='text-slate-400'>
                Rankings based on achievements earned and completed challenges.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='streaks' className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardContent className='text-center py-12'>
              <Target className='w-16 h-16 text-slate-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Streak Champions
              </h3>
              <p className='text-slate-400'>
                Rankings based on contribution streaks and consistency.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
