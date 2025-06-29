"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { groveToast } from "@/lib/toast";

interface ContributeFormProps {
  circleId: number;
  circleName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ContributeForm({
  circleId,
  circleName,
  onSuccess,
  onClose,
}: ContributeFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle transaction states with toast notifications
  useEffect(() => {
    if (hash) {
      groveToast.transactionPending(hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isConfirmed) {
      groveToast.contributionMade(`${amount} BTC`);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    }
  }, [isConfirmed, amount, onSuccess, onClose]);

  useEffect(() => {
    if (error) {
      groveToast.error(`Contribution failed: ${error.message}`);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !address) {
      groveToast.error(
        "Please enter a valid amount and ensure wallet is connected"
      );
      return;
    }

    try {
      setIsLoading(true);

      writeContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "contribute",
        args: [BigInt(circleId)],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("Error contributing:", err);
      groveToast.error("Failed to initiate contribution. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle success
  if (isConfirmed) {
    // This is handled in useEffect now with toast notification
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>💰</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Contribute to Circle
          </h2>
          <p className='text-gray-300'>
            Make a contribution to &ldquo;{circleName}&rdquo;
          </p>
        </div>

        {isConfirmed ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>✅</span>
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Contribution Successful!
            </h3>
            <p className='text-gray-300 mb-4'>
              Your contribution of {amount} BTC has been added to the circle.
            </p>
            <div className='text-sm text-gray-400'>
              Transaction: {hash?.slice(0, 6)}...{hash?.slice(-4)}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Contribution Amount (BTC)
              </label>
              <input
                type='number'
                step='0.00001'
                min='0'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='0.001'
                required
              />
              <p className='text-xs text-gray-400 mt-1'>
                Enter the amount in BTC you want to contribute
              </p>
            </div>

            {error && (
              <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
                <p className='text-red-200 text-sm'>Error: {error.message}</p>
              </div>
            )}

            <div className='flex space-x-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={!amount || isPending || isConfirming || isLoading}
                className='flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
              >
                {isPending || isConfirming || isLoading
                  ? "Contributing..."
                  : "Contribute"}
              </button>
            </div>

            {(isPending || isConfirming) && (
              <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4'>
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400'></div>
                  <p className='text-blue-200 text-sm'>
                    {isPending
                      ? "Confirm transaction in your wallet..."
                      : "Transaction confirming..."}
                  </p>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
