"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  type: string;
  description?: string;
  metadata?: string;
  timestamp: Date;
}

interface RecentActivityProps {
  userAddress: string;
}

export default function RecentActivity({ userAddress }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!userAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/activity/user?address=${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const refetch = () => {
    fetchActivities();
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const getActivityDescription = (activity: Activity) => {
    if (activity.description) return activity.description;

    // Parse metadata to create description
    try {
      const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
      switch (activity.type) {
        case "contribution":
          return `Contributed ${metadata.amount || "some"} BTC to ${
            metadata.circleName || "a circle"
          }`;
        case "circle_created":
          return `Created circle: ${metadata.circleName || "Unknown"}`;
        case "circle_joined":
          return `Joined circle: ${metadata.circleName || "Unknown"}`;
        case "achievement_earned":
          return `Earned achievement: ${metadata.achievementName || "Unknown"}`;
        default:
          return activity.type.replace("_", " ");
      }
    } catch {
      return activity.type.replace("_", " ");
    }
  };

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
      <CardHeader>
        <CardTitle className='text-white flex items-center justify-between'>
          <div className='flex items-center'>
            <Clock className='w-5 h-5 mr-2 text-trust' />
            Recent Activity
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={refetch}
            disabled={loading}
            className='text-gray-400 hover:text-white p-1 h-8 w-8'
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='text-center py-6'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-gray-400'>Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className='text-center py-6'>
            <Clock className='w-8 h-8 text-gray-500 mx-auto mb-2' />
            <p className='text-gray-400 text-sm mb-2'>
              No recent activity yet.
            </p>
            <p className='text-xs text-gray-500'>
              Create circles and make contributions to see your activity!
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {activities.map((activity) => (
              <div
                key={activity.id}
                className='flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200'
              >
                <div className='text-lg text-trust'>
                  <Clock className='w-4 h-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <p className='text-white font-medium text-sm truncate'>
                      {getActivityDescription(activity)}
                    </p>
                    <span className='text-xs text-gray-400 ml-2 whitespace-nowrap'>
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className='text-gray-300 text-xs mt-1 leading-relaxed'>
                    {activity.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            ))}

            {activities.length >= 5 && (
              <div className='text-center pt-2 border-t border-white/20'>
                <p className='text-xs text-gray-500'>Showing recent activity</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
