"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConnectedUserSection from "@/components/connected-user-section";
import WalletButton from "@/components/wallet-button";
import { Shield, Users, Star, Menu, Target, Zap, Globe } from "lucide-react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const { user, primaryWallet, isConnecting } = useDynamicConnection();
  const [mounted, setMounted] = useState(false);

  // Memoize connection state to prevent unnecessary re-renders
  const connectionState = useMemo(
    () => ({
      isConnected: !!(user && primaryWallet && primaryWallet.address),
      hasAddress: !!primaryWallet?.address,
      isConnecting,
    }),
    [user, primaryWallet, isConnecting]
  );

  // Only log in development and when connection state actually changes
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && mounted) {
      // Only log meaningful changes
      const logKey = `${connectionState.isConnected}-${connectionState.isConnecting}`;
      const lastLogKey = sessionStorage.getItem("lastHomeLogKey");

      if (logKey !== lastLogKey) {
        console.log("Homepage state:", {
          isConnected: connectionState.isConnected,
          hasAddress: connectionState.hasAddress,
          isConnecting: connectionState.isConnecting,
        });
        sessionStorage.setItem("lastHomeLogKey", logKey);
      }
    }
  }, [connectionState, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header */}
      <header className='flex items-center justify-between p-4 lg:px-8'>
        <div className='flex items-center space-x-8'>
          <Link href='/' className='text-2xl font-bold text-green-400'>
            🌳 Grove
          </Link>
          <nav className='hidden lg:flex space-x-6'>
            <Link href='#features' className='text-gray-300 hover:text-white'>
              Features
            </Link>
            <Link
              href='#how-it-works'
              className='text-gray-300 hover:text-white'
            >
              How It Works
            </Link>
            <Link href='#security' className='text-gray-300 hover:text-white'>
              Security
            </Link>
          </nav>
        </div>
        <div className='flex items-center space-x-4'>
          {connectionState.isConnected ? (
            <>
              <WalletButton
                variant='ghost'
                className='hidden lg:inline-flex text-white'
              />
              <Link href='/dashboard'>
                <Button
                  variant='ghost'
                  className='hidden lg:inline-flex text-white'
                >
                  Dashboard
                </Button>
              </Link>
              <Link href='/create'>
                <Button className='bg-orange-500 hover:bg-orange-600 text-white'>
                  Create Circle
                </Button>
              </Link>
            </>
          ) : (
            <>
              <WalletButton
                variant='ghost'
                className='hidden lg:inline-flex text-white'
              >
                {connectionState.isConnecting
                  ? "Connecting..."
                  : "Connect Wallet"}
              </WalletButton>
              <Link href='/create'>
                <Button className='bg-orange-500 hover:bg-orange-600 text-white'>
                  Get Started
                </Button>
              </Link>
            </>
          )}
          <Button variant='ghost' size='icon' className='lg:hidden'>
            <Menu className='h-6 w-6' />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className='px-4 lg:px-8 py-16 lg:py-24'>
        <div className='max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h1 className='text-4xl lg:text-6xl font-bold leading-tight mb-6'>
              Cultivate wealth through{" "}
              <span className='text-orange-400'>Bitcoin</span> collaboration
            </h1>
            <p className='text-xl text-gray-300 mb-8'>
              Grove empowers communities to grow their Bitcoin savings together.
              Create circles with family and friends, track shared goals, and
              build financial security on Bitcoin&apos;s most advanced Layer 2.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Link href='/create'>
                <Button className='bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-3'>
                  Plant Your Grove
                </Button>
              </Link>
            </div>
          </div>
          <div className='relative'>
            <div className='relative w-full h-96 flex items-center justify-center'>
              <div className='w-48 h-48 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center relative'>
                <div className='text-6xl'>🌳</div>
                <div className='absolute -top-4 -right-4 w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center'>
                  <span className='text-2xl'>₿</span>
                </div>
              </div>
              <div className='absolute top-8 left-8 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center'>
                <Users className='w-4 h-4 text-white' />
              </div>
              <div className='absolute bottom-8 right-8 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center'>
                <Target className='w-4 h-4 text-white' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected User Dashboard - Shows when wallet is connected */}
      <ConnectedUserSection />

      {/* Features Grid */}
      <section id='features' className='px-4 lg:px-8 py-16'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              Growing Wealth Together
            </h2>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Experience the future of collaborative savings with Bitcoin-native
              features
            </p>
          </div>
          <div className='grid gap-8'>
            {/* Collaborative Circles Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Community Savings Trees
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Plant savings trees with your community. Set collective
                    targets, define contribution schedules, and watch your
                    Bitcoin grove flourish. Every tree represents a shared
                    financial milestone.
                  </p>
                  <Link href='/create'>
                    <Button
                      variant='outline'
                      className='border-orange-500 text-orange-300 hover:bg-orange-500 hover:text-white transition-colors'
                    >
                      Plant Your Tree
                    </Button>
                  </Link>
                </div>
                <div className='relative'>
                  <div className='bg-gray-900 rounded-lg p-6 text-center'>
                    <div className='text-4xl font-bold text-orange-400 mb-2'>
                      ₿ 0.25000000
                    </div>
                    <div className='text-sm text-gray-400 mb-4'>
                      Jaime&apos;s College Fund
                    </div>
                    <div className='flex justify-center space-x-2'>
                      <div className='w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center'>
                        <Users className='w-4 h-4 text-white' />
                      </div>
                      <div className='text-sm text-gray-300 flex items-center'>
                        5 members
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gamification Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Growth Rewards & Recognition
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Celebrate your savings journey with on-chain achievements.
                    Build contribution streaks, collect milestone badges, and
                    showcase your financial growth on community leaderboards.
                  </p>
                  <Button
                    variant='outline'
                    className='border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white transition-colors'
                  >
                    View Progress
                  </Button>
                </div>
                <div className='relative'>
                  <div className='bg-gray-900 rounded-lg p-4'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm'>🔥</span>
                      </div>
                      <span className='text-white'>30-day streak</span>
                    </div>
                    <div className='flex items-center space-x-3 mb-3'>
                      <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm'>🏆</span>
                      </div>
                      <span className='text-white'>Goal Crusher NFT</span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm'>#5</span>
                      </div>
                      <span className='text-white'>Global Leaderboard</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cross-Chain Deposits Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div className='relative'>
                  <div className='flex items-center justify-center'>
                    <div className='w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center relative'>
                      <Globe className='w-16 h-16 text-white' />
                    </div>
                  </div>
                  <div className='flex justify-center space-x-2 mt-4'>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-purple-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-orange-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  </div>
                </div>
                <div>
                  <div className='flex items-center space-x-2 mb-4'>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                    <span className='text-sm text-gray-400'>
                      Powered by Hyperlane
                    </span>
                  </div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Universal Asset Gateway
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Seamlessly contribute from any blockchain ecosystem. Grove
                    accepts ETH, USDC, and tokens from multiple chains,
                    automatically converting them to Bitcoin for your savings
                    circles.
                  </p>
                  <Button
                    variant='outline'
                    className='border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white transition-colors'
                  >
                    Connect Assets
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inheritance Planning Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Legacy Protection Protocol
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Protect your Bitcoin legacy with programmable inheritance
                    vaults. Configure beneficiaries, set time-locks, and ensure
                    your Grove continues growing for future generations.
                  </p>
                  <Button
                    variant='outline'
                    className='border-green-500 text-green-300 hover:bg-green-500 hover:text-white transition-colors'
                  >
                    Secure Legacy
                  </Button>
                </div>
                <div className='relative'>
                  <div className='bg-gray-900 rounded-lg p-6 text-center'>
                    <div className='w-24 h-24 mx-auto mb-4 relative'>
                      <Shield className='w-full h-full text-blue-400' />
                    </div>
                    <div className='text-orange-500 font-bold'>₿ Protected</div>
                    <div className='text-blue-400'>ZK-Proof Secured</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Gifting Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div className='relative'>
                  <div className='bg-gray-900 rounded-lg p-6'>
                    <div className='flex items-center space-x-4 mb-4'>
                      <div className='w-12 h-8 bg-orange-500 rounded flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>
                          GIFT
                        </span>
                      </div>
                      <div className='flex space-x-2'>
                        <div className='w-6 h-4 bg-blue-500 rounded'></div>
                        <div className='w-6 h-4 bg-green-400 rounded'></div>
                        <div className='w-6 h-4 bg-orange-500 rounded'></div>
                      </div>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs'>
                        ₿
                      </div>
                      <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs'>
                        🎁
                      </div>
                      <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs'>
                        💝
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Social Bitcoin Gifting
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Send Bitcoin gifts to friends and family with personal
                    messages. Climb the generosity leaderboards and earn
                    exclusive SBTs for top gifters.
                  </p>
                  <Button
                    variant='outline'
                    className='border-pink-500 text-pink-300 hover:bg-pink-500 hover:text-white transition-colors'
                  >
                    Send Gift
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bitcoin Security Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Bitcoin-Native Security
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    All transactions settle on Bitcoin L1 via Citrea&apos;s
                    ZK-Rollup. Your sats are secured by Bitcoin&apos;s unmatched
                    security while enjoying smart contract features.
                  </p>
                  <Button
                    variant='outline'
                    className='border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black transition-colors'
                  >
                    Learn More
                  </Button>
                </div>
                <div className='relative'>
                  <div className='flex items-center justify-center'>
                    <div className='relative'>
                      <div className='w-32 h-20 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 rounded-lg flex items-center justify-center'>
                        <span className='text-3xl font-bold text-white'>₿</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-center space-x-2 mt-4'>
                    <div className='w-3 h-3 bg-orange-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-orange-400 rounded-full'></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Card */}
            <Card className='bg-gray-800 border-gray-700 p-8'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div className='relative'>
                  <div className='bg-gray-900 rounded-lg p-6 text-center'>
                    <div className='text-4xl font-bold text-orange-400 mb-2'>
                      ₿ 2.10000000
                    </div>
                    <div className='flex items-center justify-center space-x-2 mb-4'>
                      <Zap className='w-8 h-8 text-yellow-400' />
                    </div>
                    <div className='flex justify-center space-x-1'>
                      <Star className='w-4 h-4 text-yellow-400 fill-current' />
                      <Star className='w-4 h-4 text-yellow-400 fill-current' />
                      <Star className='w-4 h-4 text-yellow-400 fill-current' />
                      <Star className='w-4 h-4 text-yellow-400 fill-current' />
                      <Star className='w-4 h-4 text-yellow-400 fill-current' />
                    </div>
                    <div className='text-sm text-gray-400 mt-2'>
                      Citrea ZK-Rollup
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    Lightning-Fast Settlement
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Experience instant transactions with Bitcoin finality.
                    Citrea&apos;s zero-knowledge rollup provides Ethereum-like
                    speed with Bitcoin&apos;s security and settlement.
                  </p>
                  <Button
                    variant='outline'
                    className='border-cyan-500 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors'
                  >
                    Explore Citrea
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id='how-it-works' className='px-4 lg:px-8 py-16 bg-gray-800/50'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              How Grove Works
            </h2>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Simple steps to start your Bitcoin savings journey
            </p>
          </div>
          <div className='grid lg:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>1</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Connect Wallet
              </h3>
              <p className='text-gray-300'>
                Connect your wallet using Dynamic.xyz for seamless onboarding
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>2</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Create Circle
              </h3>
              <p className='text-gray-300'>
                Set your savings goal, timeline, and contribution schedule
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>3</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Invite Members
              </h3>
              <p className='text-gray-300'>
                Send email invitations to friends and family to join your circle
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>4</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Achieve Goals
              </h3>
              <p className='text-gray-300'>
                Track progress, earn achievements, and reach your savings goals
                together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id='security' className='px-4 lg:px-8 py-16'>
        <div className='max-w-7xl mx-auto text-center'>
          <div className='mb-16'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              Bitcoin-Level Security
            </h2>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Your funds are secured by Bitcoin&apos;s unmatched security
              through Citrea&apos;s ZK-Rollup technology
            </p>
          </div>
          <div className='grid lg:grid-cols-3 gap-8'>
            <div className='bg-gray-800 rounded-lg p-8'>
              <Shield className='w-12 h-12 text-orange-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-4'>
                Bitcoin Settlement
              </h3>
              <p className='text-gray-300'>
                All transactions ultimately settle on Bitcoin L1, providing
                maximum security for your savings
              </p>
            </div>
            <div className='bg-gray-800 rounded-lg p-8'>
              <Zap className='w-12 h-12 text-yellow-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-4'>
                ZK-Rollup Technology
              </h3>
              <p className='text-gray-300'>
                Citrea&apos;s zero-knowledge proofs ensure transaction validity
                while maintaining privacy
              </p>
            </div>
            <div className='bg-gray-800 rounded-lg p-8'>
              <Users className='w-12 h-12 text-green-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-4'>
                Non-Custodial
              </h3>
              <p className='text-gray-300'>
                You always maintain control of your keys and funds - Grove never
                has custody
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-4 lg:px-8 py-16 text-center'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-4xl lg:text-5xl font-bold mb-6 text-white'>
            Start growing wealth together
          </h2>
          <p className='text-xl text-gray-300 mb-8'>
            Create your first savings circle in minutes and discover the power
            of collaborative Bitcoin savings on Citrea.
          </p>
          <Link href='/create'>
            <Button className='bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 mb-12'>
              Create Your Circle
            </Button>
          </Link>

          <div className='relative'>
            <div className='w-64 h-32 mx-auto bg-gradient-to-r from-orange-400 via-green-500 to-orange-600 rounded-lg relative overflow-hidden'>
              <div className='absolute inset-0 bg-black bg-opacity-20'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-4xl'>🌳</span>
              </div>
              <div className='absolute bottom-4 left-4 right-4'>
                <div className='h-1 bg-white bg-opacity-30 rounded-full mb-2'></div>
                <div className='h-1 bg-white bg-opacity-30 rounded-full w-3/4'></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='px-4 lg:px-8 py-16 border-t border-gray-800'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
            <div>
              <h3 className='font-bold text-white mb-4'>🌳 Grove</h3>
              <p className='text-gray-400 text-sm mb-4'>
                Growing wealth together on Bitcoin
              </p>
              <div className='flex space-x-4'>
                <div className='w-8 h-8 bg-gray-700 rounded flex items-center justify-center'>
                  <span className='text-sm'>𝕏</span>
                </div>
                <div className='w-8 h-8 bg-gray-700 rounded flex items-center justify-center'>
                  <span className='text-sm'>TG</span>
                </div>
                <div className='w-8 h-8 bg-gray-700 rounded flex items-center justify-center'>
                  <span className='text-sm'>DC</span>
                </div>
                <div className='w-8 h-8 bg-gray-700 rounded flex items-center justify-center'>
                  <span className='text-sm'>GH</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-4'>Platform</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Savings Circles
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Achievements
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Inheritance
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Leaderboards
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-4'>Technology</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Citrea Integration
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Hyperlane Bridge
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    ZK-Proofs
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Smart Contracts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-4'>Community</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Telegram
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white'>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800'>
            <div className='flex space-x-6 text-gray-400 text-sm mb-4 lg:mb-0'>
              <Link href='#' className='hover:text-white'>
                Privacy Policy
              </Link>
              <Link href='#' className='hover:text-white'>
                Terms of Service
              </Link>
              <Link href='#' className='hover:text-white'>
                Security
              </Link>
              <Link href='#' className='hover:text-white'>
                Bug Bounty
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-gray-400 text-sm'>Powered by</div>
              <div className='flex space-x-2'>
                <div className='px-2 py-1 bg-gray-700 rounded text-xs text-gray-300'>
                  Citrea
                </div>
                <div className='px-2 py-1 bg-gray-700 rounded text-xs text-gray-300'>
                  Dynamic
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
