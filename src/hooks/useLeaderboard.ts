"use client";
import { useReadContract } from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { useMemo, useState, useEffect } from "react";

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

  // Get all unique contributors from the contract
  const { data: allContributors, isLoading: loadingContributors } =
    useReadContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "getAllContributors",
      query: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    });

  // Fetch contribution data for all contributors
  useEffect(() => {
    async function fetchLeaderboardData() {
      if (
        !allContributors ||
        !Array.isArray(allContributors) ||
        allContributors.length === 0
      ) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      try {
        const contributorData = await Promise.all(
          allContributors.map(async (address: string) => {
            try {
              // Get total contributions for this address from the contract
              const response = await fetch(
                `/api/leaderboard/contributor/${address}`
              );
              if (!response.ok)
                throw new Error("Failed to fetch contributor data");

              const data = await response.json();
              return {
                address,
                totalContributed: BigInt(data.totalContributed || 0),
                circlesCount: data.circlesCount || 0,
                name: data.name || undefined,
                rank: 0, // Will be calculated after sorting
                isCurrentUser: userAddress
                  ? address.toLowerCase() === userAddress.toLowerCase()
                  : false,
              };
            } catch (error) {
              console.warn(
                `Failed to fetch data for contributor ${address}:`,
                error
              );
              return {
                address,
                totalContributed: BigInt(0),
                circlesCount: 0,
                rank: 0,
                isCurrentUser: userAddress
                  ? address.toLowerCase() === userAddress.toLowerCase()
                  : false,
              };
            }
          })
        );

        // Sort by total contributed (descending) and assign ranks
        const sortedData = contributorData
          .filter((entry) => entry.totalContributed > BigInt(0)) // Only include contributors with actual contributions
          .sort((a, b) => {
            // Sort by total contributed first, then by circles count as tiebreaker
            const contributionDiff = Number(
              b.totalContributed - a.totalContributed
            );
            if (contributionDiff !== 0) return contributionDiff;
            return b.circlesCount - a.circlesCount;
          })
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }))
          .slice(0, 10); // Top 10 only

        setLeaderboardData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setLeaderboardData([]);
        setLoading(false);
      }
    }

    fetchLeaderboardData();
  }, [allContributors, userAddress]);

  // Find current user's position
  const userRank = useMemo(() => {
    if (!userAddress) return null;
    const userEntry = leaderboardData.find(
      (entry) => entry.address.toLowerCase() === userAddress.toLowerCase()
    );
    return userEntry?.rank || null;
  }, [leaderboardData, userAddress]);

  return {
    leaderboardData,
    loading: loading || loadingContributors,
    userRank,
  };
}
