"use client";
import { useState, useEffect } from "react";

export interface LeaderboardEntry {
  address: string;
  name?: string;
  totalContributed: bigint;
  circlesCount: number;
  rank: number;
  isCurrentUser?: boolean;
}

export function useLeaderboard(userAddress?: string) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        setLoading(true);

        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();

        const transformedData: LeaderboardEntry[] = data.contributors.map(
          (contributor: any) => ({
            address: contributor.address,
            name: contributor.name,
            totalContributed: BigInt(contributor.totalContributed),
            circlesCount: contributor.circlesCount,
            rank: contributor.rank,
            isCurrentUser: userAddress
              ? contributor.address.toLowerCase() === userAddress.toLowerCase()
              : false,
          })
        );

        setLeaderboardData(transformedData);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboardData();
  }, [userAddress]);

  const userRank =
    leaderboardData.find(
      (entry) =>
        userAddress && entry.address.toLowerCase() === userAddress.toLowerCase()
    )?.rank || null;

  return {
    leaderboardData,
    loading,
    userRank,
  };
}
