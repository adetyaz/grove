"use client";
import { useAccount, useReadContract } from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import {
  groveContract,
  formatBTCAmount,
  calculateProgress,
  formatDeadline,
} from "@/lib/grove-contract";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import ContributeForm from "./contribute-form";
import InviteForm from "./invite-form";

interface Circle {
  id: number;
  name: string;
  description: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  isActive: boolean;
  memberCount: number;
}

export default function CircleDashboard() {
  const { address, isConnected } = useAccount();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const [contributeModal, setContributeModal] = useState<{
    isOpen: boolean;
    circleId: number;
    circleName: string;
  }>({ isOpen: false, circleId: 0, circleName: "" });
  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    circleId: number;
    circleName: string;
  }>({ isOpen: false, circleId: 0, circleName: "" });

  // Get user's circle IDs
  const { data: userCircleIds, isLoading: loadingIds } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "getUserCircles",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    const fetchCircleDetails = async () => {
      if (!userCircleIds || !Array.isArray(userCircleIds)) return;

      setLoading(true);
      try {
        const circlePromises = userCircleIds.map((id: bigint) =>
          groveContract.getCircle(Number(id))
        );

        const circleDetails = await Promise.all(circlePromises);
        const validCircles = circleDetails.filter(
          (circle) => circle !== null
        ) as Circle[];
        setCircles(validCircles);
      } catch (error) {
        console.error("Error fetching circle details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircleDetails();
  }, [userCircleIds]);

  if (!isConnected) {
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

  if (loadingIds || loading) {
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

  if (circles.length === 0) {
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
            {circles.length} active circle{circles.length !== 1 ? "s" : ""}{" "}
            growing your wealth
          </p>
        </div>
        <a
          href='/create'
          className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center'
        >
          <span className='mr-2'>🌱</span>
          Plant New Circle
        </a>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {circles.map((circle) => {
          const progress = calculateProgress(
            circle.currentAmount,
            circle.targetAmount
          );
          const isExpired = Number(circle.deadline) * 1000 < Date.now();

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
                    <UserPlus className='w-4 h-4 text-blue-400' />
                    <span className='text-gray-300'>
                      {circle.memberCount} members
                    </span>
                  </div>
                  <div className='text-right'>
                    <span
                      className={`text-sm ${isExpired ? "text-red-400" : "text-gray-400"}`}
                    >
                      {formatDeadline(circle.deadline)}
                    </span>
                  </div>
                </div>

                <div className='flex space-x-2'>
                  <button
                    className='flex-1 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-green-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-green-500/30 hover:to-green-600/30 transition-all duration-200'
                    onClick={() => {
                      setContributeModal({
                        isOpen: true,
                        circleId: circle.id,
                        circleName: circle.name,
                      });
                    }}
                  >
                    Contribute
                  </button>
                  <button
                    className='flex-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-300 py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-200'
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
          circleName={contributeModal.circleName}
          onSuccess={() => {
            // Refresh the circles data after successful contribution
            window.location.reload();
          }}
          onClose={() =>
            setContributeModal({ isOpen: false, circleId: 0, circleName: "" })
          }
        />
      )}

      {/* Invite Modal */}
      {inviteModal.isOpen && (
        <InviteForm
          circleId={inviteModal.circleId}
          circleName={inviteModal.circleName}
          onClose={() =>
            setInviteModal({ isOpen: false, circleId: 0, circleName: "" })
          }
        />
      )}

      {/* Invite Modal */}
      {inviteModal.isOpen && (
        <InviteForm
          circleId={inviteModal.circleId}
          circleName={inviteModal.circleName}
          onSuccess={() => {
            // Optionally refresh or show success message
          }}
          onClose={() =>
            setInviteModal({ isOpen: false, circleId: 0, circleName: "" })
          }
        />
      )}
    </div>
  );
}
