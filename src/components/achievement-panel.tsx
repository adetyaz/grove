"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAchievements } from "@/hooks/useAchievements";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock } from "lucide-react";
import { useState, useEffect } from "react";

interface AchievementPanelProps {
  userAddress: string;
}

export default function AchievementPanel({}: AchievementPanelProps) {
  const {
    achievementProgress,
    loadingAchievements,
    achievementCount,
    checkClaimableAchievements,
  } = useAchievements();

  const [claimableAchievements, setClaimableAchievements] = useState<number[]>(
    []
  );

  useEffect(() => {
    const loadClaimable = async () => {
      try {
        const allIds = achievementProgress.map((a) => a.id);
        const claimableData = await checkClaimableAchievements(allIds);
        if (claimableData?.claimable) {
          setClaimableAchievements(claimableData.claimable);
        }
      } catch (error) {
        console.error("Error checking claimable achievements:", error);
      }
    };

    if (achievementProgress.length > 0) {
      loadClaimable();
    }
  }, [achievementProgress, checkClaimableAchievements]);

  if (loadingAchievements) {
    return (
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
        <CardHeader>
          <CardTitle className='text-white flex items-center'>
            <Trophy className='w-5 h-5 mr-2 text-accent' />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-gray-400'>Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedAchievements = achievementProgress.filter((a) => a.earned);
  const claimableAchievementsList = achievementProgress.filter((a) =>
    claimableAchievements.includes(a.id)
  );
  const nextAchievement = achievementProgress.find(
    (a) => !a.earned && !claimableAchievements.includes(a.id)
  );

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
      <CardHeader>
        <CardTitle className='text-white flex items-center justify-between'>
          <div className='flex items-center'>
            <Trophy className='w-5 h-5 mr-2 text-accent' />
            Achievements
          </div>
          <Badge variant='secondary' className='bg-secondary/20 text-secondary'>
            {achievementCount} / {achievementProgress.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {achievementCount === 0 ? (
          <div className='text-center py-6'>
            <Lock className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <p className='text-gray-400 mb-2'>No achievements yet</p>
            <p className='text-sm text-gray-500'>
              Start contributing to unlock your first achievement!
            </p>
          </div>
        ) : (
          <>
            {/* Claimable Achievements */}
            {claimableAchievementsList.length > 0 && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-gray-300'>
                  Ready to Claim!
                </h4>
                <div className='space-y-2'>
                  {claimableAchievementsList.map((achievement) => (
                    <div
                      key={achievement.id}
                      className='p-3 rounded-lg bg-gradient-to-r from-primary/20 to-primary/30 border border-primary/40'
                    >
                      <div className='flex items-center space-x-3'>
                        <span className='text-2xl'>{achievement.icon}</span>
                        <div className='flex-1'>
                          <p className='text-white font-medium'>
                            {achievement.name}
                          </p>
                          <p className='text-gray-300 text-sm'>
                            {achievement.description}
                          </p>
                        </div>
                        <Badge
                          variant='secondary'
                          className='bg-primary/20 text-primary text-xs'
                        >
                          Claim NFT
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Achievement */}
            {earnedAchievements.length > 0 && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-gray-300'>
                  Latest Achievement
                </h4>
                <div className='p-3 rounded-lg bg-gradient-to-r from-accent/20 to-accent/30 border border-accent/40'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>
                      {earnedAchievements[earnedAchievements.length - 1].icon}
                    </span>
                    <div>
                      <p className='text-white font-medium'>
                        {earnedAchievements[earnedAchievements.length - 1].name}
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {
                          earnedAchievements[earnedAchievements.length - 1]
                            .description
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Achievement */}
            {nextAchievement && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-gray-300'>Next Goal</h4>
                <div className='p-3 rounded-lg bg-white/5 border border-white/20'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl opacity-50'>
                      {nextAchievement.icon}
                    </span>
                    <div>
                      <p className='text-gray-300 font-medium'>
                        {nextAchievement.name}
                      </p>
                      <p className='text-gray-400 text-sm'>
                        {nextAchievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievement Summary */}
            <div className='pt-2 border-t border-white/20'>
              <div className='grid grid-cols-3 gap-2 text-center'>
                {achievementProgress.slice(0, 6).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-2 rounded-lg ${
                      achievement.earned
                        ? "bg-accent/20 border border-accent/40"
                        : claimableAchievements.includes(achievement.id)
                        ? "bg-primary/20 border border-primary/40"
                        : "bg-white/5 border border-white/20 opacity-50"
                    }`}
                    title={`${achievement.name}: ${achievement.description}${
                      claimableAchievements.includes(achievement.id)
                        ? " (Claimable!)"
                        : ""
                    }`}
                  >
                    <div className='text-lg mb-1'>{achievement.icon}</div>
                    <div className='text-xs text-gray-400'>
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
