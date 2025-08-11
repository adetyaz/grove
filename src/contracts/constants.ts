export const SATVAULT_CONTRACT_ADDRESS =
  "0x4C6Caf189d5dbF9fb201556dDcC027F0562598F6";
export const GROVE_CONTRACT_ADDRESS =
  "0xd6f967aCcf922dECf0d293625223F63b23055d15";
export const GIFTENGINE_CONTRACT_ADDRESS =
  "0xB1F7c95d4B9dE383171b931f897E443Ff0339d81";
export const ACHIEVEMENTNFT_CONTRACT_ADDRESS =
  "0x30325a1fF2361F72059191aD4Cb97599442B3247";
export const GROVE_ACHIEVEMENTS_CONTRACT_ADDRESS =
  "0x33f085b99AA6219CE6eE3174FdB3191B0e29B738";
export const INHERITANCEMODULE_CONTRACT_ADDRESS =
  "0xf40dfDb2658A8027c7E5769C5f2E721130559995";

import SATVAULT_ABI from "@/contracts/ABIs/SatVault.json";
import GROVE_ABI from "@/contracts/ABIs/Grove.json";
import GIFTENGINE_ABI from "@/contracts/ABIs/GiftEngine.json";
import ACHIEVEMENTNFT_ABI from "@/contracts/ABIs/AchievementNFT.json";
import GROVE_ACHIEVEMENTS_ABI from "@/contracts/ABIs/GroveAchievements.json";
import INHERITANCEMODULE_ABI from "@/contracts/ABIs/InheritanceModule.json";

export {
  SATVAULT_ABI,
  GROVE_ABI,
  GIFTENGINE_ABI,
  ACHIEVEMENTNFT_ABI,
  GROVE_ACHIEVEMENTS_ABI,
  INHERITANCEMODULE_ABI,
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
