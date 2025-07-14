"use client";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useEffect, useState } from "react";
import CircleDashboard from "./circle-dashboard";
import Leaderboard from "./leaderboard";
import ContributionHistory from "./contribution-history";
import { useDashboardData } from "@/hooks/useDashboardData";

import { groveToast } from "@/lib/toast";

export default function ConnectedUserSection() {
  const { dashboardData, loading, refresh, updateCircleContribution } =
    useDashboardData();
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

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return null;
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

        {/* Main Dashboard Section */}
        <CircleDashboard
          dashboardData={dashboardData}
          loading={loading}
          refresh={refresh}
          updateCircleContribution={updateCircleContribution}
        />

        {/* Leaderboard Section */}
        <div className='mt-12'>
          <Leaderboard
            entries={dashboardData.circles.map((circle) => ({
              address: circle.creator,
              name: circle.name,
              totalContributed: circle.currentAmount,
              circlesCount: 1,
              rank: 1, // TODO: Calculate real rank
              isCurrentUser: circle.creator === address,
            }))}
            userAddress={address || ""}
          />
        </div>

        {/* Recent Activity Section */}
        <div className='mt-12'>
          <ContributionHistory
            contributions={dashboardData.circles.flatMap((circle) => [
              {
                id: `${circle.id}-latest`,
                contributor: circle.creator,
                amount: circle.currentAmount.toString(),
                timestamp: new Date().toISOString(),
                txHash: undefined,
              },
            ])}
          />
        </div>
      </div>
    </section>
  );
}
