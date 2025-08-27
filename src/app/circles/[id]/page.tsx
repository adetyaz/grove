"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import WalletButton from "@/components/wallet-button";
import InviteForm from "@/components/invite-form";
import ContributeForm from "@/components/contribute-form";
import ContributionHistory from "@/components/contribution-history";
import VotingPanel from "@/components/voting-panel";

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
  Gift,
} from "lucide-react";

interface CircleData {
  id: string;
  onChainId: number;
  name: string;
  description?: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  isActive: boolean;
  syncStatus: string;
  memberCount: number;
  members: string[];
  creator: string;
  paymentType: string;
  contributionAmount?: bigint;
  createdAt: string;
  owner?: {
    id: string;
    email: string;
    name: string | null;
    wallet: string;
  };
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
  const searchParams = useSearchParams();
  const { user, primaryWallet } = useDynamicConnection();
  const [circle, setCircle] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "activity" | "gifts" | "voting"
  >("overview");

  const circleId = params.id as string;

  const isConnected = !!(user && primaryWallet?.address);
  const address = primaryWallet?.address;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "gift" || tab === "gifts") {
      setActiveTab("gifts");
    }
  }, [searchParams]);

  useEffect(() => {
    // Temporarily disabled to test navigation
    // if (!isConnected) {
    //   router.push("/");
    //   return;
    // }

    const fetchCircleData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/circles/${circleId}`);
        const data = await response.json();

        if (
          response.ok &&
          data &&
          (data.id || (data.circle && data.circle.id))
        ) {
          setCircle(data.circle ? data.circle : data);
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

  const formatBTCAmount = (amount: bigint | string) => {
    const n = typeof amount === "string" ? BigInt(amount) : amount;
    return `${(Number(n) / 1e18).toFixed(6)} BTC`;
  };

  const calculateProgress = (
    current: bigint | string,
    target: bigint | string
  ) => {
    const c = typeof current === "string" ? BigInt(current) : current;
    const t = typeof target === "string" ? BigInt(target) : target;
    if (t === BigInt(0)) return 0;
    return (Number(c) / Number(t)) * 100;
  };

  const formatDeadline = (deadline: bigint | string) => {
    let ts =
      typeof deadline === "string" ? parseInt(deadline) : Number(deadline);

    // Handle no deadline case (0 means no deadline for recurring circles)
    if (ts === 0) {
      return "No deadline";
    }

    if (ts > 1e12) ts = Math.floor(ts / 1000);
    const date = new Date(ts * 1000);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center'>
        <div className='text-center animate-fade-in'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4'></div>
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
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center'>
        <Card className='max-w-md bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
          <CardContent className='text-center p-8'>
            <div className='w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>❌</span>
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Circle Not Found
            </h3>
            <p className='text-gray-300 mb-6'>{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className='w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white transition-all duration-300 hover-lift'
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
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Header */}
      <header className='border-b border-white/20 bg-white/10 backdrop-blur-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4 animate-fade-in'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.push("/dashboard")}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-white'>{circle.name}</h1>
                <p className='text-gray-400 text-sm'>Circle Details</p>
              </div>
            </div>
            <div className='flex items-center space-x-4 animate-fade-in'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleShare}
                className='border-white/20 text-black hover:bg-white/10 transition-all duration-300'
              >
                <Share className='w-4 h-4 mr-2' color='black' />
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
          <Card className='lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
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
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30'>
                        <Crown className='w-3 h-3 mr-1' />
                        Creator
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        circle.isActive
                          ? "bg-secondary/20 text-secondary border-secondary/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {circle.isActive ? "Active" : "Inactive"}
                    </span>
                    {isGoalReached && (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30 glow'>
                        <Award className='w-3 h-3 mr-1' />
                        Goal Reached
                      </span>
                    )}
                  </div>
                </div>
                {isCreator && (
                  <Button
                    variant='outline'
                    size='icon'
                    className='border-white/20 text-white hover:bg-white/10 transition-all duration-300'
                  >
                    <Settings className='w-4 h-4' color='black' />
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
                <div className='relative'>
                  <Progress value={progress} className='h-4' />
                  {isGoalReached && (
                    <div className='absolute inset-0 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full animate-pulse'></div>
                  )}
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-400'>
                    {progress.toFixed(1)}% complete
                  </span>
                  <span className='text-gray-400'>
                    {formatBTCAmount(
                      (typeof circle.targetAmount === "string"
                        ? BigInt(circle.targetAmount)
                        : circle.targetAmount) -
                        (typeof circle.currentAmount === "string"
                          ? BigInt(circle.currentAmount)
                          : circle.currentAmount)
                    )}{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Key Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 hover-lift'>
                  <Users className='w-6 h-6 text-trust mx-auto mb-2' />
                  <div className='text-2xl font-bold text-white'>
                    {circle.memberCount}
                  </div>
                  <div className='text-sm text-gray-400'>Members</div>
                </div>
                <div className='text-center p-4 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 hover-lift'>
                  <Calendar className='w-6 h-6 text-primary mx-auto mb-2' />
                  <div className='text-lg font-bold text-white'>
                    {formatDeadline(circle.deadline)}
                  </div>
                  <div className='text-sm text-gray-400'>Deadline</div>
                </div>
                <div className='text-center p-4 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 hover-lift'>
                  <DollarSign className='w-6 h-6 text-secondary mx-auto mb-2' />
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
            <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
              <CardHeader>
                <CardTitle className='text-white'>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  onClick={() => setShowContributeModal(true)}
                  className='w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white transition-all duration-300 hover-lift shadow-lg hover:shadow-secondary/25'
                  disabled={!circle.isActive}
                >
                  <Wallet className='w-4 h-4 mr-2' />
                  Contribute
                </Button>

                {/* Show different buttons based on payment type */}
                {circle.paymentType === "RECURRING" ? (
                  <Button
                    onClick={() => console.log("Claim feature coming soon")}
                    variant='outline'
                    className='w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300'
                    disabled={!circle.isActive}
                  >
                    <Award className='w-4 h-4 mr-2' />
                    Start Vote to Claim
                  </Button>
                ) : (
                  <Button
                    onClick={() => console.log("Gift feature coming soon")}
                    variant='outline'
                    className='w-full border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white transition-all duration-300'
                    disabled={!circle.isActive}
                  >
                    <Gift className='w-4 h-4 mr-2' />
                    Send Gift
                  </Button>
                )}

                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant='outline'
                  className='w-full border-trust text-trust hover:bg-trust hover:text-white transition-all duration-300'
                  disabled={!isCreator}
                >
                  <UserPlus className='w-4 h-4 mr-2' />
                  Invite Members
                </Button>
                <Button
                  onClick={handleShare}
                  variant='outline'
                  className='w-full border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300'
                >
                  <Copy className='w-4 h-4 mr-2' />
                  Copy Link
                </Button>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-secondary/20 to-secondary/30 border-secondary/40 glow animate-fade-in'>
              <CardContent className='p-6 text-center'>
                <div className='text-4xl mb-2'>🌳</div>
                <h3 className='text-secondary font-medium mb-2'>
                  Circle Status
                </h3>
                <p className='text-gray-300 text-sm'>
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
          <div className='flex space-x-4 border-b border-white/20'>
            {[
              { id: "overview", label: "Overview", icon: Target },
              { id: "members", label: "Members", icon: Users },
              { id: "activity", label: "Activity", icon: TrendingUp },
              { id: "gifts", label: "Gifts", icon: Gift },
              { id: "voting", label: "Voting", icon: Award },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() =>
                  setActiveTab(
                    id as
                      | "overview"
                      | "members"
                      | "activity"
                      | "gifts"
                      | "voting"
                  )
                }
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-all duration-300 hover-lift ${
                  activeTab === id
                    ? "border-primary text-primary"
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
            <div>
              <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in mb-8'>
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
                            {circle.paymentType === "RECURRING"
                              ? "Recurring"
                              : "One-time"}
                          </span>
                        </div>
                        {circle.contributionAmount && (
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>
                              Contribution Amount:
                            </span>
                            <span className='text-white'>
                              {formatBTCAmount(circle.contributionAmount)}
                            </span>
                          </div>
                        )}
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Creator:</span>
                          <span className='text-white font-mono text-sm'>
                            {circle.creator === address
                              ? "You"
                              : `${circle.creator.slice(
                                  0,
                                  6
                                )}...${circle.creator.slice(-4)}`}
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
                              (typeof circle.targetAmount === "string"
                                ? BigInt(circle.targetAmount)
                                : circle.targetAmount) -
                                (typeof circle.currentAmount === "string"
                                  ? BigInt(circle.currentAmount)
                                  : circle.currentAmount)
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
            </div>
          )}

          {activeTab === "members" && (
            <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-white'>
                    Circle Members ({circle.memberCount})
                  </CardTitle>
                  {isCreator && (
                    <Button
                      onClick={() => setShowInviteModal(true)}
                      size='sm'
                      className='bg-gradient-to-r from-trust to-trust/90 hover:from-trust/90 hover:to-trust text-white transition-all duration-300 hover-lift'
                    >
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
                      className='flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 hover-lift'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-trust to-trust/80 rounded-full flex items-center justify-center shadow-lg'>
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
                              <Crown className='w-4 h-4 text-accent' />
                            )}
                          </div>
                          <span className='text-xs text-gray-400'>
                            Member #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs ${
                            member === circle.creator
                              ? "border-accent/30 text-accent bg-accent/10"
                              : "border-white/20 text-gray-300 bg-white/5"
                          }`}
                        >
                          {member === circle.creator ? "Creator" : "Member"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "activity" && (
            <div className='animate-fade-in'>
              <ContributionHistory />
            </div>
          )}

          {activeTab === "gifts" && (
            <div className='animate-fade-in'>
              <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
                <CardContent className='p-8 text-center'>
                  <div className='w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Gift className='w-8 h-8 text-pink-400' />
                  </div>
                  <h3 className='text-xl font-bold text-white mb-2'>
                    Gifts Feature
                  </h3>
                  <p className='text-gray-300'>
                    Gift functionality coming soon! Send special gifts to circle
                    members.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "voting" && (
            <div className='animate-fade-in'>
              <VotingPanel
                circleId={circle.id}
                onChainId={circle.onChainId}
                isOwner={isCreator}
                onRefresh={() => {
                  // Refresh circle data after successful proposal execution
                  window.location.reload();
                }}
              />
            </div>
          )}
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

            window.location.reload();
          }}
        />
      )}

      {showContributeModal && (
        <ContributeForm
          circleId={circle.id}
          onChainId={circle.onChainId}
          circleName={circle.name}
          circlePaymentType={circle.paymentType}
          onClose={() => setShowContributeModal(false)}
          onSuccess={() => {
            setShowContributeModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
