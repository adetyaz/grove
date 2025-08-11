import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { parseEther, type Address } from "viem";
import { BtcDisplay } from "./btc-display";
import { votingModuleService } from "@/lib/voting-module-contract";
import { groveContract } from "@/lib/grove-contract";
import { Vote, X } from "lucide-react";

interface CircleClaimFormProps {
  circleId: string;
  onChainId: number;
  circleName: string;
  currentAmount: string;
  targetAmount: string;
  deadline: string;
  paymentType?: string;
  isOwner: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function CircleClaimForm({
  circleId: _circleId, // eslint-disable-line @typescript-eslint/no-unused-vars
  onChainId,
  circleName,
  currentAmount,
  targetAmount,
  deadline,
  paymentType = "ONETIME",
  isOwner,
  onSuccess,
  onClose,
}: CircleClaimFormProps) {
  const [claimAmount, setClaimAmount] = useState("");
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  // Check claim conditions
  const currentAmountWei = BigInt(currentAmount);
  const targetAmountWei = BigInt(targetAmount);
  const deadlineTimestamp = Number(deadline) * 1000;
  const isDeadlineExpired =
    deadlineTimestamp > 0 && deadlineTimestamp < Date.now();
  const isGoalReached = currentAmountWei >= targetAmountWei;

  const canClaim = isGoalReached || isDeadlineExpired;
  const maxClaimableWei = currentAmountWei;

  // Check if this is a recurring circle
  const isRecurring = paymentType === "RECURRING";

  // Claim conditions display text
  const claimReason = isGoalReached
    ? "✅ Goal reached - funds can be claimed"
    : isDeadlineExpired
    ? "⏰ Deadline expired - available funds can be claimed"
    : "❌ Goal not reached and deadline not expired - cannot claim yet";

  // Mutation for claiming funds
  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Please connect your wallet to claim");
      }

      const amountWei = parseEther(claimAmount);

      if (amountWei <= BigInt(0)) {
        throw new Error("Amount must be greater than 0");
      }

      if (amountWei > maxClaimableWei) {
        throw new Error("Amount exceeds available funds");
      }

