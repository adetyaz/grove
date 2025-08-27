"use client";

import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Vote,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import { VOTING_CONTRACT_ADDRESS, VOTING_ABI } from "@/lib/contracts";
import { groveToast } from "@/lib/toast";

export default function VotingPage() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const [selectedTab, setSelectedTab] = useState("active");

  const { writeContractAsync } = useWriteContract();

  // Get active proposals
  const { data: activeProposals = [] } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getActiveProposals",
    args: [],
  });

  const handleVote = async (proposalId: bigint, support: boolean) => {
    if (!address) return;

    try {
      groveToast.info(`Casting ${support ? "YES" : "NO"} vote...`);

      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: "vote",
        args: [proposalId, support],
      });

      groveToast.success(`Successfully voted ${support ? "YES" : "NO"}!`);
    } catch (error: any) {
      groveToast.error(`Vote failed: ${error.message}`);
    }
  };

  const handleExecuteProposal = async (proposalId: bigint) => {
    if (!address) return;

    try {
      groveToast.info("Executing proposal...");

      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: "executeProposal",
        args: [proposalId],
      });

      groveToast.success("Proposal executed successfully!");
    } catch (error: any) {
      groveToast.error(`Execution failed: ${error.message}`);
    }
  };

  const getProposalStatus = (proposal: any) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const endTime = proposal.endTime;

    if (proposal.executed) {
      return {
        status: "Executed",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    }

    if (now > endTime) {
      return {
        status: "Ended",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    }

    return {
      status: "Active",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
  };

  const formatTimeRemaining = (endTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const remaining = endTime - now;

    if (remaining <= 0) return "Ended";

    const days = Number(remaining) / (24 * 60 * 60);
    const hours = (Number(remaining) % (24 * 60 * 60)) / (60 * 60);

    if (days >= 1) return `${Math.floor(days)}d ${Math.floor(hours)}h`;
    if (hours >= 1) return `${Math.floor(hours)}h`;

    const minutes = (Number(remaining) % (60 * 60)) / 60;
    return `${Math.floor(minutes)}m`;
  };

  const ProposalCard = ({ proposal }: { proposal: any }) => {
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    const yesPercentage =
      totalVotes > 0
        ? Number((proposal.yesVotes * BigInt(100)) / totalVotes)
        : 0;
    const noPercentage =
      totalVotes > 0
        ? Number((proposal.noVotes * BigInt(100)) / totalVotes)
        : 0;
    const { status, color } = getProposalStatus(proposal);
    const timeRemaining = formatTimeRemaining(proposal.endTime);
    const canExecute =
      proposal.yesVotes > proposal.noVotes &&
      !proposal.executed &&
      BigInt(Math.floor(Date.now() / 1000)) > proposal.endTime;

    return (
      <Card className='bg-slate-800/50 border-slate-700'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-white text-lg'>
                Proposal #{Number(proposal.id)}
              </CardTitle>
              <div className='flex items-center space-x-3'>
                <Badge className={color}>{status}</Badge>
                <div className='flex items-center space-x-1 text-slate-400'>
                  <Clock className='w-4 h-4' />
                  <span className='text-sm'>{timeRemaining}</span>
                </div>
              </div>
            </div>
            <Vote className='w-6 h-6 text-purple-500' />
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <p className='text-white mb-2'>Description</p>
            <p className='text-slate-300 text-sm leading-relaxed'>
              Circle governance proposal for important decisions and changes.
            </p>
          </div>

          <div className='flex items-center space-x-4 text-sm text-slate-400'>
            <div className='flex items-center space-x-1'>
              <User className='w-4 h-4' />
              <span>
                Proposer:{" "}
                {`${proposal.proposer.slice(0, 6)}...${proposal.proposer.slice(
                  -4
                )}`}
              </span>
            </div>
            <div className='flex items-center space-x-1'>
              <Users className='w-4 h-4' />
              <span>Circle #{Number(proposal.circleId)}</span>
            </div>
          </div>

          {/* Voting Progress */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-white font-medium'>Voting Results</span>
              <span className='text-slate-400 text-sm'>
                {Number(totalVotes)} total votes
              </span>
            </div>

            <div className='space-y-3'>
              {/* YES votes */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='w-4 h-4 text-green-500' />
                    <span className='text-white'>YES</span>
                  </div>
                  <span className='text-green-400 font-medium'>
                    {yesPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className='w-full bg-slate-700 rounded-full h-2'>
                  <div
                    className='bg-green-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${yesPercentage}%` }}
                  />
                </div>
                <p className='text-sm text-slate-400'>
                  {Number(proposal.yesVotes)} votes
                </p>
              </div>

              {/* NO votes */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <XCircle className='w-4 h-4 text-red-500' />
                    <span className='text-white'>NO</span>
                  </div>
                  <span className='text-red-400 font-medium'>
                    {noPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className='w-full bg-slate-700 rounded-full h-2'>
                  <div
                    className='bg-red-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${noPercentage}%` }}
                  />
                </div>
                <p className='text-sm text-slate-400'>
                  {Number(proposal.noVotes)} votes
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {status === "Active" && (
            <div className='flex space-x-3'>
              <Button
                onClick={() => handleVote(proposal.id, true)}
                className='flex-1 bg-green-600 hover:bg-green-700 text-white'
              >
                <CheckCircle className='w-4 h-4 mr-2' />
                Vote YES
              </Button>
              <Button
                onClick={() => handleVote(proposal.id, false)}
                variant='outline'
                className='flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
              >
                <XCircle className='w-4 h-4 mr-2' />
                Vote NO
              </Button>
            </div>
          )}

          {canExecute && (
            <Button
              onClick={() => handleExecuteProposal(proposal.id)}
              className='w-full bg-purple-600 hover:bg-purple-700'
            >
              <AlertCircle className='w-4 h-4 mr-2' />
              Execute Proposal
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <Vote className='w-16 h-16 text-slate-600 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-4'>
            Connect Your Wallet
          </h2>
          <p className='text-slate-400'>
            Please connect your wallet to participate in voting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Governance</h1>
        <p className='text-slate-400'>
          Participate in circle governance and shape the future together
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className='space-y-8'
      >
        <TabsList className='grid w-full grid-cols-3 bg-slate-800/50'>
          <TabsTrigger
            value='active'
            className='data-[state=active]:bg-slate-700'
          >
            Active Proposals
          </TabsTrigger>
          <TabsTrigger
            value='history'
            className='data-[state=active]:bg-slate-700'
          >
            Voting History
          </TabsTrigger>
          <TabsTrigger
            value='create'
            className='data-[state=active]:bg-slate-700'
          >
            Create Proposal
          </TabsTrigger>
        </TabsList>

        <TabsContent value='active' className='space-y-6'>
          {(activeProposals as any[]).length === 0 ? (
            <Card className='bg-slate-800/50 border-slate-700'>
              <CardContent className='text-center py-12'>
                <Vote className='w-16 h-16 text-slate-600 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-white mb-2'>
                  No Active Proposals
                </h3>
                <p className='text-slate-400'>
                  There are currently no active proposals to vote on.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {(activeProposals as any[]).map(
                (proposal: any, index: number) => (
                  <ProposalCard key={index} proposal={proposal} />
                )
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value='history' className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardContent className='text-center py-12'>
              <Calendar className='w-16 h-16 text-slate-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Voting History
              </h3>
              <p className='text-slate-400'>
                Your voting history will appear here once you start
                participating.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='create' className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardContent className='text-center py-12'>
              <AlertCircle className='w-16 h-16 text-slate-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Create New Proposal
              </h3>
              <p className='text-slate-400 mb-6'>
                Proposal creation will be available soon. Stay tuned!
              </p>
              <Button disabled variant='outline'>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
