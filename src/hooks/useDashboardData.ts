"use client";
import { useEffect, useState, useCallback } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";

export function useDashboardData() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const [dashboardData, setDashboardData] = useState({
    circles: [],
    totalCircles: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCircles = useCallback(async () => {
    if (!address) {
      console.log("No address in dashboard hook, skipping fetch");
      return;
    }

    console.log("Dashboard hook fetching circles for address:", address);
    setLoading(true);
    try {
      const url = `/api/circles?userWallet=${address}`;
      console.log("Dashboard hook calling:", url);

      const response = await fetch(url);
      console.log("Dashboard hook response status:", response.status);

      const data = await response.json();
      console.log("Dashboard hook data:", data);

      setDashboardData({
        circles: data.circles || [],
        totalCircles: (data.circles || []).length,
      });
    } catch (error) {
      console.error("Dashboard hook error:", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  return {
    dashboardData,
    loading,
    refetch: fetchCircles,
  };
}

export const formatDeadline = () => "30 days";

export const formatBTCAmount = (amount: any) => {
  if (!amount) return "0.00000000";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(8);
};

export const calculateProgress = (current: any, target: any) => {
  if (!current || !target) return 0;
  const currentNum =
    typeof current === "string" ? parseFloat(current) : current;
  const targetNum = typeof target === "string" ? parseFloat(target) : target;
  return Math.min((currentNum / targetNum) * 100, 100);
};
