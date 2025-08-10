"use client";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletButton from "@/components/wallet-button";
import CircleCard from "@/components/circle-card";
import CircleSelectionModal from "@/components/circle-selection-modal";
import Leaderboard from "@/components/leaderboard";
import StreakLeaderboard from "@/components/streak-leaderboard";
import EnhancedActivityFeed from "@/components/enhanced-activity-feed";
import AchievementPanel from "@/components/achievement-panel";
import { useDashboardData, formatBTCAmount } from "@/hooks/useDashboardData";
import {
  Plus,
  Users,
  Target,
  TrendingUp,
  Wallet,
  ArrowLeft,
  Trophy,
} from "lucide-react";

export default function DashboardPage() {
  const { user, primaryWallet } = useDynamicConnection();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waitingForAutoConnect, setWaitingForAutoConnect] = useState(true);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const autoConnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const { dashboardData, loading, updateCircleContribution } =
    useDashboardData();

  const connectionState = useMemo(
    () => ({
      isConnected: !!(user && primaryWallet?.address),
      address: primaryWallet?.address,
    }),
    [user, primaryWallet?.address]
  );

  useEffect(() => {
    setMounted(true);

    autoConnectTimeout.current = setTimeout(() => {
      setWaitingForAutoConnect(false);
    }, 2500);
    return () => {
      if (autoConnectTimeout.current) clearTimeout(autoConnectTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (mounted && !waitingForAutoConnect && !connectionState.isConnected) {
      router.push("/");
    }
  }, [mounted, waitingForAutoConnect, connectionState.isConnected, router]);

  // Memoize the copy handler to prevent re-renders
  const handleCopyAddress = useCallback(() => {
    if (connectionState.address) {
      navigator.clipboard.writeText(connectionState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [connectionState.address]);

  if (!mounted || (waitingForAutoConnect && !connectionState.isConnected)) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-primary mb-6'></div>
        <p className='text-white text-lg'>Waiting for wallet connection...</p>
      </div>
    );
  }
  if (!connectionState.isConnected) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Header */}
      <header className='border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Back to Home</span>
              </Link>
              <div className='w-px h-6 bg-white/20'></div>
              <Link
                href='/dashboard'
                className='text-2xl font-bold text-primary'
              >
                🌳 Grove Dashboard
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <WalletButton
                variant='ghost'
                className='text-white hover:text-primary'
              />
              <Link href='/create'>
                <Button className='bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'>
                  <Plus className='w-4 h-4 mr-2' />
                  New Circle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className='mb-8 animate-fade-in'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                Welcome back to Grove! 👋
              </h1>
              <p className='text-gray-300 flex items-center space-x-2'>
                <span>Connected as:</span>
                <button
                  onClick={handleCopyAddress}
                  className='font-mono text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-colors cursor-pointer hover-lift'
                  title={copied ? "Copied!" : "Click to copy address"}
                >
                  {copied ? (
                    <span className='text-secondary'>Copied!</span>
                  ) : (
                    <>
                      {connectionState.address?.slice(0, 6)}...
                      {connectionState.address?.slice(-4)}
                    </>
                  )}
                </button>
              </p>
            </div>
            <div className='flex items-center space-x-2 text-secondary'>
              <div className='w-2 h-2 bg-secondary rounded-full animate-pulse'></div>
              <span className='text-sm'>Connected to Citrea</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <Card className='bg-gradient-to-br from-secondary/20 to-secondary/30 border-secondary/40 hover:bg-secondary/25 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-secondary text-sm font-medium'>
                      My Circles
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading ? "..." : dashboardData.totalCircles}
                    </p>
                  </div>
                  <Users className='w-8 h-8 text-secondary' />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-primary/20 to-primary/30 border-primary/40 hover:bg-primary/25 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-primary text-sm font-medium'>
                      Total Saved
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading
                        ? "..."
                        : formatBTCAmount(dashboardData.totalSaved)}
                    </p>
                  </div>
                  <Wallet className='w-8 h-8 text-primary' />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-accent/20 to-accent/30 border-accent/40 hover:bg-accent/25 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-accent text-sm font-medium'>
                      Goals Reached
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading ? "..." : dashboardData.goalsReached}
                    </p>
                  </div>
                  <Target className='w-8 h-8 text-accent' />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-trust/20 to-trust/30 border-trust/40 hover:bg-trust/25 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-trust text-sm font-medium'>Streak</p>
                    <p className='text-2xl font-bold text-white'>
                      {loading ? "..." : dashboardData.currentStreak} days
                    </p>
                  </div>
                  <TrendingUp className='w-8 h-8 text-trust' />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Left Column - Circle Cards */}
          <div className='lg:col-span-2'>
            {loading ? (
              <div className='text-center py-16 animate-fade-in'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4'></div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Loading Your Circles
                </h3>
                <p className='text-gray-300'>
                  Fetching your savings data from the blockchain...
                </p>
              </div>
            ) : dashboardData.circles.length === 0 ? (
              <div className='text-center py-16 animate-fade-in'>
                <div className='max-w-md mx-auto'>
                  <div className='w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-6 glow'>
                    <span className='text-3xl'>🌱</span>
                  </div>
                  <h2 className='text-2xl font-bold text-white mb-4'>
                    Plant Your First Seed
                  </h2>
                  <p className='text-gray-300 mb-8'>
                    You haven&apos;t created or joined any savings circles yet.
                    Start your financial journey today!
                  </p>
                  <Link href='/create'>
                    <Button className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-4 transition-all duration-300 hover-lift shadow-lg hover:shadow-primary/25'>
                      Create Your First Circle
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-3xl font-bold text-white'>
                    Your Savings Grove
                  </h2>
                  <span className='text-gray-400 text-sm'>
                    {dashboardData.circles.length} active circle
                    {dashboardData.circles.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className='grid gap-6'>
                  {dashboardData.circles.map((circle) => (
                    <CircleCard
                      key={circle.id}
                      circle={circle}
                      userAddress={connectionState.address!}
                      onContributionSuccess={updateCircleContribution}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Side Panel */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <Target className='w-5 h-5 mr-2 text-accent' />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Link href='/create' className='block'>
                  <Button className='w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white transition-all duration-300 hover-lift shadow-lg hover:shadow-primary/25'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create New Circle
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  className='w-full border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-300'
                  onClick={() => {
                    if (
                      dashboardData?.circles &&
                      dashboardData.circles.length > 0
                    ) {
                      setShowContributeModal(true);
                    } else {
                      router.push("/create");
                    }
                  }}
                >
                  <Wallet className='w-4 h-4 mr-2' />
                  Make Contribution
                </Button>
                {/* <Button
                  variant='outline'
                  className='w-full border-trust text-trust hover:bg-trust hover:text-white transition-all duration-300'
                  onClick={() => {
                    if (
                      dashboardData?.circles &&
                      dashboardData.circles.length > 0
                    ) {
                      setShowGiftModal(true);
                    } else {
                      router.push("/create");
                    }
                  }}
                >
                  <Gift className='w-4 h-4 mr-2' />
                  Send Gift
                </Button> */}
                <Link href='/achievements' className='block'>
                  <Button
                    variant='outline'
                    className='w-full border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 mb-3'
                  >
                    <Trophy className='w-4 h-4 mr-2' />
                    View Achievements
                  </Button>
                </Link>
                <Link href='/test-achievements' className='block'>
                  <Button
                    variant='outline'
                    className='w-full border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300'
                  >
                    <Target className='w-4 h-4 mr-2' />
                    🧪 Test Achievements
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <EnhancedActivityFeed userAddress={connectionState.address!} />

            {/* Achievements */}
            <AchievementPanel userAddress={connectionState.address!} />

            {/* Leaderboard */}
            <Leaderboard userAddress={connectionState.address!} />

            {/* Streak Leaderboard */}
            <StreakLeaderboard />

            {/* Grove Status */}
            <Card className='bg-gradient-to-br from-secondary/20 to-secondary/30 border-secondary/40 animate-fade-in glow'>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-4xl mb-2'>🌳</div>
                  <h3 className='text-secondary font-medium mb-2'>
                    Your Grove
                  </h3>
                  <p className='text-gray-300 text-sm'>
                    Just getting started!
                    <br />
                    Plant your first savings seed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Circle Selection Modals */}
      <CircleSelectionModal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        circles={dashboardData.circles}
        actionType='contribute'
      />

      <CircleSelectionModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        circles={dashboardData.circles}
        actionType='gift'
      />
    </div>
  );
}
