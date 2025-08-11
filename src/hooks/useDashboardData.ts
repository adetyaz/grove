"use client";
import { useReadContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatEther } from "viem";

// Utility function to parse circle description that might be JSON
const parseCircleDescription = (description: string | null): string => {
  if (!description) return "";

  try {
    const parsed = JSON.parse(description);
    // If it's our JSON format, return just the description part
    if (typeof parsed === "object" && parsed.description !== undefined) {
      return parsed.description || "";
    }
    // If JSON parsing worked but it's not our format, return the original
    return description;
  } catch {
    // If JSON parsing fails, it's a plain string description
    return description;
  }
};

interface Circle {
  id: string;
  onChainId: number;
  name: string;
  description?: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  isActive: boolean;
  memberCount: number;
  members: string[];
  creator: string;
  paymentType: string;
}

interface DashboardStats {
  totalCircles: number;
  totalSaved: bigint;
  goalsReached: number;
  currentStreak: number;
  circles: Circle[];
}

export function useDashboardData() {
  const { user, primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const isConnected = !!(user && primaryWallet?.address);

  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalCircles: 0,
    totalSaved: BigInt(0),
    goalsReached: 0,
    currentStreak: 0,
    circles: [],
  });
  const [loading, setLoading] = useState(false);

  const { data: userCircleIds, isLoading: loadingIds } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "getUserCircles",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  });

  const fetchCircleDetails = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    try {
      const controller = new AbortController();

      const dbResponse = await fetch(`/api/circles?userWallet=${address}`, {
        signal: controller.signal,
      });

      if (!dbResponse.ok) {
        throw new Error(`HTTP error! status: ${dbResponse.status}`);
      }

      const dbData = await dbResponse.json();

      if (dbData.circles && dbData.circles.length > 0) {
        const dbCircles = await Promise.all(
          dbData.circles.map(async (circle: any, index: number) => {
            try {
              // Handle potential decimal values in targetAmount
              let targetAmountBigInt: bigint;
              try {
                if (circle.targetAmount.includes(".")) {
                  // Convert decimal to wei (multiply by 10^18)
                  const decimalValue = parseFloat(circle.targetAmount);
                  targetAmountBigInt = BigInt(Math.floor(decimalValue * 1e18));
                } else {
                  targetAmountBigInt = BigInt(circle.targetAmount);
                }
              } catch {
                console.warn(
                  `Invalid targetAmount for circle ${circle.id}:`,
                  circle.targetAmount
                );
                targetAmountBigInt = BigInt(0);
              }

              const targetAmount = targetAmountBigInt;
              const deadline = BigInt(
                Math.floor(new Date(circle.deadline).getTime() / 1000)
              );
              const memberWallets = circle.members.map((m: any) => m.wallet);
              const allMembers = [circle.owner.wallet, ...memberWallets];

              let currentAmount = BigInt(0);
              try {
                if (circle.onChainId) {
                  const onChain = await import("@/lib/grove-contract").then(
                    (m) => m.groveContract.getCircle(circle.onChainId)
                  );
                  if (onChain && typeof onChain.currentAmount === "bigint") {
                    currentAmount = onChain.currentAmount;
                  }
                }
              } catch {
                // On-chain data fetch failed, continue with zero amount
              }

              const processedCircle = {
                id: circle.id,
                onChainId: circle.onChainId,
                name: circle.name,
                description: parseCircleDescription(circle.description),
                targetAmount,
                currentAmount,
                deadline,
                isActive: true,
                memberCount: allMembers.length + circle.invitations.length,
                members: allMembers,
                creator: circle.owner.wallet,
                paymentType: circle.paymentType,
              };

              return processedCircle;
            } catch (circleError) {
              console.error(
                `Failed to process circle ${index + 1}:`,
                circleError
              );
              return null;
            }
          })
        );

        // Filter out any null entries (failed processing)
        const validCircles = dbCircles.filter((circle) => circle !== null);

        const totalCircles = validCircles.length;
        const totalSaved = validCircles.reduce(
          (sum, circle) => sum + circle.currentAmount,
          BigInt(0)
        );
        const goalsReached = validCircles.filter(
          (circle) => circle.currentAmount >= circle.targetAmount
        ).length;

        const calculateStreak = (circles: any[]) => {
          if (!circles || circles.length === 0) return 0;

          const activeCircles = circles.filter(
            (circle) => circle.currentAmount > BigInt(0) && circle.isActive
          );

          return Math.min(activeCircles.length, 7);
        };

        const currentStreak = calculateStreak(validCircles);

        setDashboardData({
          totalCircles,
          totalSaved,
          goalsReached,
          currentStreak,
          circles: validCircles,
        });
      } else {
        setDashboardData({
          totalCircles: 0,
          totalSaved: BigInt(0),
          goalsReached: 0,
          currentStreak: 0,
          circles: [],
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching dashboard data:", error);
      }

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
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchCircleDetails();
    }
  }, [address, userCircleIds, fetchCircleDetails]);

  const updateCircleContribution = useCallback(
    (circleId: string, contributionAmount: bigint) => {
      setDashboardData((prevData) => {
        const updatedCircles = prevData.circles.map((circle) => {
          if (circle.id === circleId) {
            const newCurrentAmount = circle.currentAmount + contributionAmount;

            return {
              ...circle,
              currentAmount: newCurrentAmount,
            };
          }
          return circle;
        });

        const totalSaved = updatedCircles.reduce(
          (sum, circle) => sum + circle.currentAmount,
          BigInt(0)
        );
        const goalsReached = updatedCircles.filter(
          (circle) => circle.currentAmount >= circle.targetAmount
        ).length;

        const newData = {
          ...prevData,
          totalSaved,
          goalsReached,
          circles: updatedCircles,
        };

        return newData;
      });
    },
    []
  );

  const memoizedData = useMemo(
    () => ({
      dashboardData,
      loading: loadingIds || loading,
      refresh: fetchCircleDetails,
      updateCircleContribution,
    }),
    [
      dashboardData,
      loadingIds,
      loading,
      fetchCircleDetails,
      updateCircleContribution,
    ]
  );

  return memoizedData;
}

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
  // Handle no deadline case (0 means no deadline was set)
  if (deadline === BigInt(0)) {
    return "No deadline";
  }

  // Handle very large numbers that might indicate no deadline
  if (deadline > BigInt(2147483647)) {
    return "No deadline";
  }

  const deadlineDate = new Date(Number(deadline) * 1000);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days left`;
};
