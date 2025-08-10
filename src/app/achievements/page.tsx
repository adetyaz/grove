"use client";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  useAchievements,
  ACHIEVEMENT_DEFINITIONS,
} from "@/hooks/useAchievements";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Share2, ArrowLeft, Award, Target } from "lucide-react";
import { groveToast } from "@/lib/toast";

export default function AchievementsPage() {
  const { user, primaryWallet } = useDynamicConnection();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "earned" | "locked" | "claimable"
  >("all");
  const [claimableAchievements, setClaimableAchievements] = useState<number[]>(
    []
  );
  const [loadingClaimable, setLoadingClaimable] = useState(false);

  const {
    achievementProgress,
    loadingAchievements,
    achievementCount,
    achievementStats,
    checkClaimableAchievements,
    claimAchievementNFT,
  } = useAchievements();

  const connectionState = {
    isConnected: !!(user && primaryWallet?.address),
    address: primaryWallet?.address,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connectionState.isConnected) {
      router.push("/");
    }
  }, [mounted, connectionState.isConnected, router]);

  // Check for claimable achievements when component loads
  const loadClaimableAchievements = useCallback(async () => {
    if (!primaryWallet?.address) return;

    try {
      setLoadingClaimable(true);

      // Check which achievements are claimable (earned but not minted)
      const allAchievementIds = achievementProgress.map((a) => a.id);
      const claimableData = await checkClaimableAchievements(allAchievementIds);

      if (claimableData?.claimable) {
        setClaimableAchievements(claimableData.claimable);
      }
    } catch (error) {
      console.error("Error checking claimable achievements:", error);
    } finally {
      setLoadingClaimable(false);
    }
  }, [primaryWallet?.address, achievementProgress, checkClaimableAchievements]);

  useEffect(() => {
    if (primaryWallet?.address && mounted) {
      loadClaimableAchievements();
    }
  }, [primaryWallet?.address, mounted, loadClaimableAchievements]);

  const handleClaimAchievement = async (achievementId: number) => {
    try {
      await claimAchievementNFT(achievementId);

      // Refresh claimable achievements after successful claim
      await loadClaimableAchievements();

      groveToast.success("🎉 Achievement NFT claimed successfully!");
    } catch (error) {
      console.error("Error claiming achievement:", error);
      groveToast.error("Failed to claim achievement NFT");
    }
  };

  const handleShare = (achievement: any) => {
    const shareText = `🏆 I just unlocked "${achievement.name}" on Grove! ${achievement.description} #GroveAchievements #Bitcoin`;

    if (navigator.share) {
      navigator.share({
        title: `Grove Achievement: ${achievement.name}`,
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      groveToast.success("Achievement shared! Text copied to clipboard.");
    }
  };

  const filteredAchievements = achievementProgress.filter((achievement) => {
    if (filter === "earned") return achievement.earned;
    if (filter === "locked") return !achievement.earned;
    if (filter === "claimable")
      return claimableAchievements.includes(achievement.id);
    return true;
  });

  const completionPercentage = Math.round(
    (achievementCount / ACHIEVEMENT_DEFINITIONS.length) * 100
  );

  if (!mounted || !connectionState.isConnected) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-primary mb-6'></div>
        <p className='text-white text-lg'>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Header */}
      <header className='border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='ghost'
                onClick={() => router.push("/dashboard")}
                className='flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Back to Dashboard</span>
              </Button>
              <div className='w-px h-6 bg-white/20'></div>
              <h1 className='text-2xl font-bold text-primary flex items-center'>
                <Trophy className='w-6 h-6 mr-2' />
                🌳 Grove Achievements
              </h1>
            </div>
            <Badge
              variant='secondary'
              className='bg-secondary/20 text-secondary text-lg px-4 py-2'
            >
              {achievementCount} / {ACHIEVEMENT_DEFINITIONS.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 lg:px-8 py-8'>
        {/* Progress Overview */}
        <Card className='bg-gradient-to-br from-primary/20 to-primary/30 border-primary/40 mb-8'>
          <CardContent className='p-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-3xl font-bold text-white mb-2'>
                  Your Progress
                </h2>
                <p className='text-gray-300'>
                  {completionPercentage}% Complete • {achievementCount} of{" "}
                  {ACHIEVEMENT_DEFINITIONS.length} unlocked
                </p>
              </div>
              <div className='text-6xl'>
                {completionPercentage === 100
                  ? "🏆"
                  : completionPercentage >= 75
                  ? "⭐"
                  : completionPercentage >= 50
                  ? "🥇"
                  : "🌱"}
              </div>
            </div>

            <div className='w-full bg-white/20 rounded-full h-4 mb-4'>
              <div
                className='bg-primary h-4 rounded-full transition-all duration-500'
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className='grid grid-cols-3 gap-4 text-center'>
              <div className='bg-white/10 rounded-lg p-4'>
                <div className='text-2xl font-bold text-white'>
                  {achievementCount}
                </div>
                <div className='text-sm text-gray-400'>Earned</div>
              </div>
              <div className='bg-white/10 rounded-lg p-4'>
                <div className='text-2xl font-bold text-white'>
                  {ACHIEVEMENT_DEFINITIONS.length - achievementCount}
                </div>
                <div className='text-sm text-gray-400'>Remaining</div>
              </div>
              <div className='bg-white/10 rounded-lg p-4'>
                <div className='text-2xl font-bold text-white'>
                  {completionPercentage}%
                </div>
                <div className='text-sm text-gray-400'>Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className='flex space-x-4 mb-8'>
          {[
            { key: "all", label: "All Achievements", icon: Award },
            { key: "earned", label: "Earned", icon: Trophy },
            { key: "claimable", label: "Claimable", icon: Target },
            { key: "locked", label: "Locked", icon: Lock },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key as any)}
              className={`flex items-center space-x-2 ${
                filter === key
                  ? "bg-primary hover:bg-primary/90 text-black"
                  : "border-white/20 text-black hover:bg-white/10"
              }`}
            >
              <Icon className='w-4 h-4' />
              <span>{label}</span>
              <Badge variant='secondary' className='ml-2'>
                {key === "all"
                  ? ACHIEVEMENT_DEFINITIONS.length
                  : key === "earned"
                  ? achievementCount
                  : key === "claimable"
                  ? claimableAchievements.length
                  : ACHIEVEMENT_DEFINITIONS.length - achievementCount}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loadingAchievements ? (
          <div className='text-center py-16'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-white mb-2'>
              Loading Achievements
            </h3>
            <p className='text-gray-300'>
              Fetching your progress from the blockchain...
            </p>
          </div>
        ) : (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`transition-all duration-300 hover-lift ${
                  achievement.earned
                    ? "bg-gradient-to-br from-accent/20 to-accent/30 border-accent/40"
                    : claimableAchievements.includes(achievement.id)
                    ? "bg-gradient-to-br from-primary/20 to-primary/30 border-primary/40"
                    : "bg-white/10 border-white/20 opacity-75"
                }`}
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`text-4xl ${
                          achievement.earned ? "" : "grayscale opacity-50"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <CardTitle className='text-white text-lg'>
                          {achievement.name}
                        </CardTitle>
                        {achievement.earned ? (
                          <Badge
                            variant='secondary'
                            className='bg-accent/20 text-accent mt-1'
                          >
                            Unlocked
                          </Badge>
                        ) : claimableAchievements.includes(achievement.id) ? (
                          <Badge
                            variant='secondary'
                            className='bg-primary/20 text-primary mt-1'
                          >
                            Claimable
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    {achievement.earned ? (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleShare(achievement)}
                        className='border-accent/40 text-accent hover:bg-accent/20'
                      >
                        <Share2 className='w-4 h-4' />
                      </Button>
                    ) : claimableAchievements.includes(achievement.id) ? (
                      <Button
                        variant='default'
                        size='sm'
                        onClick={() => handleClaimAchievement(achievement.id)}
                        className='bg-primary hover:bg-primary/90 text-black'
                        disabled={loadingClaimable}
                      >
                        {loadingClaimable ? (
                          <div className='w-4 h-4 animate-spin rounded-full border-b-2 border-current' />
                        ) : (
                          "Claim NFT"
                        )}
                      </Button>
                    ) : (
                      <Lock className='w-5 h-5 text-gray-500' />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p
                    className={`${
                      achievement.earned ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {achievement.description}
                  </p>
                  {achievement.threshold && (
                    <p className='text-sm text-gray-400 mt-2'>
                      Target: {achievement.threshold}{" "}
                      {achievement.id === 4 ? "days" : "BTC"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredAchievements.length === 0 && !loadingAchievements && (
          <div className='text-center py-16'>
            <Target className='w-16 h-16 text-gray-500 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No {filter} achievements
            </h3>
            <p className='text-gray-400'>
              {filter === "earned"
                ? "Start contributing to unlock your first achievement!"
                : "All achievements have been unlocked! 🎉"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
