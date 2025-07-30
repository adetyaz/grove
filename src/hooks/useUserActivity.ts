"use client";
import { useState, useEffect, useCallback } from "react";

export type ActivityType =
  | "contribution"
  | "achievement"
  | "invitation_sent"
  | "gift_sent"
  | "circle_created"
  | "circle_joined";

export interface UserActivity {
  id: string;
  type: ActivityType;
  userAddress: string;
  timestamp: string;
  description?: string;
  metadata?: {
    amount?: string;
    circleName?: string;
    achievementName?: string;
    inviteeEmail?: string;
    recipient?: string;
    txHash?: string;
  };
  user?: {
    email: string;
    name?: string;
    wallet: string;
  };
}

export interface ActivityItem {
  id: string;
  type:
    | "circle_created"
    | "invitation_accepted"
    | "circle_joined"
    | "contribution_made"
    | "achievement_earned";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: "primary" | "secondary" | "accent" | "trust";
}

export function useUserActivity(
  userAddress?: string,
  filterType?: ActivityType
) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!userAddress && filterType === undefined) {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterType) params.append("type", filterType);

        const response = await fetch(`/api/activity/global?${params}`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error("Failed to fetch global activities:", error);
        setActivities([]);
      }
      setLoading(false);
      return;
    }

    if (!userAddress) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("address", userAddress);
      if (filterType) params.append("type", filterType);

      const response = await fetch(`/api/activity/user?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Failed to fetch user activities:", error);
      setActivities([]);
    }
    setLoading(false);
  }, [userAddress, filterType]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const refetch = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    refetch,
  };
}

export function useUserActivityLegacy(userAddress?: string) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      if (!userAddress) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const mockActivities: ActivityItem[] = [
          {
            id: "1",
            type: "circle_created",
            title: "Created a new circle",
            description: "Bitcoin Savings Circle for $1000",
            timestamp: new Date().toISOString(),
            icon: "🎯",
            color: "primary",
          },
          {
            id: "2",
            type: "contribution_made",
            title: "Made a contribution",
            description: "Contributed 0.001 BTC to Bitcoin Savings Circle",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            icon: "💰",
            color: "trust",
          },
        ];

        setActivities(mockActivities);
      } catch (err) {
        console.error("Error fetching user activity:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [userAddress]);

  const refetchActivity = () => {
    if (userAddress) {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return {
    activities,
    loading,
    error,
    refetchActivity,
  };
}
