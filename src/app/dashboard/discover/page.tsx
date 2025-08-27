"use client";

import { useState, useEffect } from "react";
import { Search, Bitcoin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import WalletConnection from "@/components/wallet-connection";
import { getBtcToUsdRate } from "@/lib/btc-conversion";

interface PublicCircle {
  id: string;
  name: string;
  description: string;
  targetAmount: string;
  contributionAmount: string;
  isPublic: boolean;
  owner: {
    name: string;
    wallet: string;
  };
  createdAt: string;
  memberCount: number;
  members?: string[];
}

export default function DiscoverPage() {
  const { primaryWallet } = useDynamicConnection();

  const [circles, setCircles] = useState<PublicCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPublicCircles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/circles/public");
        if (response.ok) {
          const data = await response.json();
          setCircles(data.circles || []);
        }
      } catch (error) {
        console.error("Failed to fetch public circles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicCircles();
  }, []);

  const filteredCircles = circles.filter(
    (circle) =>
      circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circle.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserMember = (circle: PublicCircle) => {
    if (!primaryWallet?.address) return false;
    return (
      circle.members?.some(
        (member) =>
          member.toLowerCase() === primaryWallet.address?.toLowerCase()
      ) || false
    );
  };

  if (!primaryWallet?.address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <div className='max-w-md mx-auto'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Wallet Not Connected
            </h2>
            <p className='text-slate-400 mb-6'>
              Please connect your wallet to discover circles.
            </p>
            <WalletConnection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Discover Circles
          </h1>
          <p className='text-slate-400'>
            Join public savings circles and grow your Bitcoin together
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8'>
        {/* Search */}
        <div className='lg:col-span-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
            <Input
              placeholder='Search public circles...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className='bg-slate-800/50 rounded-lg p-4 border border-slate-700'>
          <div className='text-2xl font-bold text-white'>{circles.length}</div>
          <div className='text-sm text-slate-400'>Public Circles</div>
        </div>

        <div className='bg-slate-800/50 rounded-lg p-4 border border-slate-700'>
          <div className='text-2xl font-bold text-green-400'>
            {filteredCircles.length}
          </div>
          <div className='text-sm text-slate-400'>Found</div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-slate-400'>Loading public circles...</p>
        </div>
      )}

      {/* Circles Grid */}
      {!isLoading && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCircles.length === 0 ? (
            <div className='col-span-full text-center py-12'>
              <Globe className='w-16 h-16 text-slate-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                No Public Circles Found
              </h3>
              <p className='text-slate-400'>
                {searchTerm
                  ? "Try a different search term"
                  : "Be the first to create a public circle!"}
              </p>
            </div>
          ) : (
            filteredCircles.map((circle) => (
              <Card
                key={circle.id}
                className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white hover:scale-105 transition-all duration-200 hover:border-blue-500/50'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg font-bold text-white mb-1 line-clamp-1'>
                        {circle.name}
                      </CardTitle>
                      <p className='text-sm text-slate-400 line-clamp-2'>
                        {circle.description}
                      </p>
                    </div>
                    <Badge className='bg-green-500/20 text-green-400 border-green-500/30 ml-2'>
                      <Globe className='w-3 h-3 mr-1' />
                      Public
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Target Amount */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-slate-400'>Target</span>
                    <div className='flex items-center space-x-1'>
                      <Bitcoin className='w-4 h-4 text-orange-500' />
                      <span className='text-sm font-semibold text-white'>
                        {circle.targetAmount} BTC ($
                        {(
                          parseFloat(circle.targetAmount) * getBtcToUsdRate()
                        ).toFixed(2)}
                        )
                      </span>
                    </div>
                  </div>

                  {/* Contribution Amount */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-slate-400'>
                      Per Contribution
                    </span>
                    <div className='flex items-center space-x-1'>
                      <Bitcoin className='w-4 h-4 text-orange-500' />
                      <span className='text-sm font-semibold text-white'>
                        {circle.contributionAmount} BTC ($
                        {(
                          parseFloat(circle.contributionAmount) *
                          getBtcToUsdRate()
                        ).toFixed(2)}
                        )
                      </span>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className='text-xs text-slate-500'>
                    Created by {circle.owner?.wallet?.slice(0, 6)}...
                    {circle.owner?.wallet?.slice(-4)}
                  </div>

                  {/* Created Date */}
                  <div className='text-xs text-slate-500'>
                    Created {new Date(circle.createdAt).toLocaleDateString()}
                  </div>

                  {/* Join Button or Member Status */}
                  {isUserMember(circle) ? (
                    <Button
                      className='w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold cursor-default'
                      disabled
                    >
                      ✓ Already a Member
                    </Button>
                  ) : (
                    <Button
                      className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold'
                      onClick={() => {
                        window.location.href = `/circles/${circle.id}`;
                      }}
                    >
                      Join Circle
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
