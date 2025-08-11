import { type Address, type Hash, parseEther } from "viem";
import { getPublicClient, getWalletClient } from "@/lib/clients";
import VOTING_MODULE_ABI from "@/contracts/ABIs/VotingModule.json";

// VotingModule contract address
export const VOTING_MODULE_ADDRESS =
  "0xfEBC5812B38Ad84A0048Dd88fD869fCf609BbA18" as Address;

export interface ProposalData {
  id: number;
  circleId: number;
  proposer: Address;
  recipient: Address; // Add recipient field
  amount: bigint;
  description: string;
  votesFor: number;
  votesAgainst: number;
  createdAt: number;
  votingEnds: number;
  executed: boolean;
  passed: boolean;
}

export interface VotingConfig {
  votingPeriod: number;
  quorumPercentage: number;
  approvalPercentage: number;
  enabled: boolean;
}

export class VotingModuleService {
  private publicClient = getPublicClient();

  /**
   * Enable voting for a circle (circle owner only)
   */
  async enableVoting(circleId: number, account: Address): Promise<Hash> {
    const walletClient = await getWalletClient();

    const { request } = await this.publicClient.simulateContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "enableVoting",
      args: [BigInt(circleId)],
      account,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Create a withdrawal proposal
   */
  async proposeWithdrawal(
    circleId: number,
    recipient: Address,
    amount: string,
    description: string,
    account: Address
  ): Promise<Hash> {
    const walletClient = await getWalletClient();
    const amountWei = parseEther(amount);

    const { request } = await this.publicClient.simulateContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "proposeWithdrawal",
      args: [BigInt(circleId), recipient, amountWei, description],
      account,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Vote on a proposal
   */
  async vote(
    proposalId: number,
    support: boolean,
    account: Address
  ): Promise<Hash> {
    const walletClient = await getWalletClient();

    const { request } = await this.publicClient.simulateContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "vote",
      args: [BigInt(proposalId), support],
      account,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Enable voting for a circle (circle owner only)
   */
  async enableVotingWithDelegation(
    circleId: number,
    account: Address
  ): Promise<Hash> {
    const walletClient = await getWalletClient();

    const { request } = await this.publicClient.simulateContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "enableVotingWithDelegation",
      args: [BigInt(circleId)],
      account,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Deposit escrow funds for democratic voting (circle owner only)
   */
  async depositEscrow(
    circleId: number,
    amount: string,
    account: Address
  ): Promise<Hash> {
    const walletClient = await getWalletClient();
    const amountWei = parseEther(amount);

    const { request } = await this.publicClient.simulateContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "depositEscrow",
      args: [BigInt(circleId)],
      account,
      value: amountWei,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Execute a proposal after voting ends
   */
  async executeProposal(proposalId: number, account: Address): Promise<Hash> {
    const walletClient = await getWalletClient();

    const { request } = await this.publicClient.simulateContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "executeProposal",
      args: [BigInt(proposalId)],
      account,
    });

    return await walletClient.writeContract(request);
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: number): Promise<ProposalData> {
    const result = await this.publicClient.readContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "getProposal",
      args: [BigInt(proposalId)],
    });

    const [
      id,
      circleId,
      proposer,
      recipient,
      amount,
      description,
      votesFor,
      votesAgainst,
      createdAt,
      votingEnds,
      executed,
      passed,
    ] = result as [
      bigint,
      bigint,
      Address,
      Address,
      bigint,
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean,
      boolean
    ];

    return {
      id: Number(id),
      circleId: Number(circleId),
      proposer,
      recipient,
      amount,
      description,
      votesFor: Number(votesFor),
      votesAgainst: Number(votesAgainst),
      createdAt: Number(createdAt),
      votingEnds: Number(votingEnds),
      executed,
      passed,
    };
  }

  /**
   * Get all proposals for a circle
   */
  async getCircleProposals(circleId: number): Promise<number[]> {
    const result = await this.publicClient.readContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "getCircleProposals",
      args: [BigInt(circleId)],
    });

    return (result as bigint[]).map((id) => Number(id));
  }

  /**
   * Check if address has voted on proposal
   */
  async hasVoted(proposalId: number, voter: Address): Promise<boolean> {
    return (await this.publicClient.readContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "hasVoted",
      args: [BigInt(proposalId), voter],
    })) as boolean;
  }

  /**
   * Get voting configuration for circle
   */
  async getVotingConfig(circleId: number): Promise<VotingConfig> {
    const result = await this.publicClient.readContract({
      address: VOTING_MODULE_ADDRESS,
      abi: VOTING_MODULE_ABI,
      functionName: "circleVotingConfig",
      args: [BigInt(circleId)],
    });

    const [votingPeriod, quorumPercentage, approvalPercentage, enabled] =
      result as [bigint, bigint, bigint, boolean];

    return {
      votingPeriod: Number(votingPeriod),
      quorumPercentage: Number(quorumPercentage),
      approvalPercentage: Number(approvalPercentage),
      enabled,
    };
  }
}

export const votingModuleService = new VotingModuleService();
