"use client";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletButton from "@/components/wallet-button";
import CircleCard from "@/components/circle-card";
import Leaderboard from "@/components/leaderboard";
import { useDashboardData, formatBTCAmount } from "@/hooks/useDashboardData";
import {
  Plus,
  Users,
  Target,
  TrendingUp,
  Gift,
  Clock,
  Wallet,
  ArrowLeft,
} from "lucide-react";

export default function DashboardPage() {
  const { user, primaryWallet } = useDynamicConnection();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { dashboardData, loading } = useDashboardData();

  // Memoize connection state
  const connectionState = useMemo(
    () => ({
      isConnected: !!(user && primaryWallet?.address),
      address: primaryWallet?.address,
    }),
    [user, primaryWallet?.address]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to home if not connected - use memoized state
  useEffect(() => {
    if (mounted && !connectionState.isConnected) {
      router.push("/");
    }
  }, [mounted, connectionState.isConnected, router]);

  // Memoize the copy handler to prevent re-renders
  const handleCopyAddress = useCallback(() => {
    if (connectionState.address) {
      navigator.clipboard.writeText(connectionState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [connectionState.address]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (!connectionState.isConnected) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Header */}
      <header className='border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Back to Home</span>
              </Link>
              <div className='w-px h-6 bg-gray-700'></div>
              <Link
                href='/dashboard'
                className='text-2xl font-bold text-green-400'
              >
                🌳 Grove Dashboard
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <WalletButton variant='ghost' className='text-white' />
              <Link href='/create'>
                <Button className='bg-orange-500 hover:bg-orange-600 text-white'>
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
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-4xl font-bold text-white mb-2'>
                Welcome back to Grove! 👋
              </h1>
              <p className='text-gray-300 flex items-center space-x-2'>
                <span>Connected as:</span>
                <button
                  onClick={handleCopyAddress}
                  className='font-mono text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-colors cursor-pointer'
                  title={copied ? "Copied!" : "Click to copy address"}
                >
                  {copied ? (
                    <span className='text-green-400'>Copied!</span>
                  ) : (
                    <>
                      {connectionState.address?.slice(0, 6)}...
                      {connectionState.address?.slice(-4)}
                    </>
                  )}
                </button>
              </p>
            </div>
            <div className='flex items-center space-x-2 text-green-400'>
              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
              <span className='text-sm'>Connected to Citrea</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
            <Card className='bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-200 text-sm font-medium'>
                      My Circles
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading ? "..." : dashboardData.totalCircles}
                    </p>
                  </div>
                  <Users className='w-8 h-8 text-blue-400' />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-green-200 text-sm font-medium'>
                      Total Saved
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading
                        ? "..."
                        : formatBTCAmount(dashboardData.totalSaved)}
                    </p>
                  </div>
                  <Wallet className='w-8 h-8 text-green-400' />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-orange-200 text-sm font-medium'>
                      Goals Reached
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading ? "..." : dashboardData.goalsReached}
                    </p>
                  </div>
                  <Target className='w-8 h-8 text-orange-400' />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-purple-200 text-sm font-medium'>
                      Streak
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {loading ? "..." : dashboardData.currentStreak} days
                    </p>
                  </div>
                  <TrendingUp className='w-8 h-8 text-purple-400' />
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
              <div className='text-center py-16'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4'></div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Loading Your Circles
                </h3>
                <p className='text-gray-300'>
                  Fetching your savings data from the blockchain...
                </p>
              </div>
            ) : dashboardData.circles.length === 0 ? (
              <div className='text-center py-16'>
                <div className='max-w-md mx-auto'>
                  <div className='w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6'>
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
                    <Button className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4'>
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
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Side Panel */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <Target className='w-5 h-5 mr-2 text-orange-400' />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Link href='/create' className='block'>
                  <Button className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create New Circle
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  className='w-full border-green-500 text-green-300 hover:bg-green-500 hover:text-white'
                  onClick={() => alert("Contribution feature coming soon!")}
                >
                  <Wallet className='w-4 h-4 mr-2' />
                  Make Contribution
                </Button>
                <Button
                  variant='outline'
                  className='w-full border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white'
                  onClick={() => alert("Gifting feature coming soon!")}
                >
                  <Gift className='w-4 h-4 mr-2' />
                  Send Gift
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center'>
                  <Clock className='w-5 h-5 mr-2 text-blue-400' />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='text-center py-4'>
                    <Clock className='w-8 h-8 text-gray-600 mx-auto mb-2' />
                    <p className='text-gray-400 text-sm'>
                      No recent activity yet.
                    </p>
                  </div>
                  {/* Placeholder for future activity items */}
                  <div className='border-t border-gray-700 pt-3'>
                    <p className='text-xs text-gray-500 text-center'>
                      Activity feed coming soon:
                      <br />
                      • Circle contributions
                      <br />
                      • Member invitations
                      <br />
                      • Achievement unlocks
                      <br />• Gift transactions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Leaderboard entries={[]} userAddress={connectionState.address!} />

            {/* Grove Status */}
            <Card className='bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30'>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-4xl mb-2'>🌳</div>
                  <h3 className='text-green-200 font-medium mb-2'>
                    Your Grove
                  </h3>
                  <p className='text-green-100 text-sm'>
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
    </div>
  );
}
