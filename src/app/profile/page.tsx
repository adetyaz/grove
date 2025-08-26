"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Wallet,
  Trophy,
  TrendingUp,
  Calendar,
  Bitcoin,
  Users,
  Target,
  Clock,
  Award,
  Flame,
  Edit,
} from "lucide-react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  wallet: string;
  email: string;
  name: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalContributions: number;
  totalSaved: string;
  invitedMembers: number;
  circlesCompleted: number;
}

interface UserActivity {
  id: string;
  activityType: string;
  circleId: string;
  amount: string;
  timestamp: string;
  metadata: any;
}

interface UserCircle {
  id: string;
  onChainId: number;
  name: string;
  targetAmount: string;
  currentAmount: string;
  memberCount: number;
  isOwner: boolean;
  status: "active" | "completed" | "pending";
}

export default function ProfilePage() {
  const { primaryWallet } = useDynamicConnection();
  const [activeTab, setActiveTab] = useState<
    "overview" | "circles" | "activity"
  >("overview");
  const [isEditing, setIsEditing] = useState(false);
  const address = primaryWallet?.address;

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", address],
    queryFn: async () => {
      if (!address) return null;
      const response = await fetch(`/api/user/profile?wallet=${address}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!address,
  });

  // Fetch user circles
  const { data: circles, isLoading: circlesLoading } = useQuery({
    queryKey: ["user-circles", address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(`/api/user/circles?wallet=${address}`);
      if (!response.ok) throw new Error("Failed to fetch circles");
      return response.json();
    },
    enabled: !!address,
  });

  // Fetch recent activity
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["user-activities", address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(
        `/api/user/activities?wallet=${address}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
    enabled: !!address,
  });

  const formatBTC = (satoshis: string) => {
    const btc = parseInt(satoshis) / 100000000;
    return btc.toFixed(8);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contribution":
        return <Bitcoin className='w-4 h-4 text-orange-400' />;
      case "circle_joined":
        return <Users className='w-4 h-4 text-blue-400' />;
      case "circle_created":
        return <Target className='w-4 h-4 text-green-400' />;
      default:
        return <Clock className='w-4 h-4 text-gray-400' />;
    }
  };

  const getActivityDescription = (activity: UserActivity) => {
    switch (activity.activityType) {
      case "contribution":
        return `Contributed ${formatBTC(activity.amount || "0")} BTC to circle`;
      case "circle_joined":
        return "Joined a new circle";
      case "circle_created":
        return "Created a new circle";
      default:
        return "Unknown activity";
    }
  };

  if (!address) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <Wallet className='w-12 h-12 text-white/40 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-white mb-2'>
            Connect Your Wallet
          </h2>
          <p className='text-white/60'>
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Profile Header */}
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
            {/* Avatar and Basic Info */}
            <div className='flex items-center gap-6'>
              <Avatar className='w-20 h-20'>
                <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl'>
                  {profile?.name
                    ? profile.name.charAt(0).toUpperCase()
                    : address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h1 className='text-3xl font-bold text-white'>
                    {profile?.name || "Anonymous User"}
                  </h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className='p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                </div>
                <p className='text-white/60 font-mono text-sm mb-1'>
                  {address}
                </p>
                <p className='text-white/40 text-sm'>
                  Member since{" "}
                  {profile
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className='flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 ml-auto'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-400'>
                  {profile?.totalContributions || 0}
                </div>
                <div className='text-white/60 text-sm'>Contributions</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-400'>
                  {profile ? formatBTC(profile.totalSaved) : "0.00000000"}
                </div>
                <div className='text-white/60 text-sm'>BTC Saved</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-400'>
                  {profile?.currentStreak || 0}
                </div>
                <div className='text-white/60 text-sm'>Current Streak</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-400'>
                  {profile?.circlesCompleted || 0}
                </div>
                <div className='text-white/60 text-sm'>Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex space-x-1 mb-8'>
          {[
            { id: "overview", label: "Overview", icon: User },
            { id: "circles", label: "My Circles", icon: Target },
            { id: "activity", label: "Recent Activity", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Achievement Stats */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
              <div className='flex items-center gap-3 mb-4'>
                <Trophy className='w-6 h-6 text-yellow-400' />
                <h3 className='text-lg font-semibold text-white'>
                  Achievements
                </h3>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-white/70'>Longest Streak</span>
                  <span className='text-white font-medium'>
                    {profile?.longestStreak || 0} days
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-white/70'>Members Invited</span>
                  <span className='text-white font-medium'>
                    {profile?.invitedMembers || 0}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-white/70'>Circles Completed</span>
                  <span className='text-white font-medium'>
                    {profile?.circlesCompleted || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Streak Tracker */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
              <div className='flex items-center gap-3 mb-4'>
                <Flame className='w-6 h-6 text-orange-400' />
                <h3 className='text-lg font-semibold text-white'>
                  Streak Status
                </h3>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-orange-400 mb-2'>
                  {profile?.currentStreak || 0}
                </div>
                <div className='text-white/60 text-sm mb-4'>Day streak</div>
                <div className='text-white/50 text-xs'>
                  Last activity:{" "}
                  {profile?.lastActivityDate
                    ? new Date(profile.lastActivityDate).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
              <div className='flex items-center gap-3 mb-4'>
                <Bitcoin className='w-6 h-6 text-orange-400' />
                <h3 className='text-lg font-semibold text-white'>
                  Savings Summary
                </h3>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-white/70'>Total Saved</span>
                  <span className='text-white font-medium'>
                    {profile ? formatBTC(profile.totalSaved) : "0.00000000"} BTC
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-white/70'>Total Contributions</span>
                  <span className='text-white font-medium'>
                    {profile?.totalContributions || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "circles" && (
          <div>
            {circlesLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
              </div>
            ) : circles?.circles?.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {circles.circles.map((circle: UserCircle) => (
                  <div
                    key={circle.id}
                    className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <h3 className='font-bold text-white text-lg'>
                        {circle.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          circle.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : circle.status === "completed"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {circle.status}
                      </span>
                    </div>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-white/70'>Target</span>
                        <span className='text-white'>
                          {formatBTC(circle.targetAmount)} BTC
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-white/70'>Progress</span>
                        <span className='text-white'>
                          {formatBTC(circle.currentAmount)} BTC
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-white/70'>Members</span>
                        <span className='text-white'>{circle.memberCount}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-white/70'>Role</span>
                        <span className='text-white'>
                          {circle.isOwner ? "Owner" : "Member"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <Target className='w-12 h-12 text-white/40 mx-auto mb-4' />
                <p className='text-white/60 text-lg'>No circles found</p>
                <p className='text-white/40 text-sm mt-2'>
                  Join or create a circle to get started
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            {activitiesLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
              </div>
            ) : activities?.activities?.length > 0 ? (
              <div className='space-y-4'>
                {activities.activities.map((activity: UserActivity) => (
                  <div
                    key={activity.id}
                    className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'
                  >
                    <div className='flex items-center gap-4'>
                      {getActivityIcon(activity.activityType)}
                      <div className='flex-1'>
                        <p className='text-white'>
                          {getActivityDescription(activity)}
                        </p>
                        <p className='text-white/60 text-sm'>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <TrendingUp className='w-12 h-12 text-white/40 mx-auto mb-4' />
                <p className='text-white/60 text-lg'>No recent activity</p>
                <p className='text-white/40 text-sm mt-2'>
                  Start contributing to circles to see your activity here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
