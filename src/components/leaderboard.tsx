"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { formatBTCAmount } from "@/hooks/useDashboardData";

interface LeaderboardEntry {
  address: string;
  name?: string;
  totalContributed: bigint;
  circlesCount: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userAddress: string;
}

export default function Leaderboard({
  entries,
  userAddress,
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='w-5 h-5 text-yellow-400' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-300' />;
      case 3:
        return <Award className='w-5 h-5 text-orange-400' />;
      default:
        return (
          <span className='w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400'>
            #{rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "from-orange-500/20 to-orange-600/20 border-orange-500/30";
      default:
        return "from-gray-700/20 to-gray-800/20 border-gray-600/30";
    }
  };

  const displayEntries = entries;

  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-white flex items-center'>
          <TrendingUp className='w-5 h-5 mr-2 text-orange-400' />
          Contribution Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {displayEntries.length === 0 ? (
          <div className='text-center py-8'>
            <TrendingUp className='w-12 h-12 text-gray-600 mx-auto mb-4' />
            <p className='text-gray-400 mb-2'>No leaderboard data yet</p>
            <p className='text-sm text-gray-500'>
              Start contributing to circles to see your ranking!
            </p>
          </div>
        ) : (
          displayEntries.map((entry) => (
            <div
              key={entry.address}
              className={`p-4 rounded-lg border bg-gradient-to-r ${
                entry.isCurrentUser || entry.address === userAddress
                  ? "from-green-500/20 to-green-600/20 border-green-500/40"
                  : getRankColor(entry.rank)
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {getRankIcon(entry.rank)}
                  <div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium text-white'>
                        {entry.address === userAddress
                          ? "You"
                          : entry.name ||
                            `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                      </span>
                      {entry.address === userAddress && (
                        <span className='px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full'>
                          You
                        </span>
                      )}
                    </div>
                    <div className='text-sm text-gray-400'>
                      {entry.circlesCount} circle
                      {entry.circlesCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-bold text-white'>
                    {formatBTCAmount(entry.totalContributed)}
                  </div>
                  <div className='text-xs text-gray-400'>Total contributed</div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