      // For recurring circles, create a voting proposal instead of direct claim
      if (isRecurring) {
        // Check if voting is enabled for this circle
        try {
          await votingModuleService.getCircleProposals(onChainId);
        } catch (error: any) {
          if (error.message?.includes("Voting not enabled")) {
            throw new Error(
              "Democratic voting is not enabled for this circle yet. This circle may have been created before auto-voting was implemented. As the circle owner, you can enable it in the Democratic Voting section below."
            );
          }
          throw error;
        }

        // Create a withdrawal proposal through voting
        const hash = await votingModuleService.proposeWithdrawal(
          onChainId,
          address as Address, // recipient (owner)
          claimAmount, // amount in string format
          `Withdrawal proposal for ${claimAmount} BTC from circle "${circleName}"`,
          address as Address // account
        );

        return {
          hash,
          amount: claimAmount,
          isVote: true,
        };
      } else {
        // Direct claim for one-time circles
        const hash = await groveContract.withdraw(
          { circleId: onChainId, amount: amountWei },
          address as Address
        );
        return {
          hash,
          amount: claimAmount,
          isVote: false,
        };
      }
    },
    onSuccess: (result) => {
      if (result.isVote) {
        groveToast.success(
          `Withdrawal proposal created! Other circle members can now vote on your ${result.amount} BTC proposal from "${circleName}". Check the circle dashboard for voting progress.`
        );
      } else {
        groveToast.success(
          `Successfully claimed ${result.amount} BTC from "${circleName}" to your wallet!`
        );
      }
      onSuccess?.();
    },
    onError: (error: any) => {
      groveToast.error(`Claim failed: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-gray-900/95 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='p-8 pb-4 border-b border-gray-700/50 shrink-0'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold text-white'>
              {isRecurring ? "Start Vote to Claim" : "Claim Funds"} from{" "}
              {circleName}
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition-colors'
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-6'>
          {/* Claim Status */}
          <div
            className={`rounded-lg p-4 border ${
              canClaim
                ? "bg-green-500/20 border-green-500/30"
                : "bg-red-500/20 border-red-500/30"
            }`}
          >
            <p
              className={`text-sm ${
                canClaim ? "text-green-200" : "text-red-200"
              }`}
            >
              {claimReason}
            </p>
          </div>

          {/* Circle Stats */}
          <div className='bg-gray-500/20 border border-gray-500/30 rounded-lg p-4'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-400'>Available:</span>
                <p className='text-white font-semibold'>
                  <BtcDisplay amount={currentAmountWei} wei={true} />
                </p>
              </div>
              <div>
                <span className='text-gray-400'>Target:</span>
                <p className='text-white font-semibold'>
                  <BtcDisplay amount={targetAmountWei} wei={true} />
                </p>
              </div>
              <div>
                <span className='text-gray-400'>Progress:</span>
                <p className='text-white font-semibold'>
                  {Math.min(
                    Number((currentAmountWei * BigInt(100)) / targetAmountWei),
                    100
                  )}
                  %
                </p>
              </div>
              <div>
                <span className='text-gray-400'>Status:</span>
                <p
                  className={`font-semibold ${
                    isGoalReached
                      ? "text-green-400"
                      : isDeadlineExpired
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  {isGoalReached
                    ? "Goal Reached"
                    : isDeadlineExpired
                    ? "Expired"
                    : "Active"}
                </p>
              </div>
            </div>
          </div>

          {/* Note about voting requirements for recurring circles */}
          {isRecurring && (
            <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4'>
              <div className='flex items-start space-x-3'>
                <Vote className='w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-blue-200 text-sm font-medium mb-1'>
                    Democratic Voting Required
                  </p>
                  <p className='text-blue-100 text-xs'>
                    This proposal will create a vote that all circle members can
                    participate in.
                    {!isOwner &&
                      " If voting isn't enabled yet, ask the circle owner to enable it first."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                {isRecurring
                  ? "Amount to Vote For (BTC) - Owner will receive if vote passes"
                  : "Amount to Claim to Your Wallet (BTC)"}
              </label>
              <input
                type='number'
                step='0.00001'
                min='0'
                max={Number(maxClaimableWei) / 1e18}
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='0.001'
                disabled={!canClaim}
                required
              />
              {claimAmount && parseFloat(claimAmount) > 0 && (
                <p className='text-xs text-gray-300 mt-1'>
                  <BtcDisplay
                    amount={claimAmount}
                    showBoth={true}
                    btcFirst={false}
                  />
                </p>
              )}
              <button
                type='button'
                onClick={() =>
                  setClaimAmount((Number(maxClaimableWei) / 1e18).toString())
                }
                className='text-xs text-green-400 hover:text-green-300 mt-1'
                disabled={!canClaim}
              >
                {isRecurring
                  ? "Vote for Full Amount Available"
                  : "Claim Full Amount Available"}
              </button>
            </div>

            {mutation.isError && (
              <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
                <p className='text-red-200 text-sm'>
                  Error: {mutation.error?.message}
                </p>
              </div>
            )}

            {!isOwner && (
              <div className='bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4'>
                <p className='text-yellow-200 text-sm'>
                  ⚠️ You are not the owner of this circle. Only the owner can
                  claim funds.
                </p>
              </div>
            )}

            <div className='flex space-x-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={
                  !canClaim || !claimAmount || !isOwner || mutation.isPending
                }
                className='flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
              >
                {mutation.isPending
                  ? isRecurring
                    ? "Starting Vote..."
                    : "Claiming..."
                  : isRecurring
                  ? "Start Vote"
                  : "Claim Funds"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar {
          /* Firefox */
          scrollbar-width: thin;
          scrollbar-color: #6b7280 rgba(255, 255, 255, 0.1);
        }

        /* Webkit browsers (Chrome, Safari, Edge) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          margin: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(145deg, #6b7280, #4b5563);
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(145deg, #7c3aed, #5b21b6);
          border-color: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
          transition: all 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(145deg, #8b5cf6, #7c3aed);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
