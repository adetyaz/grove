"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConnectedUserSection from "@/components/connected-user-section";
import WalletButton from "@/components/wallet-button";

import { Shield, Users, Star, Menu, Target, Zap, Globe, X } from "lucide-react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const { user, primaryWallet, isConnecting } = useDynamicConnection();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const connectionState = useMemo(
    () => ({
      isConnected: !!(user && primaryWallet && primaryWallet.address),
      hasAddress: !!primaryWallet?.address,
      isConnecting,
    }),
    [user, primaryWallet, isConnecting]
  );

  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      mounted &&
      connectionState.isConnected
    ) {
      console.log("Homepage: User connected");
    }
  }, [connectionState.isConnected, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'>
      {/* Header */}
      <header className='flex items-center justify-between p-4 lg:px-8 backdrop-blur-sm bg-white/5 sticky top-0 z-50'>
        <div className='flex items-center space-x-8'>
          <Link href='/' className='text-2xl font-bold text-primary'>
            🌳 Grove
          </Link>
          <nav className='hidden lg:flex space-x-6'>
            <Link
              href='#features'
              className='text-gray-300 hover:text-primary transition-colors'
            >
              Features
            </Link>
            <Link
              href='#how-it-works'
              className='text-gray-300 hover:text-primary transition-colors'
            >
              How It Works
            </Link>
            <Link
              href='/circles'
              className='text-gray-300 hover:text-primary transition-colors'
            >
              Discover Circles
            </Link>
            <Link
              href='#security'
              className='text-gray-300 hover:text-primary transition-colors'
            >
              Security
            </Link>
          </nav>
        </div>
        <div className='flex items-center space-x-4'>
          {connectionState.isConnected ? (
            <>
              <WalletButton
                variant='ghost'
                className='hidden lg:inline-flex text-white hover:text-primary'
              />
              <Link
                href='/dashboard'
                className='hidden lg:inline-flex text-gray-300 hover:text-primary transition-colors'
              >
                Dashboard
              </Link>
              <Link href='/create' className='hidden sm:block'>
                <Button className='bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'>
                  Create Circle
                </Button>
              </Link>
            </>
          ) : (
            <>
              <WalletButton
                variant='ghost'
                className='hidden lg:inline-flex text-white hover:text-primary'
              >
                {connectionState.isConnecting
                  ? "Connecting..."
                  : "Connect Wallet"}
              </WalletButton>
              <Link href='/create'>
                <Button className='bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'>
                  Get Started
                </Button>
              </Link>
            </>
          )}
          <Button
            variant='ghost'
            size='icon'
            className='lg:hidden hover:text-primary'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='lg:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-sm border-t border-white/10'>
            <nav className='flex flex-col p-4 space-y-4'>
              <Link
                href='#features'
                className='text-gray-300 hover:text-primary transition-colors py-2'
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href='#how-it-works'
                className='text-gray-300 hover:text-primary transition-colors py-2'
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href='#security'
                className='text-gray-300 hover:text-primary transition-colors py-2'
                onClick={() => setMobileMenuOpen(false)}
              >
                Security
              </Link>
              <Link
                href='/circles'
                className='text-gray-300 hover:text-primary transition-colors py-2'
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover Circles
              </Link>
              {connectionState.isConnected && (
                <Link
                  href='/dashboard'
                  className='text-gray-300 hover:text-primary transition-colors py-2'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className='pt-4 border-t border-white/10'>
                {!connectionState.isConnected && (
                  <WalletButton
                    variant='outline'
                    className='w-full mb-3 border-primary text-primary hover:bg-primary hover:text-white'
                  >
                    {connectionState.isConnecting
                      ? "Connecting..."
                      : "Connect Wallet"}
                  </WalletButton>
                )}
                <Link href='/create' onClick={() => setMobileMenuOpen(false)}>
                  <Button className='w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'>
                    {connectionState.isConnected
                      ? "Create Circle"
                      : "Get Started"}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className='px-4 lg:px-8 py-12 lg:py-24'>
        <div className='max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
          <div className='text-center lg:text-left animate-fade-in'>
            <h1 className='text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4 lg:mb-6'>
              Cultivate wealth through{" "}
              <span className='text-primary'>Bitcoin</span> collaboration
            </h1>
            <p className='text-lg sm:text-xl text-gray-300 mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0 animate-slide-up'>
              Grove empowers communities to grow their Bitcoin savings together.
              Create circles with family and friends, track shared goals, and
              build financial security on Bitcoin&apos;s most advanced Layer 2.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up'>
              <Link href='/create' className='w-full sm:w-auto'>
                <Button className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-lg px-8 py-3 shadow-lg shadow-primary/25 hover-lift'>
                  🌱 Plant Your Grove
                </Button>
              </Link>
            </div>
          </div>
          <div className='relative order-first lg:order-last animate-fade-in'>
            <div className='relative w-full h-72 sm:h-96 flex items-center justify-center'>
              <div className='w-40 sm:w-48 h-40 sm:h-48 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center relative shadow-2xl shadow-primary/30 animate-bounce-subtle'>
                <div className='text-4xl sm:text-6xl'>🌳</div>
                <div className='absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-12 sm:w-16 h-12 sm:h-16 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 animate-glow'>
                  <span className='text-lg sm:text-2xl'>₿</span>
                </div>
              </div>
              <div className='absolute top-6 sm:top-8 left-6 sm:left-8 w-6 sm:w-8 h-6 sm:h-8 bg-grove-trust rounded-full flex items-center justify-center shadow-lg hover-lift'>
                <Users className='w-3 sm:w-4 h-3 sm:h-4 text-white' />
              </div>
              <div className='absolute bottom-6 sm:bottom-8 right-6 sm:right-8 w-6 sm:w-8 h-6 sm:h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg hover-lift'>
                <Target className='w-3 sm:w-4 h-3 sm:h-4 text-white' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected User Dashboard - Shows when wallet is connected */}
      <ConnectedUserSection />

      {/* Call to Action Section */}
      <section className='px-4 lg:px-8 py-12 lg:py-16'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-2xl p-8 lg:p-12 text-center backdrop-blur-sm'>
            <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
              Ready to Start Your Bitcoin Journey?
            </h2>
            <p className='text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto'>
              Join thousands growing their Bitcoin together. Create your own
              savings circle or discover existing communities.
            </p>

            <div className='grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto'>
              {/* Create Circle CTA */}
              <Card className='bg-white/5 backdrop-blur-sm border-white/10 hover:border-primary/30 transition-all duration-300 hover-lift'>
                <CardContent className='p-6'>
                  <div className='text-4xl mb-4'>🌱</div>
                  <h3 className='text-xl font-bold text-white mb-3'>
                    Create Your Circle
                  </h3>
                  <p className='text-gray-300 mb-6 text-sm'>
                    Start a new savings circle with family, friends, or
                    colleagues. Set goals, invite members, and grow together.
                  </p>
                  <Link href='/create' className='w-full'>
                    <Button className='w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'>
                      🚀 Start Creating
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Discover Circles CTA */}
              <Card className='bg-white/5 backdrop-blur-sm border-white/10 hover:border-secondary/30 transition-all duration-300 hover-lift'>
                <CardContent className='p-6'>
                  <div className='text-4xl mb-4'>🔍</div>
                  <h3 className='text-xl font-bold text-white mb-3'>
                    Discover Circles
                  </h3>
                  <p className='text-gray-300 mb-6 text-sm'>
                    Explore public savings circles and join communities that
                    match your financial goals and interests.
                  </p>
                  <Link href='/dashboard/discover' className='w-full'>
                    <Button
                      variant='outline'
                      className='w-full border-secondary text-secondary hover:bg-secondary hover:text-white shadow-lg shadow-secondary/25'
                    >
                      🌟 Explore Circles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className='mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400'>
              <div className='flex items-center space-x-2'>
                <Shield className='w-4 h-4 text-primary' />
                <span>Secure & Transparent</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Users className='w-4 h-4 text-secondary' />
                <span>Community Driven</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Zap className='w-4 h-4 text-accent' />
                <span>Bitcoin Native</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Testing - Only in dev mode */}
      {process.env.NODE_ENV === "development" && (
        <section className='px-4 lg:px-8 py-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6'>
              <h3 className='text-yellow-400 font-semibold mb-2'>
                🧪 Development Testing
              </h3>
              <p className='text-yellow-300/80 text-sm'>
                These components are only visible in development mode for
                testing.
              </p>
            </div>
            <div className='flex justify-center'>
              {/* <EmailQuickTest /> */}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section id='features' className='px-4 lg:px-8 py-12 lg:py-16'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12 lg:mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
              Growing Wealth Together
            </h2>
            <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto'>
              Experience the future of collaborative savings with Bitcoin-native
              features
            </p>
          </div>
          <div className='grid gap-6 lg:gap-8'>
            {/* Collaborative Circles Card */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-6 lg:p-8 hover:border-primary/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-6 lg:gap-8 items-center p-0'>
                <div>
                  <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-white'>
                    🌱 Community Savings Trees
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
                      className='border-primary text-primary hover:bg-primary hover:text-white transition-colors shadow-lg shadow-primary/25'
                    >
                      🌳 Plant Your Tree
                    </Button>
                  </Link>
                </div>
                <div className='relative'>
                  <div className='bg-slate-900/80 backdrop-blur-sm rounded-lg p-6 text-center border border-primary/20'>
                    <div className='text-4xl font-bold text-primary mb-2'>
                      ₿ 0.25000000
                    </div>
                    <div className='text-sm text-gray-400 mb-4'>
                      Jaime&apos;s College Fund
                    </div>
                    <div className='flex justify-center space-x-2'>
                      <div className='w-8 h-8 bg-secondary rounded-full flex items-center justify-center'>
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
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:border-accent/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    🏆 Growth Rewards & Recognition
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Celebrate your savings journey with on-chain achievements.
                    Build contribution streaks, collect milestone badges, and
                    showcase your financial growth on community leaderboards.
                  </p>
                  <Button
                    variant='outline'
                    className='border-accent text-accent hover:bg-accent hover:text-white transition-colors shadow-lg shadow-accent/25'
                  >
                    ✨ View Progress
                  </Button>
                </div>
                <div className='relative'>
                  <div className='bg-slate-900/80 backdrop-blur-sm rounded-lg p-4 border border-accent/20'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm'>🔥</span>
                      </div>
                      <span className='text-white'>30-day streak</span>
                    </div>
                    <div className='flex items-center space-x-3 mb-3'>
                      <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm'>🏆</span>
                      </div>
                      <span className='text-white'>Goal Crusher NFT</span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-secondary rounded-full flex items-center justify-center'>
                        <span className='text-white text-sm'>#5</span>
                      </div>
                      <span className='text-white'>Global Leaderboard</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cross-Chain Deposits Card */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:border-grove-trust/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div className='relative'>
                  <div className='flex items-center justify-center'>
                    <div className='w-32 h-32 bg-gradient-to-br from-grove-trust to-primary rounded-full flex items-center justify-center relative shadow-lg shadow-grove-trust/25'>
                      <Globe className='w-16 h-16 text-white' />
                    </div>
                  </div>
                  <div className='flex justify-center space-x-2 mt-4'>
                    <div className='w-3 h-3 bg-grove-trust rounded-full'></div>
                    <div className='w-3 h-3 bg-accent rounded-full'></div>
                    <div className='w-3 h-3 bg-primary rounded-full'></div>
                    <div className='w-3 h-3 bg-secondary rounded-full'></div>
                  </div>
                </div>
                <div>
                  <div className='flex items-center space-x-2 mb-4'>
                    <div className='w-3 h-3 bg-secondary rounded-full'></div>
                    <span className='text-sm text-gray-400'>
                      Powered by Hyperlane
                    </span>
                  </div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    🌉 Universal Asset Gateway
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Seamlessly contribute from any blockchain ecosystem. Grove
                    accepts ETH, USDC, and tokens from multiple chains,
                    automatically converting them to Bitcoin for your savings
                    circles.
                  </p>
                  <Button
                    variant='outline'
                    className='border-grove-trust text-grove-trust hover:bg-grove-trust hover:text-white transition-colors shadow-lg shadow-grove-trust/25'
                  >
                    🔗 Connect Assets
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inheritance Planning Card */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:border-secondary/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    🛡️ Legacy Protection Protocol
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Protect your Bitcoin legacy with programmable inheritance
                    vaults. Configure beneficiaries, set time-locks, and ensure
                    your Grove continues growing for future generations.
                  </p>
                  <Button
                    variant='outline'
                    className='border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors shadow-lg shadow-secondary/25'
                  >
                    🔒 Secure Legacy
                  </Button>
                </div>
                <div className='relative'>
                  <div className='bg-slate-900/80 backdrop-blur-sm rounded-lg p-6 text-center border border-secondary/20'>
                    <div className='w-24 h-24 mx-auto mb-4 relative'>
                      <Shield className='w-full h-full text-grove-trust' />
                    </div>
                    <div className='text-primary font-bold'>₿ Protected</div>
                    <div className='text-grove-trust'>ZK-Proof Secured</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Gifting Card */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:border-grove-premium/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div className='relative'>
                  <div className='bg-slate-900/80 backdrop-blur-sm rounded-lg p-6 border border-grove-premium/20'>
                    <div className='flex items-center space-x-4 mb-4'>
                      <div className='w-12 h-8 bg-primary rounded flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>
                          GIFT
                        </span>
                      </div>
                      <div className='flex space-x-2'>
                        <div className='w-6 h-4 bg-grove-trust rounded'></div>
                        <div className='w-6 h-4 bg-secondary rounded'></div>
                        <div className='w-6 h-4 bg-primary rounded'></div>
                      </div>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs'>
                        ₿
                      </div>
                      <div className='w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs'>
                        🎁
                      </div>
                      <div className='w-8 h-8 bg-grove-trust rounded-full flex items-center justify-center text-white text-xs'>
                        💝
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    🎁 Social Bitcoin Gifting
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Send Bitcoin gifts to friends and family with personal
                    messages. Climb the generosity leaderboards and earn
                    exclusive SBTs for top gifters.
                  </p>
                  <Button
                    variant='outline'
                    className='border-grove-premium text-grove-premium hover:bg-grove-premium hover:text-white transition-colors shadow-lg shadow-grove-premium/25'
                  >
                    💌 Send Gift
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bitcoin Security Card */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:border-accent/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    ₿ Bitcoin-Native Security
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    All transactions settle on Bitcoin L1 via Citrea&apos;s
                    ZK-Rollup. Your sats are secured by Bitcoin&apos;s unmatched
                    security while enjoying smart contract features.
                  </p>
                  <Button
                    variant='outline'
                    className='border-accent text-accent hover:bg-accent hover:text-white transition-colors shadow-lg shadow-accent/25'
                  >
                    🔍 Learn More
                  </Button>
                </div>
                <div className='relative'>
                  <div className='flex items-center justify-center'>
                    <div className='relative'>
                      <div className='w-32 h-20 bg-gradient-to-r from-primary via-accent to-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/25'>
                        <span className='text-3xl font-bold text-white'>₿</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-center space-x-2 mt-4'>
                    <div className='w-3 h-3 bg-primary rounded-full'></div>
                    <div className='w-3 h-3 bg-accent rounded-full'></div>
                    <div className='w-3 h-3 bg-primary rounded-full'></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Card */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:border-grove-trust/30 transition-all duration-300 hover-lift animate-fade-in'>
              <CardContent className='grid lg:grid-cols-2 gap-8 items-center p-0'>
                <div className='relative'>
                  <div className='bg-slate-900/80 backdrop-blur-sm rounded-lg p-6 text-center border border-grove-trust/20'>
                    <div className='text-4xl font-bold text-primary mb-2'>
                      ₿ 2.10000000
                    </div>
                    <div className='flex items-center justify-center space-x-2 mb-4'>
                      <Zap className='w-8 h-8 text-accent' />
                    </div>
                    <div className='flex justify-center space-x-1'>
                      <Star className='w-4 h-4 text-accent fill-current' />
                      <Star className='w-4 h-4 text-accent fill-current' />
                      <Star className='w-4 h-4 text-accent fill-current' />
                      <Star className='w-4 h-4 text-accent fill-current' />
                      <Star className='w-4 h-4 text-accent fill-current' />
                    </div>
                    <div className='text-sm text-gray-400 mt-2'>
                      Citrea ZK-Rollup
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className='text-3xl font-bold mb-4 text-white'>
                    ⚡ Lightning-Fast Settlement
                  </h2>
                  <p className='text-gray-300 mb-6'>
                    Experience instant transactions with Bitcoin finality.
                    Citrea&apos;s zero-knowledge rollup provides Ethereum-like
                    speed with Bitcoin&apos;s security and settlement.
                  </p>
                  <Button
                    variant='outline'
                    className='border-grove-trust text-grove-trust hover:bg-grove-trust hover:text-white transition-colors shadow-lg shadow-grove-trust/25'
                  >
                    🚀 Explore Citrea
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id='how-it-works'
        className='px-4 lg:px-8 py-12 lg:py-16 bg-slate-900/50 backdrop-blur-sm'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12 lg:mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
              How Grove Works
            </h2>
            <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto'>
              Simple steps to start your Bitcoin savings journey
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25'>
                <span className='text-2xl font-bold text-white'>1</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                🔗 Connect Wallet
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                Connect your wallet using Dynamic.xyz for seamless onboarding
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/25'>
                <span className='text-2xl font-bold text-white'>2</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                🌱 Create Circle
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                Set your savings goal, timeline, and contribution schedule
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-grove-trust rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-grove-trust/25'>
                <span className='text-2xl font-bold text-white'>3</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                👥 Invite Members
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                Send email invitations to friends and family to join your circle
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/25'>
                <span className='text-2xl font-bold text-white'>4</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                🎯 Achieve Goals
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                Track progress, earn achievements, and reach your savings goals
                together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id='security' className='px-4 lg:px-8 py-12 lg:py-16'>
        <div className='max-w-7xl mx-auto text-center'>
          <div className='mb-12 lg:mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
              ₿ Bitcoin-Level Security
            </h2>
            <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto'>
              Your funds are secured by Bitcoin&apos;s unmatched security
              through Citrea&apos;s ZK-Rollup technology
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 lg:p-8 hover:border-primary/30 transition-all duration-300 hover-lift animate-fade-in'>
              <Shield className='w-10 sm:w-12 h-10 sm:h-12 text-primary mx-auto mb-4' />
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-4'>
                ₿ Bitcoin Settlement
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                All transactions ultimately settle on Bitcoin L1, providing
                maximum security for your savings
              </p>
            </div>
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 lg:p-8 hover:border-accent/30 transition-all duration-300 hover-lift animate-fade-in'>
              <Zap className='w-10 sm:w-12 h-10 sm:h-12 text-accent mx-auto mb-4' />
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-4'>
                ⚡ ZK-Rollup Technology
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                Citrea&apos;s zero-knowledge proofs ensure transaction validity
                while maintaining privacy
              </p>
            </div>
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 lg:p-8 hover:border-secondary/30 transition-all duration-300 hover-lift animate-fade-in md:col-span-2 lg:col-span-1'>
              <Users className='w-10 sm:w-12 h-10 sm:h-12 text-secondary mx-auto mb-4' />
              <h3 className='text-lg sm:text-xl font-semibold text-white mb-4'>
                🔒 Non-Custodial
              </h3>
              <p className='text-sm sm:text-base text-gray-300'>
                You always maintain control of your keys and funds - Grove never
                has custody
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-4 lg:px-8 py-12 lg:py-16 text-center'>
        <div className='max-w-4xl mx-auto animate-fade-in'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 text-white animate-slide-up'>
            🌱 Start growing wealth together
          </h2>
          <p className='text-lg sm:text-xl text-gray-300 mb-6 lg:mb-8 animate-slide-up'>
            Create your first savings circle in minutes and discover the power
            of collaborative Bitcoin savings on Citrea.
          </p>
          <Link href='/create'>
            <Button className='bg-primary hover:bg-primary/90 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 mb-8 lg:mb-12 shadow-lg shadow-primary/25 transition-all duration-300 hover-lift animate-glow'>
              🌳 Create Your Circle
            </Button>
          </Link>

          <div className='relative'>
            <div className='w-64 h-32 mx-auto bg-gradient-to-r from-primary via-secondary to-primary rounded-lg relative overflow-hidden shadow-lg shadow-primary/20'>
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
      <footer className='px-4 lg:px-8 py-12 lg:py-16 border-t border-white/10'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 lg:mb-12'>
            <div className='sm:col-span-2 lg:col-span-1'>
              <h3 className='font-bold text-white mb-4'>🌳 Grove</h3>
              <p className='text-gray-400 text-sm mb-4'>
                Growing wealth together on Bitcoin
              </p>
              <div className='flex space-x-4'>
                <div className='w-8 h-8 bg-white/10 hover:bg-primary/20 rounded flex items-center justify-center transition-colors'>
                  <span className='text-sm'>𝕏</span>
                </div>
                <div className='w-8 h-8 bg-white/10 hover:bg-grove-trust/20 rounded flex items-center justify-center transition-colors'>
                  <span className='text-sm'>TG</span>
                </div>
                <div className='w-8 h-8 bg-white/10 hover:bg-grove-premium/20 rounded flex items-center justify-center transition-colors'>
                  <span className='text-sm'>DC</span>
                </div>
                <div className='w-8 h-8 bg-white/10 hover:bg-secondary/20 rounded flex items-center justify-center transition-colors'>
                  <span className='text-sm'>GH</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-4'>Platform</h4>
              <ul className='space-y-2 text-gray-400 text-sm'>
                <li>
                  <Link
                    href='#'
                    className='hover:text-primary transition-colors'
                  >
                    Savings Circles
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='hover:text-accent transition-colors'
                  >
                    Achievements
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='hover:text-secondary transition-colors'
                  >
                    Inheritance
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='hover:text-grove-trust transition-colors'
                  >
                    Leaderboards
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-4'>Technology</h4>
              <ul className='space-y-2 text-gray-400 text-sm'>
                <li>
                  <Link
                    href='#'
                    className='hover:text-primary transition-colors'
                  >
                    Citrea Integration
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='hover:text-grove-trust transition-colors'
                  >
                    Hyperlane Bridge
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='hover:text-accent transition-colors'
                  >
                    ZK-Proofs
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='hover:text-secondary transition-colors'
                  >
                    Smart Contracts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-white mb-4'>Community</h4>
              <ul className='space-y-2 text-gray-400 text-sm'>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-white/10'>
            <div className='flex space-x-6 text-gray-400 text-sm mb-4 lg:mb-0'>
              <Link href='#' className='hover:text-white transition-colors'>
                Privacy Policy
              </Link>
              <Link href='#' className='hover:text-white transition-colors'>
                Terms of Service
              </Link>
              <Link href='#' className='hover:text-white transition-colors'>
                Security
              </Link>
              <Link href='#' className='hover:text-white transition-colors'>
                Bug Bounty
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-gray-400 text-sm'>Powered by</div>
              <div className='flex space-x-2'>
                <div className='px-2 py-1 bg-primary/20 rounded text-xs text-primary border border-primary/30'>
                  Citrea
                </div>
                <div className='px-2 py-1 bg-grove-trust/20 rounded text-xs text-grove-trust border border-grove-trust/30'>
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
