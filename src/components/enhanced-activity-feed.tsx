"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserActivity, ActivityType } from "@/hooks/useUserActivity";
import {
  Clock,
  Wallet,
  UserPlus,
  Trophy,
  Gift,
  Target,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { formatBTCAmount } from "@/hooks/useDashboardData";

interface EnhancedActivityFeedProps {
  userAddress: string;
}

export default function EnhancedActivityFeed({
  userAddress,
}: EnhancedActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [showGlobal, setShowGlobal] = useState(false);

  const { activities, loading, refetch } = useUserActivity(
    showGlobal ? undefined : userAddress,
    filter === "all" ? undefined : filter
  );

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "contribution":
        return <Wallet className='w-4 h-4 text-primary' />;
      case "achievement":
        return <Trophy className='w-4 h-4 text-accent' />;
      case "invitation_sent":
        return <UserPlus className='w-4 h-4 text-secondary' />;
      case "gift_sent":
        return <Gift className='w-4 h-4 text-trust' />;
      case "circle_created":
        return <Target className='w-4 h-4 text-primary' />;
      case "circle_joined":
        return <UserPlus className='w-4 h-4 text-secondary' />;
      default:
        return <Clock className='w-4 h-4 text-gray-400' />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "contribution":
        return "border-primary/20 bg-primary/10";
      case "achievement":
        return "border-accent/20 bg-accent/10";
      case "invitation_sent":
        return "border-secondary/20 bg-secondary/10";
      case "gift_sent":
        return "border-trust/20 bg-trust/10";
      case "circle_created":
        return "border-primary/20 bg-primary/10";
      case "circle_joined":
        return "border-secondary/20 bg-secondary/10";
      default:
        return "border-white/20 bg-white/10";
    }
  };

  const formatActivityDescription = (activity: any) => {
    switch (activity.type) {
      case "contribution":
        return `Contributed ${formatBTCAmount(
          BigInt(activity.metadata?.amount || 0)
        )} to ${activity.metadata?.circleName || "a circle"}`;
      case "achievement":
        return `Unlocked "${activity.metadata?.achievementName}" achievement`;
      case "invitation_sent":
        return `Invited ${activity.metadata?.inviteeEmail || "someone"} to ${
          activity.metadata?.circleName || "a circle"
        }`;
      case "gift_sent":
        return `Sent ${formatBTCAmount(
          BigInt(activity.metadata?.amount || 0)
        )} gift to ${activity.metadata?.recipient || "someone"}`;
      case "circle_created":
        return `Created circle "${activity.metadata?.circleName}"`;
      case "circle_joined":
        return `Joined circle "${activity.metadata?.circleName}"`;
      default:
        return activity.description || "Unknown activity";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  const activityFilters = [
    { key: "all", label: "All Activity", count: activities.length },
    {
      key: "contribution",
      label: "Contributions",
      count: activities.filter((a) => a.type === "contribution").length,
    },
    {
      key: "achievement",
      label: "Achievements",
      count: activities.filter((a) => a.type === "achievement").length,
    },
    {
      key: "invitation_sent",
      label: "Invitations",
      count: activities.filter((a) => a.type === "invitation_sent").length,
    },
    {
      key: "gift_sent",
      label: "Gifts",
      count: activities.filter((a) => a.type === "gift_sent").length,
    },
  ];

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-white flex items-center'>
            <Clock className='w-5 h-5 mr-2 text-trust' />
            {showGlobal ? "Global Activity" : "Your Activity"}
          </CardTitle>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowGlobal(!showGlobal)}
              className='border-white/20 text-white hover:bg-white/10'
            >
              {showGlobal ? "Your Activity" : "Global Activity"}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={refetch}
              className='border-white/20 text-black hover:bg-white/10'
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Activity Filters */}
        <div className='flex flex-wrap gap-2 mt-4'>
          {activityFilters.map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size='sm'
              onClick={() => setFilter(key as any)}
              className={`flex items-center space-x-1 ${
                filter === key
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border-white/20 text-black hover:bg-white/10 hover:text-white"
              }`}
            >
              <Filter className='w-3 h-3' />
              <span>{label}</span>
              <Badge variant='secondary' className='ml-1 text-xs'>
                {count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className='space-y-3 max-h-96 overflow-y-auto'>
        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-gray-400'>Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className='text-center py-8'>
            <Clock className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <p className='text-gray-400 mb-2'>
              {showGlobal ? "No global activity yet" : "No activity yet"}
            </p>
            <p className='text-sm text-gray-500'>
              {showGlobal
                ? "Activity from all users will appear here"
                : "Your contributions, achievements, and invitations will appear here"}
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${getActivityColor(
                activity.type
              )}`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3 flex-1'>
                  <div className='mt-1'>{getActivityIcon(activity.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-white font-medium text-sm'>
                      {showGlobal && activity.userAddress !== userAddress && (
                        <span className='text-gray-400'>
                          {activity.userAddress.slice(0, 6)}...
                          {activity.userAddress.slice(-4)} •{" "}
                        </span>
                      )}
                      {formatActivityDescription(activity)}
                    </p>
                    <div className='flex items-center space-x-2 mt-1'>
                      <span className='text-xs text-gray-400'>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      {activity.metadata?.txHash && (
                        <a
                          href={`https://explorer.testnet.citrea.xyz/tx/${activity.metadata.txHash}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-blue-400 hover:text-blue-300 underline'
                        >
                          View Tx
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  variant='secondary'
                  className={`text-xs ${
                    activity.type === "achievement"
                      ? "bg-accent/20 text-accent"
                      : activity.type === "contribution"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {activity.type.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
