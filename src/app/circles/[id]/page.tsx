"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import WalletButton from "@/components/wallet-button";
import InviteForm from "@/components/invite-form";
import ContributeForm from "@/components/contribute-form";
import ContributionHistory from "@/components/contribution-history";
import { groveToast } from "@/lib/toast";
import {
  ArrowLeft,
  Users,
  Target,
  Calendar,
  Wallet,
  UserPlus,
  Crown,
  Settings,
  Share,
  Copy,
  TrendingUp,
  DollarSign,
  Award,
} from "lucide-react";

interface CircleData {
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
  paymentType: number;
  fixedAmount?: bigint;
  createdAt: string;
  contributions?: {
    id: string;
    amount: bigint;
    contributor: string;
    timestamp: bigint;
    txHash: string;
  }[];
}

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [circle, setCircle] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "activity"
  >("overview");

  const circleId = params.id as string;

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    const fetchCircleData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/circles/${circleId}`);
        const data = await response.json();

        if (response.ok) {
          setCircle(data.circle);
        } else {
          setError(data.error || "Circle not found");
        }
      } catch (err) {
        console.error("Error fetching circle:", err);
        setError("Failed to load circle data");
      } finally {
        setLoading(false);
      }
    };

    if (circleId) {
      fetchCircleData();
    }
  }, [circleId, isConnected, router]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/circles/${circleId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      groveToast.copySuccess("Circle link");
    } catch {
      groveToast.error("Failed to copy link");
    }
  };

  const formatBTCAmount = (amount: bigint) => {
    return `${(Number(amount) / 1e18).toFixed(6)} BTC`;
  };

  const calculateProgress = (current: bigint, target: bigint) => {
    if (target === BigInt(0)) return 0;
    return (Number(current) / Number(target)) * 100;
  };

  const formatDeadline = (deadline: bigint) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4'></div>
          <h3 className='text-lg font-semibold text-white mb-2'>
            Loading Circle
          </h3>
          <p className='text-gray-300'>
            Fetching circle data from the blockchain...
          </p>
        </div>
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <Card className='max-w-md'>
          <CardContent className='text-center p-8'>
            <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>❌</span>
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Circle Not Found
            </h3>
            <p className='text-gray-300 mb-6'>{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className='w-full'
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = circle.creator.toLowerCase() === address?.toLowerCase();
  const progress = calculateProgress(circle.currentAmount, circle.targetAmount);
  const isGoalReached = circle.currentAmount >= circle.targetAmount;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Header */}
      <header className='border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.push("/dashboard")}
                className='text-gray-400 hover:text-white'
              >
                <ArrowLeft className='w-4 h-4' />
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-white'>{circle.name}</h1>
                <p className='text-gray-400 text-sm'>Circle Details</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <Button variant='outline' size='sm' onClick={handleShare}>
                <Share className='w-4 h-4 mr-2' />
                Share
              </Button>
              <WalletButton variant='ghost' className='text-white' />
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 lg:px-8 py-8'>
        {/* Circle Overview */}
        <div className='grid lg:grid-cols-3 gap-8 mb-8'>
          {/* Main Info */}
          <Card className='lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-white text-3xl mb-2'>
                    {circle.name}
                  </CardTitle>
                  {circle.description && (
                    <p className='text-gray-300'>{circle.description}</p>
                  )}
                  <div className='flex items-center space-x-4 mt-4'>
                    {isCreator && (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30'>
                        <Crown className='w-3 h-3 mr-1' />
                        Creator
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${circle.isActive ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}
                    >
                      {circle.isActive ? "Active" : "Inactive"}
                    </span>
                    {isGoalReached && (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'>
                        <Award className='w-3 h-3 mr-1' />
                        Goal Reached
                      </span>
                    )}
                  </div>
                </div>
                {isCreator && (
                  <Button variant='outline' size='icon'>
                    <Settings className='w-4 h-4' />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Progress */}
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-lg font-medium text-white'>
                    Progress
                  </span>
                  <span className='text-gray-300'>
                    {formatBTCAmount(circle.currentAmount)} /{" "}
                    {formatBTCAmount(circle.targetAmount)}
                  </span>
                </div>
                <Progress value={progress} className='h-4' />
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>
                    {progress.toFixed(1)}% complete
                  </span>
                  <span className='text-gray-400'>
                    {formatBTCAmount(
                      circle.targetAmount - circle.currentAmount
                    )}{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Key Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
                  <Users className='w-6 h-6 text-blue-400 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-white'>
                    {circle.memberCount}
                  </div>
                  <div className='text-sm text-gray-400'>Members</div>
                </div>
                <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
                  <Calendar className='w-6 h-6 text-orange-400 mx-auto mb-2' />
                  <div className='text-lg font-bold text-white'>
                    {formatDeadline(circle.deadline)}
                  </div>
                  <div className='text-sm text-gray-400'>Deadline</div>
                </div>
                <div className='text-center p-4 bg-gray-800/50 rounded-lg'>
                  <DollarSign className='w-6 h-6 text-green-400 mx-auto mb-2' />
                  <div className='text-lg font-bold text-white'>
                    {formatBTCAmount(circle.currentAmount)}
                  </div>
                  <div className='text-sm text-gray-400'>Raised</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Panel */}
          <div className='space-y-6'>
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white'>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  onClick={() => setShowContributeModal(true)}
                  className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  disabled={!circle.isActive}
                >
                  <Wallet className='w-4 h-4 mr-2' />
                  Contribute
                </Button>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant='outline'
                  className='w-full border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white'
                  disabled={!isCreator}
                >
                  <UserPlus className='w-4 h-4 mr-2' />
                  Invite Members
                </Button>
                <Button
                  onClick={handleShare}
                  variant='outline'
                  className='w-full border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white'
                >
                  <Copy className='w-4 h-4 mr-2' />
                  Copy Link
                </Button>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30'>
              <CardContent className='p-6 text-center'>
                <div className='text-4xl mb-2'>🌳</div>
                <h3 className='text-green-200 font-medium mb-2'>
                  Circle Status
                </h3>
                <p className='text-green-100 text-sm'>
                  {isGoalReached
                    ? "Congratulations! Goal achieved!"
                    : "Keep growing together!"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className='space-y-6'>
          <div className='flex space-x-4 border-b border-gray-700'>
            {[
              { id: "overview", label: "Overview", icon: Target },
              { id: "members", label: "Members", icon: Users },
              { id: "activity", label: "Activity", icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() =>
                  setActiveTab(id as "overview" | "members" | "activity")
                }
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon className='w-4 h-4' />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <Card className='bg-gray-800 border-gray-700'>
              <CardContent className='p-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-white mb-4'>
                      Circle Information
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Created:</span>
                        <span className='text-white'>
                          {new Date(circle.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Payment Type:</span>
                        <span className='text-white'>
                          {circle.paymentType === 0 ? "One-time" : "Recurring"}
                        </span>
                      </div>
                      {circle.fixedAmount && (
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Fixed Amount:</span>
                          <span className='text-white'>
                            {formatBTCAmount(circle.fixedAmount)}
                          </span>
                        </div>
                      )}
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Creator:</span>
                        <span className='text-white font-mono text-sm'>
                          {circle.creator === address
                            ? "You"
                            : `${circle.creator.slice(0, 6)}...${circle.creator.slice(-4)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-white mb-4'>
                      Progress Details
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Target Amount:</span>
                        <span className='text-white'>
                          {formatBTCAmount(circle.targetAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Current Amount:</span>
                        <span className='text-white'>
                          {formatBTCAmount(circle.currentAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Remaining:</span>
                        <span className='text-white'>
                          {formatBTCAmount(
                            circle.targetAmount - circle.currentAmount
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Progress:</span>
                        <span className='text-green-400 font-semibold'>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "members" && (
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-white'>
                    Circle Members ({circle.memberCount})
                  </CardTitle>
                  {isCreator && (
                    <Button onClick={() => setShowInviteModal(true)} size='sm'>
                      <UserPlus className='w-4 h-4 mr-2' />
                      Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {circle.members.map((member, index) => (
                    <div
                      key={member}
                      className='flex items-center justify-between p-3 bg-gray-800/50 rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center'>
                          <span className='text-sm text-white font-bold'>
                            {member.slice(2, 4).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className='flex items-center space-x-2'>
                            <span className='font-mono text-white'>
                              {member === address
                                ? "You"
                                : `${member.slice(0, 6)}...${member.slice(-4)}`}
                            </span>
                            {member === circle.creator && (
                              <Crown className='w-4 h-4 text-orange-400' />
                            )}
                          </div>
                          <span className='text-xs text-gray-400'>
                            Member #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded border border-gray-600 text-xs text-gray-300'>
                          {member === circle.creator ? "Creator" : "Member"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "activity" && <ContributionHistory />}
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteForm
          circleId={circle.id}
          circleName={circle.name}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            // Refresh circle data
            window.location.reload();
          }}
        />
      )}

      {showContributeModal && (
        <ContributeForm
          circleId={circle.id}
          circleName={circle.name}
          onClose={() => setShowContributeModal(false)}
          onSuccess={() => {
            setShowContributeModal(false);
            // Refresh circle data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
