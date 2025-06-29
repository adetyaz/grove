"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  Plus,
  MoreVertical,
  Wallet,
  UserPlus,
  Crown,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  formatBTCAmount,
  calculateProgress,
  formatDeadline,
} from "@/hooks/useDashboardData";
import InviteForm from "./invite-form";
import ContributeForm from "./contribute-form";

interface CircleCardProps {
  circle: {
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
  };
  userAddress: string;
  onUpdate?: () => void;
}

export default function CircleCard({
  circle,
  userAddress,
  onUpdate,
}: CircleCardProps) {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const progress = calculateProgress(circle.currentAmount, circle.targetAmount);
  const isCreator = circle.creator.toLowerCase() === userAddress.toLowerCase();
  const isGoalReached = circle.currentAmount >= circle.targetAmount;

  const handleCardClick = () => {
    router.push(`/circles/${circle.id}`);
  };

  return (
    <>
      <Card
        className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group'
        onClick={handleCardClick}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='flex items-center space-x-2 mb-2'>
                <h3 className='text-xl font-bold text-white group-hover:text-orange-300 transition-colors'>
                  {circle.name}
                </h3>
                {isCreator && (
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30'>
                    <Crown className='w-3 h-3 mr-1' />
                    Creator
                  </span>
                )}
                <ExternalLink className='w-4 h-4 text-gray-400 group-hover:text-orange-300 transition-colors' />
              </div>
              {circle.description && (
                <p className='text-gray-400 text-sm mb-3'>
                  {circle.description}
                </p>
              )}
              <div className='flex items-center space-x-4 text-sm text-gray-400'>
                <span className='flex items-center'>
                  <Users className='w-4 h-4 mr-1' />
                  {circle.memberCount} member
                  {circle.memberCount !== 1 ? "s" : ""}
                </span>
                <span className='flex items-center'>
                  <Clock className='w-4 h-4 mr-1' />
                  {formatDeadline(circle.deadline)}
                </span>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:text-white'
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking menu
              }}
            >
              <MoreVertical className='w-4 h-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Click hint */}
          <div className='text-center'>
            <p className='text-xs text-gray-500 group-hover:text-orange-400 transition-colors'>
              💡 Click anywhere to view full circle details
            </p>
          </div>

          {/* Progress Section */}
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-300'>
                Progress
              </span>
              <span className='text-sm text-gray-400'>
                {formatBTCAmount(circle.currentAmount)} /{" "}
                {formatBTCAmount(circle.targetAmount)}
              </span>
            </div>
            <div className='w-full bg-gray-700 rounded-full h-3'>
              <div
                className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300'
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div className='flex justify-between items-center text-xs'>
              <span className='text-gray-400'>
                {progress.toFixed(1)}% complete
              </span>
              {isGoalReached ? (
                <span className='text-green-400 font-medium'>
                  🎉 Goal Reached!
                </span>
              ) : (
                <span className='text-gray-400'>
                  {formatBTCAmount(circle.targetAmount - circle.currentAmount)}{" "}
                  remaining
                </span>
              )}
            </div>
          </div>

          {/* Members Section */}
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-300'>Members</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowMembers(!showMembers)}
                className='text-gray-400 hover:text-white'
              >
                {showMembers ? "Hide" : "Show"} Members
              </Button>
            </div>

            {showMembers && (
              <div className='space-y-2 bg-gray-800/50 rounded-lg p-3'>
                {circle.members.map((member, index) => (
                  <div
                    key={member}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      <div className='w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center'>
                        <span className='text-xs text-white font-bold'>
                          {member.slice(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <span className='text-xs font-mono text-gray-300'>
                        {member === userAddress
                          ? "You"
                          : `${member.slice(0, 6)}...${member.slice(-4)}`}
                      </span>
                      {member === circle.creator && (
                        <Crown className='w-3 h-3 text-orange-400' />
                      )}
                    </div>
                    <span className='text-xs text-gray-500'>
                      Member #{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='grid grid-cols-2 gap-3'>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowContributeModal(true);
              }}
              className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              disabled={!circle.isActive}
            >
              <Wallet className='w-4 h-4 mr-2' />
              Contribute
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowInviteModal(true);
              }}
              variant='outline'
              className='border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white'
              disabled={!isCreator}
            >
              <UserPlus className='w-4 h-4 mr-2' />
              Invite
            </Button>
          </div>

          {/* Status Badge */}
          <div className='flex justify-center'>
            {isGoalReached ? (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30'>
                <Target className='w-4 h-4 mr-1' />
                Goal Achieved
              </span>
            ) : circle.isActive ? (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30'>
                <Plus className='w-4 h-4 mr-1' />
                Active
              </span>
            ) : (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30'>
                Inactive
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showInviteModal && (
        <InviteForm
          circleId={circle.id}
          circleName={circle.name}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            onUpdate?.();
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
            onUpdate?.();
          }}
        />
      )}
    </>
  );
}
