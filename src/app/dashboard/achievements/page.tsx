"use client";

import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Lock,
  Star,
  Target,
  Users,
  Zap,
  Coins,
  DollarSign,
  Gem,
  Crown,
  Flame,
  Compass,
  Medal,
} from "lucide-react";
import WalletButton from "@/components/wallet-button";
import { useAchievementClaiming } from "@/hooks/useAchievementClaiming";
import { groveToast } from "@/lib/toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  threshold: number;
  unlocked: boolean;
  nftClaimed?: boolean;
}

export default function AchievementsPage() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const { claimAchievement } = useAchievementClaiming();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingIds, setClaimingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!address) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/user/achievements?address=${address}`
        );
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [address]);

  const handleClaimAchievement = async (achievementId: number) => {
    if (claimingIds.has(achievementId)) return;

    setClaimingIds((prev) => new Set(prev).add(achievementId));

    try {
      await claimAchievement(achievementId);

      // Refresh achievements to update NFT claimed status
      const response = await fetch(`/api/user/achievements?address=${address}`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }

      groveToast.success("🎉 Achievement NFT claimed successfully!");
    } catch (error) {
      console.error("Error claiming achievement:", error);
      groveToast.error("Failed to claim achievement NFT");
    } finally {
      setClaimingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(achievementId);
        return newSet;
      });
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "TARGET":
        return <Target className='w-6 h-6' />;
      case "COIN":
        return <Coins className='w-6 h-6' />;
      case "MONEY":
        return <DollarSign className='w-6 h-6' />;
      case "DIAMOND":
        return <Gem className='w-6 h-6' />;
      case "TROPHY":
        return <Trophy className='w-6 h-6' />;
      case "BUTTERFLY":
        return <Users className='w-6 h-6' />;
      case "NETWORK":
        return <Users className='w-6 h-6' />;
      case "CROWN":
        return <Crown className='w-6 h-6' />;
      case "FIRE":
        return <Flame className='w-6 h-6' />;
      case "LIGHTNING":
        return <Zap className='w-6 h-6' />;
      case "COMPASS":
        return <Compass className='w-6 h-6' />;
      case "MEDAL":
        return <Medal className='w-6 h-6' />;
      default:
        return <Star className='w-6 h-6' />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "milestone":
        return <Target className='w-5 h-5' />;
      case "contribution":
        return <Star className='w-5 h-5' />;
      case "social":
        return <Users className='w-5 h-5' />;
      case "streak":
        return <Zap className='w-5 h-5' />;
      default:
        return <Trophy className='w-5 h-5' />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "milestone":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "contribution":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "social":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "streak":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <Trophy className='w-16 h-16 text-slate-600 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-4'>
            Connect Your Wallet
          </h2>
          <p className='text-slate-400 mb-6'>
            Please connect your wallet to view your achievements.
          </p>
          <WalletButton
            variant='default'
            size='lg'
            className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Achievements</h1>
        <p className='text-slate-400'>
          Track your progress and unlock rewards on your savings journey
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card className='bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-white'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Unlocked</CardTitle>
            <Trophy className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {achievements.filter((a) => a.unlocked).length}
            </div>
            <p className='text-xs text-yellow-200'>
              of {achievements.length} achievements
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 text-white'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Progress</CardTitle>
            <Target className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {achievements.length > 0
                ? Math.round(
                    (achievements.filter((a) => a.unlocked).length /
                      achievements.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className='text-xs text-blue-200'>Overall completion</p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 text-white'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Next Reward</CardTitle>
            <Star className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {achievements.find((a) => !a.unlocked)?.name.slice(0, 8) ||
                "None"}
              ...
            </div>
            <p className='text-xs text-purple-200'>Coming up next</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {isLoading ? (
          <div className='col-span-full text-center py-8 text-slate-400'>
            Loading achievements...
          </div>
        ) : achievements.length === 0 ? (
          <div className='col-span-full text-center py-8 text-slate-400'>
            No achievements found
          </div>
        ) : (
          achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`bg-slate-800/50 border-slate-700 text-white transition-all duration-200 ${
                achievement.unlocked
                  ? "ring-2 ring-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10"
                  : "hover:border-slate-600"
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-slate-700 text-slate-500"
                      }`}
                    >
                      {achievement.unlocked ? (
                        getAchievementIcon(achievement.icon)
                      ) : (
                        <Lock className='w-6 h-6' />
                      )}
                    </div>
                    <div>
                      <CardTitle
                        className={`text-lg ${
                          achievement.unlocked ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {achievement.name}
                      </CardTitle>
                      <Badge className={getCategoryColor(achievement.category)}>
                        {getCategoryIcon(achievement.category)}
                        <span className='ml-1 capitalize'>
                          {achievement.category}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Trophy className='w-5 h-5 text-yellow-500' />
                  )}
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <p
                  className={`text-sm ${
                    achievement.unlocked ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {achievement.description}
                </p>

                {!achievement.unlocked && (
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-slate-400'>Progress</span>
                      <span className='text-sm font-semibold text-white'>
                        {achievement.progress || 0}%
                      </span>
                    </div>
                    <Progress
                      value={achievement.progress || 0}
                      className='h-2 bg-slate-700'
                    />
                  </div>
                )}

                {achievement.unlocked && (
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2 text-yellow-400'>
                      <Trophy className='w-4 h-4' />
                      <span className='text-sm font-medium'>
                        Achievement Unlocked!
                      </span>
                    </div>

                    {!achievement.nftClaimed ? (
                      <Button
                        onClick={() =>
                          handleClaimAchievement(parseInt(achievement.id))
                        }
                        disabled={claimingIds.has(parseInt(achievement.id))}
                        className='w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold'
                      >
                        {claimingIds.has(parseInt(achievement.id)) ? (
                          <>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Claiming NFT...
                          </>
                        ) : (
                          "🏆 Claim as NFT"
                        )}
                      </Button>
                    ) : (
                      <div className='text-center py-2 text-sm text-green-400'>
                        ✅ NFT Claimed
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
