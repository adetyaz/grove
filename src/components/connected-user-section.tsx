"use client";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useEffect, useState } from "react";
import CircleDashboard from "./circle-dashboard";
import { groveToast } from "@/lib/toast";

export default function ConnectedUserSection() {
  const { user, primaryWallet } = useDynamicConnection();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only show when we have a confirmed wallet address
  const isConnected = !!(user && primaryWallet?.address);
  const address = primaryWallet?.address;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      groveToast.copySuccess("Wallet address");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return null; // Don't show anything when wallet is not connected
  }

  return (
    <section className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20'>
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4'>
            <span className='text-2xl'>👋</span>
          </div>
          <h2 className='text-4xl font-bold text-white mb-4'>
            Welcome to Your Grove!
          </h2>
          <p className='text-lg text-gray-300 mb-2'>
            Connected as:{" "}
            <button
              onClick={handleCopyAddress}
              className='font-mono text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-colors cursor-pointer'
              title={copied ? "Copied!" : "Click to copy address"}
            >
              {copied ? (
                <span className='text-green-400'>Copied!</span>
              ) : (
                <>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </>
              )}
            </button>
          </p>
          <div className='flex items-center justify-center space-x-4 mb-6'>
            <div className='flex items-center space-x-2 text-green-400'>
              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
              <span className='text-sm'>Connected to Citrea</span>
            </div>
            <div className='w-px h-4 bg-gray-600'></div>
            <a
              href='/dashboard'
              className='text-sm text-blue-400 hover:text-blue-300 transition-colors underline'
            >
              Go to Dashboard →
            </a>
          </div>
        </div>

        <CircleDashboard />

        <div className='mt-16'>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
            {/* Fund Your Goals Card */}
            <div className='group bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl'>🌱</span>
                </div>
                <h3 className='text-xl font-bold text-white mb-3'>
                  Fund Your Goals
                </h3>
                <p className='text-gray-300 text-sm mb-6 leading-relaxed'>
                  Start funding your savings circles and watch your Bitcoin grow
                  through collaborative saving.
                </p>
                <button
                  className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg'
                  onClick={() => {
                    // TODO: Implement contribution flow
                    alert(
                      "Contribution feature coming soon! For now, you can create circles and invite members."
                    );
                  }}
                >
                  Fund Goals
                </button>
              </div>
            </div>

            {/* Dashboard Navigation Card */}
            <div className='group bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 transform hover:scale-105'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl'>📊</span>
                </div>
                <h3 className='text-xl font-bold text-white mb-3'>
                  Your Dashboard
                </h3>
                <p className='text-gray-300 text-sm mb-6 leading-relaxed'>
                  Access your complete Grove dashboard with detailed analytics,
                  circle management, and progress tracking.
                </p>
                <a
                  href='/dashboard'
                  className='inline-block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg'
                >
                  Go to Dashboard
                </a>
              </div>
            </div>

            {/* Build Your Network Card */}
            <div className='group bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl'>🤝</span>
                </div>
                <h3 className='text-xl font-bold text-white mb-3'>
                  Build Your Network
                </h3>
                <p className='text-gray-300 text-sm mb-6 leading-relaxed'>
                  Expand your savings network by connecting with friends and
                  family who share your financial ambitions.
                </p>
                <button
                  className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg'
                  onClick={() => {
                    // Navigate to create page to invite members to existing circles
                    window.location.href = "/create";
                  }}
                >
                  Expand Network
                </button>
              </div>
            </div>

            {/* Track Progress Card */}
            <div className='group bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl'>📊</span>
                </div>
                <h3 className='text-xl font-bold text-white mb-3'>
                  Track Progress
                </h3>
                <p className='text-gray-300 text-sm mb-6 leading-relaxed'>
                  Monitor your savings journey with detailed analytics,
                  milestones, and community leaderboards.
                </p>
                <button
                  className='w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg'
                  onClick={() => {
                    // TODO: Implement analytics page
                    alert(
                      "Analytics dashboard coming soon! Your progress data will unlock detailed insights and achievements."
                    );
                  }}
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Development Status Banner */}
          <div className='text-center'>
            <div className='inline-flex items-center bg-orange-500/20 border border-orange-500/30 rounded-full px-6 py-3'>
              <span className='text-orange-300 mr-2'>🚀</span>
              <span className='text-sm text-orange-200 font-medium'>
                Grove is growing! New features are being planted regularly to
                enhance your savings experience.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
