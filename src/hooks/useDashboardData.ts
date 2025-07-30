"use client";
import { useReadContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatEther } from "viem";

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
          dbData.circles.map(async (circle: any) => {
            console.log("📊 Processing circle from DB:", {
              name: circle.name,
              paymentType: circle.paymentType,
              id: circle.id,
            });

            const targetAmount = BigInt(circle.targetAmount);
            const deadline = BigInt(
              Math.floor(new Date(circle.deadline).getTime() / 1000)
            );
            const memberWallets = circle.members.map((m: any) => m.wallet);
            const allMembers = [circle.owner.wallet, ...memberWallets];

            let currentAmount = BigInt(0);
            try {
              if (circle.onChainId) {
                const onChain = await import("@/lib/grove-contract").then((m) =>
                  m.groveContract.getCircle(circle.onChainId)
                );
                if (onChain && typeof onChain.currentAmount === "bigint") {
                  currentAmount = onChain.currentAmount;
                }
              }
            } catch {}

            return {
              id: circle.id,
              onChainId: circle.onChainId,
              name: circle.name,
              description: circle.description,
              targetAmount,
              currentAmount,
              deadline,
              isActive: true,
              memberCount: allMembers.length + circle.invitations.length,
              members: allMembers,
              creator: circle.owner.wallet,
              paymentType: circle.paymentType,
            };
          })
        );

        const totalCircles = dbCircles.length;
        const totalSaved = dbCircles.reduce(
          (sum, circle) => sum + circle.currentAmount,
          BigInt(0)
        );
        const goalsReached = dbCircles.filter(
          (circle) => circle.currentAmount >= circle.targetAmount
        ).length;

        const calculateStreak = (circles: any[]) => {
          if (!circles || circles.length === 0) return 0;

          const activeCircles = circles.filter(
            (circle) => circle.currentAmount > BigInt(0) && circle.isActive
          );

          return Math.min(activeCircles.length, 7);
        };

        const currentStreak = calculateStreak(dbCircles);

        setDashboardData({
          totalCircles,
          totalSaved,
          goalsReached,
          currentStreak,
          circles: dbCircles,
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
      console.log("💰 updateCircleContribution called with:", {
        circleId,
        contributionAmount: contributionAmount.toString(),
      });

      setDashboardData((prevData) => {
        console.log("🔍 Current dashboard data before update:", {
          currentCircles: prevData.circles.map((c) => ({
            id: c.id,
            name: c.name,
            currentAmount: c.currentAmount.toString(),
          })),
        });

        const updatedCircles = prevData.circles.map((circle) => {
          if (circle.id === circleId) {
            const newCurrentAmount = circle.currentAmount + contributionAmount;
            console.log(`🔄 Updating circle ${circle.name}:`, {
              oldAmount: circle.currentAmount.toString(),
              contributionAmount: contributionAmount.toString(),
              newAmount: newCurrentAmount.toString(),
            });
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

        console.log("✅ Dashboard data updated:", {
          oldTotalSaved: prevData.totalSaved.toString(),
          newTotalSaved: newData.totalSaved.toString(),
          circleCount: newData.circles.length,
        });

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
  const deadlineDate = new Date(Number(deadline) * 1000);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days left`;
};
