"use client";

import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useReadContract, useWriteContract } from "wagmi";
import {
  VOTING_CONTRACT_ADDRESS,
  VOTING_ABI,
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
} from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groveToast } from "@/lib/toast";
import { formatBtcAmount } from "@/lib/btc-conversion";
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  MessageSquare,
  Plus,
  Vote,
  Calendar,
} from "lucide-react";

interface VotingProps {
  circleId: string;
  onChainId: number;
  isOwner: boolean;
  onRefresh?: () => void;
}

interface Proposal {
  id: number;
  circleId: number;
  proposer: string;
  recipient: string;
  amount: bigint;
  description: string;
  votesFor: number;
  votesAgainst: number;
  votingEnds: number;
  executed: boolean;
  passed: boolean;
  userVoted: boolean;
  userChoice: boolean;
}

export default function VotingPanel({
  circleId,
  onChainId,
  isOwner,
  onRefresh,
}: VotingProps) {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const { writeContractAsync } = useWriteContract();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  // Check if voting is enabled for this circle
  const { data: votingConfig, refetch: refetchVotingConfig } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getVotingConfig",
    args: onChainId ? [BigInt(onChainId)] : undefined,
    query: {
      enabled: !!(onChainId && onChainId > 0),
    },
  });

  // Get circle proposals
  const { data: proposalIds, refetch: refetchProposals } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getCircleProposals",
    args: onChainId ? [BigInt(onChainId)] : undefined,
    query: {
      enabled: !!(onChainId && onChainId > 0),
    },
  });

  const isVotingEnabled = votingConfig ? (votingConfig[0] as boolean) : false;

  // Enable voting for this circle (owner only)
  const enableVoting = async () => {
    if (!address || !isOwner) return;

    try {
      groveToast.info("Enabling voting for circle...");

      const txHash = await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: "enableVotingForCircle",
        args: [BigInt(onChainId)],
      });

      groveToast.transactionPending(txHash);

      // Wait and refresh
      setTimeout(() => {
        refetchVotingConfig();
        groveToast.transactionSuccess(txHash);
      }, 5000);
    } catch (error: any) {
      groveToast.error(`Failed to enable voting: ${error.message}`);
    }
  };

  // Fetch proposal details
  useEffect(() => {
    const fetchProposalDetails = async () => {
      if (
        !proposalIds ||
        !Array.isArray(proposalIds) ||
        proposalIds.length === 0
      ) {
        setProposals([]);
        setLoading(false);
        return;
      }

      try {
        const proposalDetails = await Promise.all(
          (proposalIds as bigint[]).map(async (proposalId) => {
            const id = Number(proposalId);

            // Get basic proposal info
            const [basicInfo, votingInfo, description, userVote] =
              await Promise.all([
                fetch(`/api/voting/proposals/${id}/basic`).then((r) =>
                  r.json()
                ),
                fetch(`/api/voting/proposals/${id}/voting`).then((r) =>
                  r.json()
                ),
                fetch(`/api/voting/proposals/${id}/description`).then((r) =>
                  r.json()
                ),
                address
                  ? fetch(
                      `/api/voting/proposals/${id}/user-vote?voter=${address}`
                    ).then((r) => r.json())
                  : { voted: false, choice: false },
              ]);

            return {
              id,
              circleId: basicInfo.circleId,
              proposer: basicInfo.proposer,
              recipient: basicInfo.recipient,
              amount: BigInt(basicInfo.amount),
              description: description.description,
              votesFor: votingInfo.votesFor,
              votesAgainst: votingInfo.votesAgainst,
              votingEnds: votingInfo.votingEnds,
              executed: votingInfo.executed,
              passed: votingInfo.passed,
              userVoted: userVote.voted,
              userChoice: userVote.choice,
            };
          })
        );

        setProposals(proposalDetails);
      } catch (error) {
        console.error("Error fetching proposal details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposalDetails();
  }, [proposalIds, address]);

  const vote = async (proposalId: number, support: boolean) => {
    if (!address) return;

    try {
      groveToast.info(`Voting ${support ? "FOR" : "AGAINST"} proposal...`);

      const txHash = await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: "voteOnProposal",
        args: [BigInt(proposalId), support],
      });

      groveToast.transactionPending(txHash);

      // Update local state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                userVoted: true,
                userChoice: support,
                votesFor: p.votesFor + (support ? 1 : 0),
                votesAgainst: p.votesAgainst + (support ? 0 : 1),
              }
            : p
        )
      );

      setTimeout(() => {
        refetchProposals();
        groveToast.transactionSuccess(txHash);
      }, 5000);
    } catch (error: any) {
      groveToast.error(`Failed to vote: ${error.message}`);
    }
  };

  const executeProposal = async (proposalId: number) => {
    if (!address) return;

    try {
      groveToast.info("Executing proposal...");

      const txHash = await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: "executeProposal",
        args: [BigInt(proposalId)],
      });

      groveToast.transactionPending(txHash);

      setTimeout(() => {
        refetchProposals();
        onRefresh?.();
        groveToast.transactionSuccess(txHash);
      }, 5000);
    } catch (error: any) {
      groveToast.error(`Failed to execute proposal: ${error.message}`);
    }
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = Math.floor(Date.now() / 1000);

    if (proposal.executed) {
      return {
        status: proposal.passed ? "passed" : "failed",
        label: proposal.passed ? "Passed" : "Failed",
        icon: proposal.passed ? (
          <CheckCircle className='w-4 h-4' />
        ) : (
          <XCircle className='w-4 h-4' />
        ),
        color: proposal.passed ? "text-green-400" : "text-red-400",
      };
    }

    if (now > proposal.votingEnds) {
      return {
        status: "ended",
        label: "Voting Ended",
        icon: <Clock className='w-4 h-4' />,
        color: "text-orange-400",
      };
    }

    return {
      status: "active",
      label: "Active",
      icon: <Vote className='w-4 h-4' />,
      color: "text-blue-400",
    };
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return "Voting ended";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (!isVotingEnabled && isOwner) {
    return (
      <div className='space-y-6'>
        <Card className='bg-white/5 border-white/10'>
          <CardHeader>
            <CardTitle className='text-white flex items-center'>
              <Vote className='w-5 h-5 mr-2' />
              Voting System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Vote className='w-8 h-8 text-blue-400' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                Enable Democratic Voting
              </h3>
              <p className='text-gray-300 mb-6'>
                Allow circle members to vote on fund withdrawals and other
                important decisions.
              </p>
              <Button
                onClick={enableVoting}
                className='bg-blue-600 hover:bg-blue-700'
              >
                Enable Voting for this Circle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVotingEnabled) {
    return (
      <div className='space-y-6'>
        <Card className='bg-white/5 border-white/10'>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Vote className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                Voting Not Enabled
              </h3>
              <p className='text-gray-300'>
                The circle owner has not enabled voting for this circle yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Voting Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white flex items-center'>
            <Vote className='w-6 h-6 mr-2' />
            Proposals & Voting
          </h2>
          <p className='text-gray-300'>
            Democratic decision making for circle funds
          </p>
        </div>
        <Button
          onClick={() => setShowCreateProposal(true)}
          className='bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create Proposal
        </Button>
      </div>

      {/* Voting Configuration */}
      {votingConfig && (
        <Card className='bg-white/5 border-white/10'>
          <CardHeader>
            <CardTitle className='text-white text-lg'>
              Voting Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-400 block'>Voting Period</span>
                <span className='text-white font-mono'>
                  {Math.floor(Number(votingConfig[1]) / 86400)} days
                </span>
              </div>
              <div>
                <span className='text-gray-400 block'>Quorum Required</span>
                <span className='text-white font-mono'>
                  {Number(votingConfig[2])}%
                </span>
              </div>
              <div>
                <span className='text-gray-400 block'>Approval Required</span>
                <span className='text-white font-mono'>
                  {Number(votingConfig[3])}%
                </span>
              </div>
              <div>
                <span className='text-gray-400 block'>Minimum Amount</span>
                <span className='text-white font-mono'>
                  {formatBtcAmount(votingConfig[4].toString())} BTC
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposals List */}
      {loading ? (
        <Card className='bg-white/5 border-white/10'>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4'></div>
              <p className='text-gray-300'>Loading proposals...</p>
            </div>
          </CardContent>
        </Card>
      ) : proposals.length === 0 ? (
        <Card className='bg-white/5 border-white/10'>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MessageSquare className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>
                No Proposals Yet
              </h3>
              <p className='text-gray-300'>
                Be the first to create a proposal for this circle.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {proposals.map((proposal) => {
            const status = getProposalStatus(proposal);
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            const forPercentage =
              totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
            const againstPercentage =
              totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
            const canExecute = status.status === "ended" && !proposal.executed;

            return (
              <Card key={proposal.id} className='bg-white/5 border-white/10'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <span className='text-gray-400 text-sm'>
                        #{proposal.id}
                      </span>
                      <div
                        className={`flex items-center space-x-1 ${status.color}`}
                      >
                        {status.icon}
                        <span className='text-sm font-medium'>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className='text-right text-sm text-gray-300'>
                      <Calendar className='w-4 h-4 inline mr-1' />
                      {formatTimeRemaining(proposal.votingEnds)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Proposal Details */}
                  <div>
                    <h4 className='text-white font-semibold mb-2'>
                      Description
                    </h4>
                    <p className='text-gray-300 text-sm'>
                      {proposal.description}
                    </p>
                  </div>

                  {/* Amount and Recipient */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <span className='text-gray-400 text-sm block'>
                        Amount Requested
                      </span>
                      <div className='flex items-center text-white'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        {formatBtcAmount(proposal.amount.toString())} BTC
                      </div>
                    </div>
                    <div>
                      <span className='text-gray-400 text-sm block'>
                        Recipient
                      </span>
                      <span className='text-white font-mono text-sm'>
                        {proposal.recipient.slice(0, 6)}...
                        {proposal.recipient.slice(-4)}
                      </span>
                    </div>
                  </div>

                  {/* Voting Results */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-gray-400 text-sm'>
                        Voting Results
                      </span>
                      <span className='text-gray-300 text-sm'>
                        <Users className='w-4 h-4 inline mr-1' />
                        {totalVotes} votes cast
                      </span>
                    </div>

                    <div className='space-y-2'>
                      {/* For votes */}
                      <div className='flex items-center space-x-3'>
                        <span className='text-green-400 text-sm w-12'>FOR</span>
                        <div className='flex-1 bg-gray-700 rounded-full h-2'>
                          <div
                            className='bg-green-500 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${forPercentage}%` }}
                          />
                        </div>
                        <span className='text-white text-sm w-16 text-right'>
                          {proposal.votesFor} ({forPercentage.toFixed(1)}%)
                        </span>
                      </div>

                      {/* Against votes */}
                      <div className='flex items-center space-x-3'>
                        <span className='text-red-400 text-sm w-12'>
                          AGAINST
                        </span>
                        <div className='flex-1 bg-gray-700 rounded-full h-2'>
                          <div
                            className='bg-red-500 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${againstPercentage}%` }}
                          />
                        </div>
                        <span className='text-white text-sm w-16 text-right'>
                          {proposal.votesAgainst} (
                          {againstPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Actions */}
                  <div className='flex items-center space-x-3 pt-4 border-t border-white/10'>
                    {proposal.userVoted ? (
                      <div className='flex items-center text-sm'>
                        <CheckCircle className='w-4 h-4 mr-2 text-green-400' />
                        <span className='text-gray-300'>
                          You voted {proposal.userChoice ? "FOR" : "AGAINST"}
                        </span>
                      </div>
                    ) : status.status === "active" ? (
                      <div className='flex space-x-2'>
                        <Button
                          onClick={() => vote(proposal.id, true)}
                          size='sm'
                          className='bg-green-600 hover:bg-green-700'
                        >
                          Vote FOR
                        </Button>
                        <Button
                          onClick={() => vote(proposal.id, false)}
                          size='sm'
                          variant='outline'
                          className='border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
                        >
                          Vote AGAINST
                        </Button>
                      </div>
                    ) : null}

                    {canExecute && (
                      <Button
                        onClick={() => executeProposal(proposal.id)}
                        size='sm'
                        className='bg-blue-600 hover:bg-blue-700 ml-auto'
                      >
                        Execute Proposal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <CreateProposalModal
          circleId={onChainId}
          onClose={() => setShowCreateProposal(false)}
          onSuccess={() => {
            setShowCreateProposal(false);
            refetchProposals();
          }}
        />
      )}
    </div>
  );
}

// Create Proposal Modal Component (simplified for now)
function CreateProposalModal({
  circleId,
  onClose,
  onSuccess,
}: {
  circleId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { primaryWallet } = useDynamicConnection();
  const { writeContractAsync } = useWriteContract();

  const createProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!primaryWallet?.address || !recipient || !amount || !description) {
      groveToast.error("Please fill in all fields");
      return;
    }

    try {
      groveToast.info("Creating proposal...");

      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const txHash = await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: "createProposal",
        args: [
          BigInt(circleId),
          recipient as `0x${string}`,
          amountWei,
          description,
        ],
      });

      groveToast.transactionPending(txHash);

      setTimeout(() => {
        onSuccess();
        groveToast.transactionSuccess(txHash);
      }, 5000);
    } catch (error: any) {
      groveToast.error(`Failed to create proposal: ${error.message}`);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md w-full'>
        <h3 className='text-xl font-bold text-white mb-4'>Create Proposal</h3>

        <form onSubmit={createProposal} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Recipient Address
            </label>
            <input
              type='text'
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='0x...'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Amount (BTC)
            </label>
            <input
              type='number'
              step='0.0001'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='0.001'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none'
              placeholder='Describe what this proposal is for...'
              required
            />
          </div>

          <div className='flex space-x-3'>
            <Button
              type='button'
              onClick={onClose}
              variant='outline'
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-blue-600 hover:bg-blue-700'
            >
              Create Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
