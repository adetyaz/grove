"use client";
import { useAccount, useReadContract } from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

interface Circle {
  id: number;
  name: string;
  description?: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  isActive: boolean;
  memberCount: number;
  members: string[];
  creator: string;
}

interface DashboardStats {
  totalCircles: number;
  totalSaved: bigint;
  goalsReached: number;
  currentStreak: number;
  circles: Circle[];
}

export function useDashboardData() {
  const { address, isConnected } = useAccount();
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalCircles: 0,
    totalSaved: BigInt(0),
    goalsReached: 0,
    currentStreak: 0,
    circles: [],
  });
  const [loading, setLoading] = useState(false);

  // Get user's circle IDs from blockchain
  const { data: userCircleIds, isLoading: loadingIds } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "getUserCircles",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  useEffect(() => {
    const fetchCircleDetails = async () => {
      if (!address) return;

      setLoading(true);
      try {
        // Fetch circles from database first (faster and more reliable)
        const dbResponse = await fetch(`/api/circles?userWallet=${address}`);
        const dbData = await dbResponse.json();

        if (dbData.circles && dbData.circles.length > 0) {
          // Map database circles to our Circle interface
          const dbCircles: Circle[] = dbData.circles.map(
            (circle: {
              id: number;
              onChainId?: number;
              name: string;
              description?: string;
              targetAmount: string;
              deadline: string;
              owner: { wallet: string };
              members: Array<{ wallet: string }>;
              invitations: Array<unknown>;
            }) => ({
              id: circle.onChainId || circle.id,
              name: circle.name,
              description: circle.description,
              targetAmount: BigInt(circle.targetAmount),
              currentAmount: BigInt("0"), // Will be fetched from blockchain later
              deadline: BigInt(
                Math.floor(new Date(circle.deadline).getTime() / 1000)
              ),
              isActive: true,
              memberCount:
                circle.members.length + circle.invitations.length + 1, // owner + members + accepted invites
              members: [
                circle.owner.wallet,
                ...circle.members.map((m) => m.wallet),
              ],
              creator: circle.owner.wallet,
            })
          );

          // TODO: Fetch current amounts from blockchain for each circle
          // For now, using mock data but this should read from contract
          const enhancedCircles = dbCircles.map((circle) => ({
            ...circle,
            currentAmount: BigInt(
              Math.floor(Math.random() * Number(circle.targetAmount))
            ),
          }));

          // Calculate stats
          const totalSaved = enhancedCircles.reduce(
            (sum, circle) => sum + circle.currentAmount,
            BigInt(0)
          );
          const goalsReached = enhancedCircles.filter(
            (circle) => circle.currentAmount >= circle.targetAmount
          ).length;

          setDashboardData({
            totalCircles: enhancedCircles.length,
            totalSaved,
            goalsReached,
            currentStreak: 0, // TODO: Implement streak calculation
            circles: enhancedCircles,
          });
        } else {
          // Fallback to blockchain-only data if no DB records
          if (userCircleIds && Array.isArray(userCircleIds)) {
            const circlePromises = userCircleIds.map(async (id: bigint) => {
              // Mock circle data since we don't have full blockchain reads implemented
              return {
                id: Number(id),
                name: `Circle #${id}`,
                description: "A collaborative savings circle",
                targetAmount: BigInt("1000000000000000000"), // 1 BTC
                currentAmount: BigInt("250000000000000000"), // 0.25 BTC
                deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
                isActive: true,
                memberCount: 1,
                members: [address],
                creator: address,
              } as Circle;
            });

            const blockchainCircles = await Promise.all(circlePromises);

            const totalSaved = blockchainCircles.reduce(
              (sum, circle) => sum + circle.currentAmount,
              BigInt(0)
            );
            const goalsReached = blockchainCircles.filter(
              (circle) => circle.currentAmount >= circle.targetAmount
            ).length;

            setDashboardData({
              totalCircles: blockchainCircles.length,
              totalSaved,
              goalsReached,
              currentStreak: 0,
              circles: blockchainCircles,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set empty state on error
        setDashboardData({
          totalCircles: 0,
          totalSaved: BigInt(0),
          goalsReached: 0,
          currentStreak: 0,
          circles: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCircleDetails();
  }, [userCircleIds, address]);

  return {
    dashboardData,
    loading: loadingIds || loading,
    refresh: () => {
      // Trigger a refresh by re-fetching data
      // This would typically refetch the contracts
    },
  };
}

// Helper functions for formatting
export const formatBTCAmount = (amount: bigint): string => {
  const eth = formatEther(amount);
  return `₿ ${parseFloat(eth).toFixed(8)}`;
};

export const calculateProgress = (current: bigint, target: bigint): number => {
  if (target === BigInt(0)) return 0;
  const progress = (Number(current) / Number(target)) * 100;
  return Math.min(progress, 100);
};

export const formatDeadline = (deadline: bigint): string => {
  const deadlineDate = new Date(Number(deadline) * 1000);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days left`;
};
