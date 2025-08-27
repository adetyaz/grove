"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Globe,
  Lock,
  Users,
  Clock,
  Bitcoin,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import WalletButton from "@/components/wallet-button";
import { formatBtcAmount, getBtcToUsdRate } from "@/lib/btc-conversion";

interface Circle {
  id: string;
  onChainId: number;
  name: string;
  description: string;
  targetAmount: string;
  contributionAmount: string;
  contributionInterval: string;
  durationDays: string;
  isPublic: boolean;
  memberCount: number;
  currentAmount: string;
  createdAt: string;
  owner: {
    name: string;
    wallet: string;
  };
}

type FilterType = "all" | "public" | "private";
type SortType =
  | "latest"
  | "amount_high"
  | "amount_low"
  | "duration_short"
  | "duration_long"
  | "popular";

export default function CirclesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("latest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch public circles
  const {
    data: circles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-circles", filterType, sortType, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        filter: filterType,
        sort: sortType,
        search: searchTerm,
      });

      const response = await fetch(`/api/circles/public?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch circles");
      }
      return response.json();
    },
  });

  const filteredCircles = circles?.circles || [];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Navigation Header */}
      <nav className='bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-6'>
              <Link
                href='/'
                className='flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
                <span className='font-medium'>Back to Grove</span>
              </Link>
              <h1 className='text-xl font-bold text-white'>
                🌳 Discover Circles
              </h1>
            </div>
            <div className='flex items-center gap-4'>
              <Link
                href='/create'
                className='px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors'
              >
                Create Circle
              </Link>
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Page Description */}
        <div className='mb-8 text-center'>
          <h2 className='text-3xl font-bold text-white mb-3'>
            Explore Savings Circles
          </h2>
          <p className='text-slate-400 text-lg max-w-2xl mx-auto'>
            Join existing circles or get inspired to create your own. All
            circles are powered by Bitcoin and smart contracts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className='bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-8'>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search circles by name or description...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600/50 transition-colors'
            >
              <Filter className='w-5 h-5' />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className='mt-6 pt-6 border-t border-slate-700/50'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Filter Type */}
                <div>
                  <label className='block text-slate-300 text-sm font-medium mb-3'>
                    Circle Type
                  </label>
                  <div className='flex gap-2'>
                    {[
                      { value: "all", label: "All" },
                      { value: "public", label: "Public" },
                      { value: "private", label: "Private" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setFilterType(option.value as FilterType)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterType === option.value
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-700/30 text-slate-300 hover:bg-slate-600/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className='block text-slate-300 text-sm font-medium mb-3'>
                    Sort By
                  </label>
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as SortType)}
                    className='w-full px-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value='latest'>Latest Created</option>
                    <option value='amount_high'>Highest Target Amount</option>
                    <option value='amount_low'>Lowest Target Amount</option>
                    <option value='duration_short'>Shortest Duration</option>
                    <option value='duration_long'>Longest Duration</option>
                    <option value='popular'>Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500'></div>
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <p className='text-red-400 text-lg'>Failed to load circles</p>
          </div>
        ) : filteredCircles.length === 0 ? (
          <div className='text-center py-12'>
            <Globe className='w-12 h-12 text-slate-500 mx-auto mb-4' />
            <p className='text-slate-400 text-lg'>
              No circles found matching your criteria
            </p>
            <p className='text-slate-500 text-sm mt-2'>
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCircles.map((circle: Circle) => (
              <Link key={circle.id} href={`/circles/${circle.id}`}>
                <div className='bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-700/40 transition-all duration-200 cursor-pointer group'>
                  {/* Header */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h3 className='font-bold text-white text-lg mb-1 group-hover:text-emerald-300 transition-colors'>
                        {circle.name}
                      </h3>
                      <p className='text-slate-400 text-sm line-clamp-2'>
                        {circle.description || "No description provided"}
                      </p>
                    </div>
                    <div className='flex items-center gap-1 ml-4'>
                      {circle.isPublic ? (
                        <Globe className='w-4 h-4 text-green-400' />
                      ) : (
                        <Lock className='w-4 h-4 text-yellow-400' />
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className='space-y-3 mb-4'>
                    {/* Target Amount */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Bitcoin className='w-4 h-4 text-orange-400' />
                        <span className='text-white/70 text-sm'>Target</span>
                      </div>
                      <span className='text-white font-medium'>
                        {circle.targetAmount} BTC ($
                        {(
                          parseFloat(circle.targetAmount) * getBtcToUsdRate()
                        ).toFixed(2)}
                        )
                      </span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span className='text-white/70'>Progress</span>
                        <span className='text-white'>
                          {circle.currentAmount} / {circle.targetAmount} BTC
                        </span>
                      </div>
                      <div className='flex justify-between text-sm mb-2'>
                        <span className='text-white/70'>USD Value</span>
                        <span className='text-white'>
                          $
                          {(
                            parseFloat(circle.currentAmount) * getBtcToUsdRate()
                          ).toFixed(2)}{" "}
                          / $
                          {(
                            parseFloat(circle.targetAmount) * getBtcToUsdRate()
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className='w-full bg-slate-700/50 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300'
                          style={{
                            width: "0%", // No progress bar calculation
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Duration & Members */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Clock className='w-4 h-4 text-blue-400' />
                        <span className='text-slate-400 text-sm'>
                          {circle.durationDays} days
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Users className='w-4 h-4 text-emerald-400' />
                        <span className='text-slate-400 text-sm'>
                          {circle.memberCount} members
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className='pt-4 border-t border-slate-700/50'>
                    <div className='flex items-center justify-between'>
                      <div className='text-slate-500 text-sm'>
                        by{" "}
                        {circle.owner.name ||
                          `${circle.owner.wallet.slice(
                            0,
                            6
                          )}...${circle.owner.wallet.slice(-4)}`}
                      </div>
                      <div className='text-slate-500 text-sm'>
                        {new Date(circle.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
