// Grove Platform - Contract Addresses
// Deployment Date: August 22, 2025
// Network: Citrea Testnet

export const TREASURY_CONTRACT_ADDRESS =
  "0xcEdE89F7eA6095e575BFA473774577a074aC73bC";
export const GROVE_CONTRACT_ADDRESS =
  "0x37Ff2D9A3d1f0a2c421A60F000676d5f90C67b5e";
export const VOTING_CONTRACT_ADDRESS =
  "0x958698Ef5e9F8B1f926E8aE93AEF0d03DDb28704";
export const INHERITANCE_CONTRACT_ADDRESS =
  "0xFeb5a4515436d4F411B62b615D6DF333B34AF6c4";
export const GIFTS_CONTRACT_ADDRESS =
  "0xC02594Bc750db60A05095bF312C7C85F8cf16837";
export const ACHIEVEMENTS_CONTRACT_ADDRESS =
  "0x1B92C1F5DB409C8E3E37E5132de3fAF11d73C562";

// Contract ABIs
import TREASURY_ABI from "../contracts/abis/Treasury.json";
import GROVE_ABI from "../contracts/abis/Grove.json";
import VOTING_ABI from "../contracts/abis/Voting.json";
import INHERITANCE_ABI from "../contracts/abis/Inheritance.json";
import GIFTS_ABI from "../contracts/abis/Gifts.json";
import ACHIEVEMENTS_ABI from "../contracts/abis/Achievements.json";

export {
  TREASURY_ABI,
  GROVE_ABI,
  VOTING_ABI,
  INHERITANCE_ABI,
  GIFTS_ABI,
  ACHIEVEMENTS_ABI,
};

import { type Address } from "viem";

// Citrea Network Configuration
export const CITREA_TESTNET = {
  id: 5115,
  name: "Citrea Testnet",
  network: "citrea-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcoin",
    symbol: "BTC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.citrea.xyz"],
    },
    public: {
      http: ["https://rpc.testnet.citrea.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Citrea Testnet Explorer",
      url: "https://explorer.testnet.citrea.xyz",
    },
  },
  testnet: true,
} as const;

// Contract Function Names
export const CONTRACT_FUNCTIONS = {
  CREATE_CIRCLE: "createCircle",
  ADD_MEMBER: "addMember",
  CONTRIBUTE: "contribute",
  CLAIM_INHERITANCE: "claimInheritance",
  GET_CIRCLE: "getCircle",
  GET_USER_CIRCLES: "getUserCircles",
  GET_CIRCLE_MEMBERS: "getCircleMembers",
  SET_INHERITANCE_BENEFICIARY: "setInheritanceBeneficiary",
} as const;

// Contract Events
export const CONTRACT_EVENTS = {
  CIRCLE_CREATED: "CircleCreated",
  MEMBER_ADDED: "MemberAdded",
  CONTRIBUTION_MADE: "ContributionMade",
  INHERITANCE_CLAIMED: "InheritanceClaimed",
} as const;

export enum PaymentType {
  OneTime = 0,
  Recurring = 1,
}

// Circle status types
export interface Circle {
  id: number;
  owner: Address;
  name: string;
  description: string;
  targetAmount: bigint;
  currentAmount: bigint;
  paymentType: PaymentType;
  fixedAmount: bigint;
  deadline: bigint;
  isActive: boolean;
  memberCount: number;
  members: Address[];
}

// Contract interaction types
export interface CreateCircleParams {
  name: string;
  description: string;
  targetAmount: bigint;
  paymentType: PaymentType;
  fixedAmount?: bigint;
  deadline: bigint;
}

export interface AddMemberParams {
  circleId: number;
  newMember: Address;
}

export interface ContributeParams {
  circleId: number;
  amount: bigint;
}
