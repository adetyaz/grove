import { type Address } from "viem";
import GroveABI from "./grove.json";

// Grove Contract Configuration
export const GROVE_CONTRACT_ADDRESS: Address =
  "0xdcEcd3Cf494069f9FB5614e05Efa4Fa45C4f949c";
export const GROVE_ABI = GroveABI;

// Citrea Network Configuration
export const CITREA_TESTNET = {
  id: 5115, // Citrea testnet chain ID
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

// PaymentType enum mapping (from contract)
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
