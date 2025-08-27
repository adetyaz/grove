"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";

interface LeaderboardProps {
  userAddress: string;
}

export default function Leaderboard({ userAddress }: LeaderboardProps) {
  const { leaderboardData, loading } = useLeaderboard(userAddress);
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='w-5 h-5 text-accent' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-300' />;
      case 3:
        return <Award className='w-5 h-5 text-primary' />;
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
        return "from-accent/20 to-accent/30 border-accent/40";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "from-primary/20 to-primary/30 border-primary/40";
      default:
        return "from-white/10 to-white/5 border-white/20";
    }
  };

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
      <CardHeader>
        <CardTitle className='text-white flex items-center'>
          <TrendingUp className='w-5 h-5 mr-2 text-accent' />
          Contribution Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-gray-400'>Loading leaderboard...</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className='text-center py-8'>
            <TrendingUp className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <p className='text-gray-400 mb-2'>No leaderboard data yet</p>
            <p className='text-sm text-gray-500'>
              Start contributing to circles to see your ranking!
            </p>
          </div>
        ) : (
          leaderboardData.map((entry) => (
            <div
              key={entry.address}
              className={`p-4 rounded-lg border bg-gradient-to-r transition-all duration-300 hover-lift ${
                entry.isCurrentUser || entry.address === userAddress
                  ? "from-secondary/20 to-secondary/30 border-secondary/40"
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
                            `${entry.address.slice(
                              0,
                              6
                            )}...${entry.address.slice(-4)}`}
                      </span>
                      {entry.address === userAddress && (
                        <span className='px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full'>
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
                    ${entry.totalContributed}
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
