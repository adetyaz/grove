"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { achievementNFTContract } from "@/lib/achievementnft-contract";
import { useWriteContract } from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";

interface ContributeFormProps {
  circleId: string; // UUID
  onChainId: number; // Contract ID
  circleName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ContributeForm({
  circleId, // eslint-disable-line @typescript-eslint/no-unused-vars
  onChainId,
  circleName,
  onSuccess,
  onClose,
}: ContributeFormProps) {
  const [amount, setAmount] = useState("");
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [hash, setHash] = useState<string | undefined>(undefined);
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const { writeContractAsync } = useWriteContract();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!amount || !address) {
        throw new Error(
          "Please enter a valid amount and ensure wallet is connected"
        );
      }

      if (!onChainId) {
        throw new Error(
          "Circle not yet synced to blockchain. Please wait for sync to complete."
        );
      }

      setTimeoutReached(false);

      // Use Grove contract's contribute method with onChainId
      const txHash = await writeContractAsync({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "contribute",
        args: [BigInt(onChainId)],
        value: parseEther(amount),
      });

      setHash(txHash);
      groveToast.transactionPending(txHash);
      // Wait for confirmation (simulate delay)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // === Step 5: Automatic Achievement Minting (placeholder logic) ===
      // TODO: Replace this with real milestone logic
      try {
        if (address) {
          const achievementId = "contributor";
          const tokenURI = "https://example.com/achievement/contributor";
          await achievementNFTContract.mintAchievement(
            address as `0x${string}`,
            achievementId,
            tokenURI,
            address as `0x${string}`
          );
          groveToast.success("Achievement NFT minted for your contribution!");
        }
      } catch (mintErr: any) {
        groveToast.error(
          "Failed to mint achievement NFT: " +
            (mintErr?.message || "Unknown error")
        );
      }
      // === End Step 5 logic ===
    },
    onSuccess: () => {
      groveToast.contributionMade(`${amount} BTC`);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    },
    onError: (err: any) => {
      groveToast.error(`Contribution failed: ${err.message || err.toString()}`);
    },
  });

  // Timeout fallback: close modal after 60s if not confirmed
  // (react-query mutation will handle most cases, but we keep this for UI feedback)
  // Optionally, you can add a timer here if needed for extra feedback.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

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

        {mutation.isSuccess ? (
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
        ) : timeoutReached ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>⏰</span>
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Confirmation Timeout
            </h3>
            <p className='text-gray-300 mb-4'>
              The transaction is taking longer than expected to confirm. Please
              check your wallet or try again later.
            </p>
            <button
              className='mt-4 py-2 px-6 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors'
              onClick={onClose}
            >
              Close
            </button>
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

            {mutation.isError && (
              <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
                <p className='text-red-200 text-sm'>
                  Error: {mutation.error?.message || mutation.error?.toString()}
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
                disabled={!amount || mutation.isPending}
                className='flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
              >
                {mutation.isPending ? "Contributing..." : "Contribute"}
              </button>
            </div>

            {mutation.isPending && !timeoutReached && (
              <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4'>
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400'></div>
                  <p className='text-blue-200 text-sm'>
                    {"Processing contribution..."}
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
