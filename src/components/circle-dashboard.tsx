"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import ContributeForm from "./contribute-form";

import InviteForm from "./invite-form";
import InheritancePanel from "./inheritance-panel";

import { formatBTCAmount, calculateProgress } from "@/lib/grove-contract";
import { formatDeadline } from "@/hooks/useDashboardData";

export default function CircleDashboard({
  dashboardData,
  loading,
  updateCircleContribution,
}: {
  dashboardData: any;
  loading: boolean;
  updateCircleContribution?: (
    circleId: string,
    contributionAmount: bigint
  ) => void;
}) {
  const { primaryWallet } = useDynamicConnection();
  const userAddress = primaryWallet?.address;

  const [contributeModal, setContributeModal] = useState<{
    isOpen: boolean;
    circleId: string;
    onChainId: number;
    circleName: string;
    paymentType: string;
  }>({
    isOpen: false,
    circleId: "",
    onChainId: 0,
    circleName: "",
    paymentType: "ONETIME",
  });

  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    circleId: string;
    circleName: string;
  }>({ isOpen: false, circleId: "", circleName: "" });

  const [inheritancePanel, setInheritancePanel] = useState<{
    isOpen: boolean;
    circleId: number;
    circleMembers: string[];
  }>({ isOpen: false, circleId: 0, circleMembers: [] });

  const [userContributions, setUserContributions] = useState<{
    [key: string]: string;
  }>({});

  // Fetch user's actual contributions for each circle
  useEffect(() => {
    const fetchUserContributions = async () => {
      if (!primaryWallet?.address || !dashboardData?.circles) return;

      const contributions: { [key: string]: string } = {};

      for (const circle of dashboardData.circles) {
        try {
          const response = await fetch(
            `/api/contributions/user?userAddress=${userAddress}&circleId=${circle.id}`
          );
          if (response.ok) {
            const data = await response.json();
            contributions[circle.id] = data.totalContributed || "0";
          }
        } catch (error) {
          console.error(
            `Error fetching contributions for circle ${circle.id}:`,
            error
          );
          contributions[circle.id] = "0";
        }
      }

      setUserContributions(contributions);
    };

    fetchUserContributions();
  }, [primaryWallet?.address, userAddress, dashboardData?.circles]);

  // Helper function to get user's ACTUAL contribution amount for a specific circle
  const getUserContributionAmount = (circleId: string) => {
    // Get the EXACT amount this user has contributed to this specific circle
    const actualContribution = userContributions[circleId];
    if (actualContribution && actualContribution !== "0") {
      return actualContribution;
    }

    // Final fallback
    return "100000"; // 0.001 BTC in satoshis
  };

  if (!dashboardData || dashboardData.circles.length === 0) {
    return (
      <div className='text-center py-16'>
        <div className='max-w-md mx-auto'>
          <div className='w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6'>
            <span className='text-3xl'>🔗</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-4'>
            Connect Your Wallet
          </h2>
          <p className='text-gray-300 mb-6'>
            Connect your wallet to view and manage your savings circles.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='text-center py-16'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4'></div>
        <h3 className='text-lg font-semibold text-white mb-2'>
          Loading Circles
        </h3>
        <p className='text-gray-300'>
          Fetching your savings data from the blockchain...
        </p>
      </div>
    );
  }

  if (dashboardData.circles.length === 0) {
    return (
      <div className='text-center py-16'>
        <div className='max-w-md mx-auto'>
          <div className='w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6'>
            <span className='text-3xl'>🌱</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-4'>
            Plant Your First Seed
          </h2>
          <p className='text-gray-300 mb-8'>
            You haven&apos;t created or joined any savings circles yet. Start
            your financial journey today!
          </p>
          <a
            href='/create'
            className='inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg'
          >
            Create Your First Circle
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-3xl font-bold text-white mb-2'>
            Your Savings Grove
          </h2>
          <p className='text-gray-300'>
            {dashboardData.circles.length} active circle
            {dashboardData.circles.length !== 1 ? "s" : ""} growing your wealth
          </p>
        </div>
        <div className='flex gap-3'>
          <a
            href='/create'
            className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center'
          >
            <span className='mr-2'>🌱</span>
            Plant New Circle
          </a>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {dashboardData.circles.map((circle: any) => {
          const progress = calculateProgress(
            circle.currentAmount,
            circle.targetAmount
          );
          // Handle expiry correctly - circles with deadline 0 (no deadline) are never expired
          const deadlineTimestamp = Number(circle.deadline) * 1000;
          const isExpired =
            deadlineTimestamp > 0 && deadlineTimestamp < Date.now();

          return (
            <div
              key={circle.id}
              className='group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105'
            >
              <div className='flex justify-between items-start mb-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center'>
                    <span className='text-xl'>🌳</span>
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-white truncate max-w-32'>
                      {circle.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        circle.isActive && !isExpired
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {circle.isActive && !isExpired
                        ? "🌱 Growing"
                        : "💤 Dormant"}
                    </span>
                  </div>
                </div>
              </div>

              {circle.description && (
                <p className='text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed'>
                  {circle.description}
                </p>
              )}

              <div className='space-y-4'>
                <div className='bg-black/20 rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-400 text-sm'>Progress</span>
                    <span className='text-orange-300 text-sm font-semibold'>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2 mb-3'>
                    <div
                      className='bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500'
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-300'>
                      {formatBTCAmount(circle.currentAmount)} BTC
                    </span>
                    <span className='text-gray-400'>
                      of {formatBTCAmount(circle.targetAmount)} BTC
                    </span>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <UserPlus className='w-4 h-4 text-blue-600' />
                    <span className='text-gray-300'>
                      {circle.memberCount} members
                    </span>
                  </div>
                  <div className='text-right'>
                    <span
                      className={`text-sm ${
                        isExpired ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                    
                    </span>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-2 mb-2'>
                  <button
                    className='bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-green-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-green-500/30 hover:to-green-600/30 transition-all duration-200'
                    onClick={() => {
                      setContributeModal({
                        isOpen: true,
                        circleId: circle.id,
                        onChainId: circle.onChainId,
                        circleName: circle.name,
                        paymentType: circle.paymentType,
                      });
                    }}
                  >
                    Contribute
                  </button>
                </div>

                <div className='flex space-x-2'>
                  <button
                    className='flex-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-200'
                    onClick={() => {
                      setInviteModal({
                        isOpen: true,
                        circleId: circle.id,
                        circleName: circle.name,
                      });
                    }}
                  >
                    Invite
                  </button>
                  <button
                    className='flex-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-200'
                    onClick={() => {
                      setInheritancePanel({
                        isOpen: true,
                        circleId: circle.id,
                        circleMembers:
                          circle.members?.map((m: any) => m.address) || [],
                      });
                    }}
                  >
                    Set Inheritance
                  </button>
                  {/* Show different buttons based on circle type and status */}
                  {(() => {
                    const isGoalReached =
                      circle.currentAmount >= circle.targetAmount;
                    const userContribution = getUserContributionAmount(
                      circle.id
                    );
                    const hasUserContributed = parseFloat(userContribution) > 0;

                    // For one-time circles: show buttons when goal reached OR expired
                    // For recurring circles: show buttons when user has contributed OR goal reached OR expired
                    const shouldShowButtons =
                      circle.paymentType === "ONETIME"
                        ? isGoalReached || isExpired
                        : hasUserContributed || isGoalReached || isExpired;

                    if (!shouldShowButtons) return null;

                    return (
                      <>
                        {circle.paymentType === "ONETIME" ? (
                          // For one-time circles: Send Gift (invite recipient)
                          <button
                            className='flex-1 bg-gradient-to-r from-pink-500/20 to-pink-600/20 border border-pink-500/30 text-pink-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-pink-500/30 hover:to-pink-600/30 transition-all duration-200'
                            onClick={() => {
                              alert("Gift sending coming soon in Grove V3!");
                            }}
                          >
                            🎁 Send Gift (V3)
                          </button>
                        ) : (
                          // For recurring circles: Claim (trigger voting)
                          <button
                            className='flex-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all duration-200'
                            onClick={() => {
                              alert(
                                "Circle claiming with voting coming soon in Grove V3!"
                              );
                            }}
                          >
                            🗳️ Claim (V3)
                          </button>
                        )}
                      </>
                    );
                  })()}
                  <button
                    className='flex-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all duration-200'
                    onClick={() => {
                      // Inheritance claiming is now handled in the inheritance panel
                      setInheritancePanel({
                        isOpen: true,
                        circleId: circle.id,
                        circleMembers:
                          circle.members?.map((m: any) => m.address) || [],
                      });
                    }}
                  >
                    Claim Inheritance
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribution Modal */}
      {contributeModal.isOpen && (
        <ContributeForm
          circleId={contributeModal.circleId}
          onChainId={contributeModal.onChainId}
          circleName={contributeModal.circleName}
          circlePaymentType={contributeModal.paymentType}
          onSuccess={() => {
            setTimeout(() => {
              setContributeModal({
                isOpen: false,
                circleId: "",
                onChainId: 0,
                circleName: "",
                paymentType: "ONETIME",
              });
            }, 1500);
          }}
          onContributionSuccess={updateCircleContribution}
          onClose={() =>
            setContributeModal({
              isOpen: false,
              circleId: "",
              onChainId: 0,
              circleName: "",
              paymentType: "ONETIME",
            })
          }
        />
      )}

      {/* Inheritance Panel */}
      {inheritancePanel.isOpen && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-transparent max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-white'>
                  Inheritance Management
                </h2>
                <button
                  onClick={() =>
                    setInheritancePanel({
                      isOpen: false,
                      circleId: 0,
                      circleMembers: [],
                    })
                  }
                  className='text-white/60 hover:text-white text-xl'
                >
                  ✕
                </button>
              </div>
              <InheritancePanel
                circleId={inheritancePanel.circleId}
                circleMembers={inheritancePanel.circleMembers}
              />
            </div>
          </div>
        </div>
      )}

      {/* Circle Goal/Deadline Claim Modal - Removed for V3 */}
      {/* TODO: Implement new V3 circle claim functionality */}

      {inviteModal.isOpen && (
        <InviteForm
          circleId={inviteModal.circleId}
          circleName={inviteModal.circleName}
          circleDescription={`Join our Bitcoin savings circle "${inviteModal.circleName}" and start building wealth together!`}
          onSuccess={() => {
            console.log("Invitation sent successfully!");
          }}
          onClose={() =>
            setInviteModal({ isOpen: false, circleId: "", circleName: "" })
          }
        />
      )}
    </div>
  );
}
