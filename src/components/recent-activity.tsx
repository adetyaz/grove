"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw } from "lucide-react";
import { useUserActivityLegacy, ActivityItem } from "@/hooks/useUserActivity";
import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  userAddress: string;
}

export default function RecentActivity({ userAddress }: RecentActivityProps) {
  const { activities, loading, error, refetchActivity } =
    useUserActivityLegacy(userAddress);

  const formatTimestamp = (timestamp: string) => {
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

  const getColorClass = (color: ActivityItem["color"]) => {
    switch (color) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary";
      case "accent":
        return "text-accent";
      case "trust":
        return "text-trust";
      default:
        return "text-gray-400";
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
            onClick={refetchActivity}
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
        ) : error ? (
          <div className='text-center py-6'>
            <Clock className='w-8 h-8 text-red-500 mx-auto mb-2' />
            <p className='text-red-400 text-sm mb-2'>Failed to load activity</p>
            <Button
              variant='outline'
              size='sm'
              onClick={refetchActivity}
              className='text-gray-400 hover:text-white border-gray-600'
            >
              Try Again
            </Button>
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
                <div className={`text-lg ${getColorClass(activity.color)}`}>
                  {activity.icon}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <p className='text-white font-medium text-sm truncate'>
                      {activity.title}
                    </p>
                    <span className='text-xs text-gray-400 ml-2 whitespace-nowrap'>
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className='text-gray-300 text-xs mt-1 leading-relaxed'>
                    {activity.description}
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
