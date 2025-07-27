// Phase 3: Advanced Achievement Dashboard
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/useAchievements";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { formatEther } from 'viem';

interface UserStats {
  address: string;
  totalContributed: string;
  currentStreak: number;
  longestStreak: number;
  achievements: number[];
  rank: number;
}

interface LeaderboardData {
  contributors: UserStats[];
  streakLeaders: UserStats[];
  achievementLeaders: UserStats[];
}

export function AchievementDashboard() {
  const { achievementProgress, achievementCount } = useAchievements();
  const { currentStreak, longestStreak, getStreakStatus, streakProgress } = useStreakTracking();
  const { primaryWallet } = useDynamicConnection();
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const userAddress = primaryWallet?.address;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievementCount}</div>
            <p className="text-xs text-muted-foreground">out of 6 possible</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">days active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak}</div>
            <p className="text-xs text-muted-foreground">personal record</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Streak Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(streakProgress)}%</div>
            <Progress value={streakProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">to Consistency King</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak Status */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{getStreakStatus()}</p>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">My Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboards</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementProgress.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? "border-green-500" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">
                        {achievement.id === 0 && "🌱"}
                        {achievement.id === 1 && "🪙"}
                        {achievement.id === 2 && "💰"}
                        {achievement.id === 3 && "🎯"}
                        {achievement.id === 4 && "🔥"}
                        {achievement.id === 5 && "🦋"}
                      </span>
                      {achievement.name}
                    </CardTitle>
                    {achievement.earned && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Earned
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-2">
                    {achievement.description}
                  </CardDescription>
                  {achievement.threshold && (
                    <p className="text-xs text-muted-foreground">
                      Threshold: {achievement.threshold} BTC
                    </p>
                  )}
                  <Progress 
                    value={achievement.earned ? 100 : 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading leaderboards...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle>🏆 Top Contributors</CardTitle>
                  <CardDescription>By total BTC contributed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard?.contributors?.slice(0, 5).map((user, index) => (
                      <div key={user.address} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {index + 1}.
                          </span>
                          <span className="text-sm">
                            {user.address === userAddress ? 'You' : `${user.address.slice(0, 6)}...`}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {parseFloat(formatEther(BigInt(user.totalContributed))).toFixed(4)} BTC
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No data available</div>}
                  </div>
                </CardContent>
              </Card>

              {/* Streak Leaders */}
              <Card>
                <CardHeader>
                  <CardTitle>🔥 Streak Leaders</CardTitle>
                  <CardDescription>Current active streaks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard?.streakLeaders?.slice(0, 5).map((user, index) => (
                      <div key={user.address} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {index + 1}.
                          </span>
                          <span className="text-sm">
                            {user.address === userAddress ? 'You' : `${user.address.slice(0, 6)}...`}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {user.currentStreak} days
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No data available</div>}
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Leaders */}
              <Card>
                <CardHeader>
                  <CardTitle>🏅 Achievement Leaders</CardTitle>
                  <CardDescription>Most achievements earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard?.achievementLeaders?.slice(0, 5).map((user, index) => (
                      <div key={user.address} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {index + 1}.
                          </span>
                          <span className="text-sm">
                            {user.address === userAddress ? 'You' : `${user.address.slice(0, 6)}...`}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {user.achievements.length} achievements
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No data available</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
                <CardDescription>Track your path to Grove mastery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{achievementCount}/6</span>
                  </div>
                  <Progress value={(achievementCount / 6) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Streak to Consistency King</span>
                    <span>{currentStreak}/7 days</span>
                  </div>
                  <Progress value={Math.min((currentStreak / 7) * 100, 100)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Milestones</CardTitle>
                <CardDescription>What to achieve next</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievementProgress
                    .filter(a => !a.earned)
                    .slice(0, 3)
                    .map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <span className="text-2xl">
                          {achievement.id === 0 && "🌱"}
                          {achievement.id === 1 && "🪙"}
                          {achievement.id === 2 && "💰"}
                          {achievement.id === 3 && "🎯"}
                          {achievement.id === 4 && "🔥"}
                          {achievement.id === 5 && "🦋"}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  {achievementProgress.every(a => a.earned) && (
                    <div className="text-center py-4">
                      <p className="text-lg font-semibold">🎉 All achievements unlocked!</p>
                      <p className="text-sm text-muted-foreground">You&apos;re a Grove master!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
