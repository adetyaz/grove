import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { parseEther } from "viem";
import { BtcDisplay } from "./btc-display";

interface CircleClaimFormProps {
  circleId: string;
  onChainId: number;
  circleName: string;
  currentAmount: string;
  targetAmount: string;
  deadline: string;
  paymentType?: string; // "ONETIME" or "RECURRING"
  isOwner: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function CircleClaimForm({
  circleId,
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

  const isRecurring = paymentType === "RECURRING";

  const claimReason = isGoalReached
    ? isRecurring
      ? "🗳️ Goal Reached! Start a vote to claim the saved funds."
      : "🎉 Goal Reached! You can now claim your saved funds."
    : isDeadlineExpired
    ? isRecurring
      ? "⏰ Deadline Expired! Start a vote to claim whatever has been saved."
      : "⏰ Deadline Expired! You can claim whatever has been saved so far."
    : isRecurring
    ? "❌ Cannot start vote yet. Goal not reached and deadline not expired."
    : "❌ Cannot claim yet. Goal not reached and deadline not expired.";

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Please connect your wallet to claim");
      }
      if (!claimAmount || parseFloat(claimAmount) <= 0) {
        throw new Error("Please enter a valid claim amount");
      }

      const claimAmountWei = parseEther(claimAmount);
      if (claimAmountWei > maxClaimableWei) {
        throw new Error("Claim amount exceeds available balance");
      }

      if (!canClaim) {
        throw new Error(
          "Circle is not yet claimable. Goal not reached and deadline not expired."
        );
      }

      // TODO: Implement actual claiming logic with contracts
      // For one-time circles: Call Grove contract's withdraw function
      // For recurring circles: Call voting contract to start voting process
      const actionMessage = isRecurring
        ? "Starting vote for claiming funds from circle..."
        : "Claiming funds from circle...";
      groveToast.info(actionMessage);

      // Simulate claim transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        amount: claimAmount,
      };
    },
    onSuccess: (result) => {
      const successMessage = isRecurring
        ? `Successfully started vote to claim ${result.amount} BTC from "${circleName}"!`
        : `Successfully claimed ${result.amount} BTC from "${circleName}"!`;
      groveToast.success(successMessage);
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
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>{isRecurring ? "�️" : "�💰"}</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            {isRecurring ? "Start Vote to Claim" : "Claim Funds"}
          </h2>
          <p className='text-gray-300'>
            {isRecurring ? "Vote on " : "Claim from "}
            &ldquo;{circleName}&rdquo;
          </p>
        </div>

        {/* Claim Status */}
        <div
          className={`rounded-lg p-4 mb-6 border ${
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
        <div className='bg-gray-500/20 border border-gray-500/30 rounded-lg p-4 mb-6'>
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

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              {isRecurring
                ? "Vote to Claim Amount (BTC)"
                : "Claim Amount (BTC)"}
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
                ? "Vote for Maximum Available"
                : "Claim Maximum Available"}
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
  );
}
