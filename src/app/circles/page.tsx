"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Globe, Lock, Users, Clock, Bitcoin } from "lucide-react";
import Link from "next/link";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";

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
type SortType = "latest" | "amount_high" | "amount_low" | "duration_short" | "duration_long" | "popular";

export default function CirclesPage() {
  const { primaryWallet } = useDynamicConnection();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("latest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch public circles
  const { data: circles, isLoading, error } = useQuery({
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

  const formatBTC = (satoshis: string) => {
    const btc = parseInt(satoshis) / 100000000;
    return btc.toFixed(8);
  };

  const formatDuration = (days: string) => {
    const numDays = parseInt(days);
    if (numDays < 30) return `${numDays} days`;
    if (numDays < 365) return `${Math.round(numDays / 30)} months`;
    return `${Math.round(numDays / 365)} years`;
  };

  const getProgressPercentage = (current: string, target: string) => {
    const currentAmount = parseInt(current);
    const targetAmount = parseInt(target);
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const filteredCircles = circles?.circles || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Explore Circles</h1>
              <p className="text-slate-400">Discover and join savings circles from around the community</p>
            </div>
            <Link
              href="/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Create Circle
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search circles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Filter Type */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">Circle Type</label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "public", label: "Public" },
                      { value: "private", label: "Private" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterType(option.value as FilterType)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterType === option.value
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">Sort By</label>
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as SortType)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="latest">Latest Created</option>
                    <option value="amount_high">Highest Target Amount</option>
                    <option value="amount_low">Lowest Target Amount</option>
                    <option value="duration_short">Shortest Duration</option>
                    <option value="duration_long">Longest Duration</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Failed to load circles</p>
          </div>
        ) : filteredCircles.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No circles found matching your criteria</p>
            <p className="text-white/40 text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCircles.map((circle: Circle) => (
              <Link key={circle.id} href={`/circles/${circle.onChainId}`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 hover:bg-white/15 transition-all duration-200 cursor-pointer group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                        {circle.name}
                      </h3>
                      <p className="text-white/60 text-sm line-clamp-2">
                        {circle.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      {circle.isPublic ? (
                        <Globe className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    {/* Target Amount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bitcoin className="w-4 h-4 text-orange-400" />
                        <span className="text-white/70 text-sm">Target</span>
                      </div>
                      <span className="text-white font-medium">
                        {formatBTC(circle.targetAmount)} BTC
                      </span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">Progress</span>
                        <span className="text-white">
                          {formatBTC(circle.currentAmount)} / {formatBTC(circle.targetAmount)} BTC
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProgressPercentage(circle.currentAmount, circle.targetAmount)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Duration & Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-white/70 text-sm">
                          {formatDuration(circle.durationDays)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-white/70 text-sm">
                          {circle.memberCount} members
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-white/60 text-sm">
                        by {circle.owner.name || `${circle.owner.wallet.slice(0, 6)}...${circle.owner.wallet.slice(-4)}`}
                      </div>
                      <div className="text-white/60 text-sm">
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
