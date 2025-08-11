"use client";
import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { votingModuleService } from "@/lib/voting-module-contract";
import { groveToast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Vote,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Play,
  Trophy,
  Calendar,
  Target,
} from "lucide-react";
import { Address } from "viem";

interface Proposal {
  id: number;
  circleId: number;
  proposer: string;
  recipient: string;
  amount: bigint;
  description: string;
  votesFor: number;
  votesAgainst: number;
  createdAt: number;
  votingEnds: number;
  executed: boolean;
  passed: boolean;
}

interface VoteProgressTrackerProps {
  circleId: string;
  isOwner?: boolean;
  onVoteUpdate?: () => void;
}

export default function VoteProgressTracker({
  circleId,
  isOwner = false,
  onVoteUpdate,
}: VoteProgressTrackerProps) {
  const { primaryWallet } = useDynamicConnection();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingEnabled, setVotingEnabled] = useState<boolean | null>(null);
  const [enablingVoting, setEnablingVoting] = useState(false);
  const [votingOnProposal, setVotingOnProposal] = useState<number | null>(null);
  const [executingProposal, setExecutingProposal] = useState<number | null>(
    null
  );

  const address = primaryWallet?.address;

  // Convert string circleId to number for blockchain operations
  const onChainCircleId = parseInt(circleId);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);

        // First check if voting is enabled
        try {
          // Get all proposals for this circle
          const proposalIds = await votingModuleService.getCircleProposals(
            onChainCircleId
          );

          // Get details for each proposal
          const proposalDetails = await Promise.all(
            proposalIds.map((id) => votingModuleService.getProposal(id))
          );

          setProposals(proposalDetails);
          setVotingEnabled(true);
        } catch (error: any) {
          if (error.message?.includes("Voting not enabled")) {
            setVotingEnabled(false);
            setProposals([]);
          } else {
            throw error; // Re-throw other errors
          }
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
        groveToast.error("Failed to load voting proposals");
        setVotingEnabled(true); // Assume enabled if we can't determine
      } finally {
        setLoading(false);
      }
    };

    if (onChainCircleId && !isNaN(onChainCircleId)) {
      fetchProposals();
    }
  }, [onChainCircleId]);

  const enableVoting = async () => {
    if (!address || !isOwner) return;

    setEnablingVoting(true);
    try {
      const hash = await votingModuleService.enableVotingWithDelegation(
        onChainCircleId,
        address as Address
      );
      console.log("Voting enabled:", hash);

      // Deposit some escrow for voting operations
      await votingModuleService.depositEscrow(
        onChainCircleId,
        "100000000000000000", // 0.1 ETH
        address as Address
      );

      groveToast.success("Voting enabled for this circle!");
      setVotingEnabled(true);
      onVoteUpdate?.();
    } catch (error: any) {
      console.error("Error enabling voting:", error);
      groveToast.error(error.message || "Failed to enable voting");
    } finally {
      setEnablingVoting(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!address) {
      groveToast.error("Please connect your wallet");
      return;
    }

    try {
      setVotingOnProposal(proposalId);

      await votingModuleService.vote(
        proposalId,
        support,
        address as `0x${string}`
      );

      groveToast.success(
        `Vote ${support ? "FOR" : "AGAINST"} cast successfully!`
      );

      // Refresh proposals
      setTimeout(() => {
        window.location.reload();
        onVoteUpdate?.();
      }, 2000);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      groveToast.error(error.message || "Failed to cast vote");
    } finally {
      setVotingOnProposal(null);
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    if (!address) {
      groveToast.error("Please connect your wallet");
      return;
    }

    try {
      setExecutingProposal(proposalId);

      await votingModuleService.executeProposal(
        proposalId,
        address as `0x${string}`
      );

      groveToast.success("Proposal executed successfully!");

      // Refresh proposals
      setTimeout(() => {
        window.location.reload();
        onVoteUpdate?.();
      }, 2000);
    } catch (error: any) {
      console.error("Error executing proposal:", error);
      groveToast.error(error.message || "Failed to execute proposal");
    } finally {
      setExecutingProposal(null);
    }
  };

  const formatBTCAmount = (amount: bigint) => {
    return `${(Number(amount) / 1e18).toFixed(6)} BTC`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return "Voting ended";

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getVoteProgress = (proposal: Proposal) => {
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    if (totalVotes === 0) return 0;
    return (proposal.votesFor / totalVotes) * 100;
  };

  const isVotingActive = (proposal: Proposal) => {
    const now = Math.floor(Date.now() / 1000);
    return now <= proposal.votingEnds && !proposal.executed;
  };

  const canExecute = (proposal: Proposal) => {
    const now = Math.floor(Date.now() / 1000);
    return now > proposal.votingEnds && !proposal.executed;
  };

  if (loading) {
    return (
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
        <CardHeader>
          <CardTitle className='text-white flex items-center'>
            <Vote className='w-5 h-5 mr-2' />
            Vote Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-gray-300'>Loading voting proposals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show enable voting option if voting is disabled and user is owner
  if (votingEnabled === false) {
    return (
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
        <CardHeader>
          <CardTitle className='text-white flex items-center'>
            <Vote className='w-5 h-5 mr-2' />
            Democratic Voting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Vote className='w-12 h-12 text-yellow-400 mx-auto mb-4' />
            <p className='text-yellow-300 mb-4 font-medium'>
              Voting Not Enabled
            </p>
            <p className='text-gray-300 text-sm mb-6'>
              Democratic voting is not enabled for this circle yet.
              {isOwner
                ? " As the circle owner, you can enable it now."
                : " Ask the circle owner to enable voting."}
            </p>
            <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6'>
              <p className='text-blue-200 text-sm'>
                💡 <strong>Note:</strong> New recurring circles created now
                automatically have voting enabled. This circle may have been
                created before auto-voting was implemented.
              </p>
            </div>
            {isOwner && (
              <Button
                onClick={enableVoting}
                disabled={enablingVoting}
                className='bg-yellow-500 hover:bg-yellow-600 text-black font-medium'
              >
                {enablingVoting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2'></div>
                    Enabling Voting...
                  </>
                ) : (
                  <>
                    <Vote className='w-4 h-4 mr-2' />
                    Enable Democratic Voting
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
        <CardHeader>
          <CardTitle className='text-white flex items-center'>
            <Vote className='w-5 h-5 mr-2' />
            Vote Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Vote className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-300 mb-2'>No voting proposals yet</p>
            <p className='text-gray-400 text-sm'>
              Create a withdrawal proposal to start democratic voting
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in'>
      <CardHeader>
        <CardTitle className='text-white flex items-center'>
          <Vote className='w-5 h-5 mr-2' />
          Democratic Voting ({proposals.length} proposals)
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {proposals.map((proposal) => {
          const voteProgress = getVoteProgress(proposal);
          const isActive = isVotingActive(proposal);
          const canExec = canExecute(proposal);
          const totalVotes = proposal.votesFor + proposal.votesAgainst;

          return (
            <div
              key={proposal.id}
              className='p-6 bg-white/5 rounded-xl border border-white/10 space-y-4 hover-lift transition-all duration-300'
            >
              {/* Proposal Header */}
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    {proposal.description}
                  </h3>
                  <div className='flex items-center space-x-4 text-sm text-gray-300'>
                    <span className='flex items-center'>
                      <Target className='w-4 h-4 mr-1' />
                      {formatBTCAmount(proposal.amount)}
                    </span>
                    <span className='flex items-center'>
                      <Users className='w-4 h-4 mr-1' />
                      To: {formatAddress(proposal.recipient)}
                    </span>
                    <span className='flex items-center'>
                      <Calendar className='w-4 h-4 mr-1' />
                      {formatTimeRemaining(proposal.votingEnds)}
                    </span>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  {proposal.executed && (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        proposal.passed
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {proposal.passed ? (
                        <>
                          <CheckCircle className='w-3 h-3 mr-1' />
                          Passed
                        </>
                      ) : (
                        <>
                          <XCircle className='w-3 h-3 mr-1' />
                          Failed
                        </>
                      )}
                    </span>
                  )}

                  {isActive && (
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30'>
                      <Clock className='w-3 h-3 mr-1' />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Vote Progress Bar */}
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-green-400'>
                    FOR: {proposal.votesFor} votes
                  </span>
                  <span className='text-red-400'>
                    AGAINST: {proposal.votesAgainst} votes
                  </span>
                </div>
                <div className='relative'>
                  <Progress value={voteProgress} className='h-3' />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-xs text-white font-semibold'>
                      {totalVotes > 0
                        ? `${voteProgress.toFixed(1)}% FOR`
                        : "No votes yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-between'>
                <div className='text-xs text-gray-400'>
                  Proposal #{proposal.id} • By{" "}
                  {formatAddress(proposal.proposer)}
                </div>

                {isActive && (
                  <div className='flex space-x-2'>
                    <Button
                      size='sm'
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={votingOnProposal === proposal.id}
                      className='bg-green-600 hover:bg-green-700 text-white'
                    >
                      {votingOnProposal === proposal.id ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                      ) : (
                        <>
                          <CheckCircle className='w-4 h-4 mr-1' />
                          Vote FOR
                        </>
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={votingOnProposal === proposal.id}
                      className='border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
                    >
                      {votingOnProposal === proposal.id ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current' />
                      ) : (
                        <>
                          <XCircle className='w-4 h-4 mr-1' />
                          Vote AGAINST
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {canExec && (
                  <Button
                    size='sm'
                    onClick={() => handleExecuteProposal(proposal.id)}
                    disabled={executingProposal === proposal.id}
                    className='bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                  >
                    {executingProposal === proposal.id ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                    ) : (
                      <>
                        <Play className='w-4 h-4 mr-1' />
                        Execute Proposal
                      </>
                    )}
                  </Button>
                )}

                {proposal.executed && proposal.passed && (
                  <div className='flex items-center text-green-400'>
                    <Trophy className='w-4 h-4 mr-1' />
                    <span className='text-sm'>Funds transferred!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
