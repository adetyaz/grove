## 🌳 Grove (Growing wealth together)

Note that some details are subject to change as the project progresses and the team needs to accomodate for discoveries and changes.

### **Core Vision**

**A Bitcoin-native platform for collaborative savings** where groups can:

1. Pool funds toward shared goals
2. Gamify saving through achievements
3. Secure funds with inheritance planning
4. Support each other through gifting

   _All settled on Bitcoin via Citrea's ZK-Rollup_

![alt text](<public/assets/images/project flow.svg>)

## ✨ Features

### 🌀 Collaborative Circles

Create goal-based savings pools (e.g., "Jaime's College Fund", "Janet's Retirement Gift")

Set flexible rules:

`contribution: 50k sats/week`  
`withdrawal: goal_reached OR 70%_vote`  
`penalties: streak_reset`

### 🎮 Gamification

- Streaks: Consecutive payment counters
- Achievements: ZK-NFTs for milestones
- Leaderboards: Top gifters earn SBTs

### ☁️ Multi-Channel Notifications

- Telegram bot (/contribute)
- WhatsApp/SMS for critical alerts

### 🌉 Cross-Chain by Hyperlane

- Deposit from Ethereum/Polygon → auto-convert to BTC
- Yield strategies on other chains

### ⚡ Social Integrations

- Share achievements to Warpcaster/Nostri
- Farcaster frame for circle stats

### **Detailed Feature Breakdown**

#### **1. Payment Systems**

| Type               | Mechanism                                                                                                              | Gamification                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Recurring**      | - Auto-deduct at set intervals <br>- Grace period configurable <br>- Slashing options (streak reset/fee)<br>- Upcoming | - Streak counters <br>- Monthly consistency NFTs <br>- Circle-specific leaderboards |
| **One-Time Gifts** | - Manual "Send Gift" flow <br>- Message attachment <br>- Circle/global limits                                          | - Generosity leaderboards <br>- Milestone SBTs <br>- Social sharing triggers        |

**Gifting Milestone SBTs:**

![alt text](public/assets/images/paysys.svg)

### **2. Gamification Engine**

**Achievement Types:**

- `STREAK_BASED`: "3-Month Stacker", "Perfect Year"
- `GOAL_BASED`: "Goal Crusher", "Halfway Hero"
- `GIFT_BASED`: "Seed Planter", "Bitcoin Benefactor"
- `LEADERBOARD`: "Top 10% Global Gifter"

**Leaderboard Rewards:**

| Rank   | Reward                          |
| ------ | ------------------------------- |
| 🥇 1st | Gold Gifter SBT + Profile Badge |
| 🥈 2nd | Silver Supporter SBT            |
| 🥉 3rd | Bronze Backer SBT               |
| 4-100  | "Generous Soul" Profile Frame   |

### **3. Inheritance Vault**

**Activation Triggers:**

![alt text](<public/assets/images/claim vault condition.svg>)

**Inheritance Vault Alerts with Hyperlane**

![alt text](public/assets/images/hyperlane.svg)

- Gas fee forwarding for claim initiation
- Chain-agnostic beneficiary notifications
- ZK-proofs for private claim verification

**Beneficiary Management:**

- Add/remove beneficiaries
- Set percentage allocations
- Configure trigger preferences
- Emergency contact settings

#### **4. Security Architecture**

**Citrea Advantages:**

- All transactions settled on Bitcoin L1
- ZK-proofs for private operations:
  - Non-custodial funds management
  - Soulbound tokens (non-transferable)

### **User Flow Walkthroughs**

#### **Creating a Circle**

1. **Social login** via Google/Email
2. **Set parameters**:

   - Goal amount (BTC/sats)
   - Contribution schedule
   - Withdrawal rules (goal/time/vote)
   - Penalty preferences

3. **Invite members** via email/Nostr
4. **Fund initialization** with first contribution

#### **Sending a Gift**

1. Navigate to Fund type
2. Select "Create Gift"
3. Choose amount (with limit warnings)
4. Add personal message
5. Confirm → Triggers:
   - Leaderboard update
   - Achievement check
   - Optional social share

#### **Claiming Inheritance**

1. **Automatic detection**: 1-year inactivity
2. **Beneficiary flow**:
   - Submit claim request
   - Provide verification docs
   - Members confirm
3. **Funds distribution**:
   - Proportional to allocations
   - Onchain transparency

### **Core Architecture**

| Layer           | Role              | Grove Benefit                     |
| --------------- | ----------------- | --------------------------------- |
| **Citrea**      | Bitcoin execution | Trustless sats environment        |
| **Dynamic.xyz** | Web2→Web3 bridge  | 1-click user onboarding           |
| **Hyperlane**   | Interchain comms  | Multi-chain assets → Bitcoin sats |

### **Contract Architecture**

![alt text](<public/assets/images/core contracts.svg>)

#### Citrea's Role

Base Layer:
-All contracts deploy to Citrea's ZK-Rollup

- Every transaction settles on Bitcoin L1 in 10-20 mins

#### Integrations

Dynamic → Citrea:

- Users sign up via Google/email
- Dynamic auto-generates Citrea-compatible EOA
- First 5 transactions gas-sponsored

Hyperlane → Citrea:

- For Deposits
- For Alerts: Cross-chain notifications trigger Citrea inheritance checks

### ⚙️ Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Blockchain       | Citrea ZK-Rollup (Bitcoin-settled) |
| Smart Contracts  | Solidity + OpenZeppelin            |
| Identity         | Dynamic.xyz, Nostr                 |
| Interoperability | Hyperlane                          |
| Notifications    | Twilio, Telegram Bot, Nostr        |

### Core Smart Contracts

#### CircleManager.sol

- Creates/manages savings circles
- Handles member invitations/permissions
- Stores circle rules (contributions, penalties)

#### SatVault.sol

- Manages sats treasuries
- Processes recurring payments
- Enforces withdrawal conditions

#### GiftEngine.sol

- Handles one-time sats gifts
- Tracks generosity leaderboards
- Mints SBTs for top gifters

#### AchievementNFT.sol

- Mints ZK-proof NFTs for milestones
- Manages SBTs for streaks/reputation
- Generates Bitcoin-settled metadata

#### InheritanceModule.sol

- Stores beneficiary plans
- Executes dead man's switch
- Handles multi-sig claims

### Integration Contract

#### HyperlaneReceiver.sol

- Converts cross-chain assets → sats
- Processes Hyperlane messages
- Manages yield strategy deployments

### **Monetization Model**

- **0.5% fee** on successful withdrawals
- **Premium features**:
  - Advanced inheritance options
  - Custom achievement designs

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
