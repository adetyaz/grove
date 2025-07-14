"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
// import { achievementNFTContract } from "@/lib/achievementnft-contract"; // Temporarily disabled
import { useWriteContract, useReadContract } from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";

interface ContributeFormProps {
  circleId: string; // UUID
  onChainId: number; // Contract ID
  circleName: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onContributionSuccess?: (
    circleId: string,
    contributionAmount: bigint
  ) => void; // New prop for targeted updates
  onRefresh?: () => void; // Fallback refresh function
}

export default function ContributeForm({
  circleId,
  onChainId,
  circleName,
  onSuccess,
  onClose,
  onContributionSuccess,
  onRefresh,
}: ContributeFormProps) {
  const [amount, setAmount] = useState("");
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [hash, setHash] = useState<string | undefined>(undefined);
  const { primaryWallet, isConnected } = useDynamicConnection();
  const address = primaryWallet?.address;

  const { writeContractAsync } = useWriteContract();

  // Check if user is a member of this circle
  const {
    data: isMember,
    isLoading: checkingMembership,
    refetch: refetchMembership,
  } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "isMemberOf",
    args: onChainId && address ? [BigInt(onChainId), address] : undefined,
    query: {
      enabled: !!(address && onChainId && onChainId > 0),
      staleTime: 0, // Don't cache membership checks
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchInterval: 5000, // Refetch every 5 seconds to catch membership changes
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Enhanced connection checks
      if (!isConnected || !primaryWallet) {
        throw new Error(
          "Wallet not connected. Please connect your wallet first."
        );
      }

      if (!address) {
        throw new Error(
          "No wallet address found. Please reconnect your wallet."
        );
      }

      if (!amount) {
        throw new Error("Please enter a valid amount");
      }

      if (!onChainId || onChainId === 0) {
        throw new Error(
          "Circle is not properly synced with blockchain. Please try again later."
        );
      }

      // Check if user is a member before contributing
      if (!isMember) {
        throw new Error(
          "You are not a member of this circle. Please join the circle first."
        );
      }

      setTimeoutReached(false);

      groveToast.info("Processing contribution...");

      try {
        // Use Grove contract's contribute method with the actual onChainId
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
      } catch (contractError: any) {
        // Enhanced error handling for connection issues
        const errorMessage =
          contractError?.message ||
          contractError?.toString() ||
          "Unknown error";

        if (errorMessage.includes("Connector not connected")) {
          throw new Error(
            "Wallet connection lost. Please reconnect your wallet and try again."
          );
        } else if (errorMessage.includes("User rejected")) {
          throw new Error("Transaction was rejected. Please try again.");
        } else if (errorMessage.includes("insufficient funds")) {
          throw new Error("Insufficient funds for this transaction.");
        } else {
          throw new Error(`Transaction failed: ${errorMessage}`);
        }
      }

      // === Step 5: Automatic Achievement Minting (TEMPORARILY DISABLED) ===
      // TODO: Replace this with real milestone logic
      // NOTE: Disabled due to OwnableUnauthorizedAccount error - will fix later
      /*
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
      */
      // === End Step 5 logic ===
    },
    onSuccess: () => {
      groveToast.contributionMade(`${amount} BTC`);

      // Call the targeted update function to update just this circle's data
      if (onContributionSuccess) {
        const contributionAmount = parseEther(amount);
        console.log("🔄 Calling onContributionSuccess with:", {
          circleId,
          contributionAmount: contributionAmount.toString(),
        });
        onContributionSuccess(circleId, contributionAmount);

        // Add a small delay then trigger fallback refresh if available
        setTimeout(() => {
          if (onRefresh) {
            console.log("🔄 Triggering fallback refresh...");
            onRefresh();
          }
        }, 500);
      } else {
        console.log("⚠️ onContributionSuccess callback not provided");
        // If no real-time update, definitely trigger refresh
        if (onRefresh) {
          setTimeout(() => {
            console.log(
              "🔄 No real-time update available, triggering refresh..."
            );
            onRefresh();
          }, 1000);
        }
      }

      // Force a small delay to ensure the UI updates are visible
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1000); // Reduced from 2000ms to 1000ms for faster UX
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

        {/* Membership Status Check */}
        {!onChainId || onChainId === 0 ? (
          <div className='bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6'>
            <p className='text-yellow-200 text-sm text-center'>
              <span className='mr-2'>⚠️</span>
              Circle is not yet synced with blockchain. Please wait for the
              circle to be deployed or try again later.
            </p>
            <div className='text-xs text-yellow-300 mt-2 text-center'>
              onChainId: {onChainId || "null"} • Address: {address?.slice(0, 6)}
              ...{address?.slice(-4)}
            </div>
            <button
              className='mt-3 w-full py-2 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors'
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : checkingMembership ? (
          <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6'>
            <p className='text-blue-200 text-sm text-center'>
              <span className='animate-spin inline-block mr-2'>⏳</span>
              Checking membership status...
            </p>
            <div className='text-xs text-blue-300 mt-2 text-center'>
              Verifying on Circle ID {onChainId} for {address?.slice(0, 6)}...
              {address?.slice(-4)}
            </div>
          </div>
        ) : !isMember ? (
          <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6'>
            <p className='text-red-200 text-sm text-center mb-3'>
              <span className='mr-2'>⚠️</span>
              You are not a member of this circle. This could be due to:
            </p>
            <ul className='text-red-200 text-xs mb-3 space-y-1'>
              <li>• You haven&apos;t joined the circle yet</li>
              <li>• Your join transaction is still pending</li>
              <li>
                • There&apos;s a sync issue between database and blockchain
              </li>
            </ul>
            <div className='text-xs text-red-300 mb-3 text-center bg-red-900/30 rounded p-2'>
              <strong>Debug Info:</strong>
              <br />
              Circle ID: {onChainId} • Address: {address?.slice(0, 6)}...
              {address?.slice(-4)}
              <br />
              Membership Status: {isMember ? "Member" : "Not Member"}
              <br />
              UUID: {circleId?.slice(0, 8)}...
            </div>
            <div className='flex space-x-2'>
              <button
                className='flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm'
                onClick={onClose}
              >
                Close & Join Circle
              </button>
              <button
                className='flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm'
                onClick={() => {
                  console.log("🔄 Manually refreshing membership status...");
                  console.log("Debug info:", {
                    onChainId,
                    address,
                    circleId,
                    isMember,
                  });
                  refetchMembership();
                }}
              >
                Refresh Status
              </button>
            </div>
          </div>
        ) : (
          <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6'>
            <p className='text-green-200 text-sm text-center'>
              <span className='mr-2'>✅</span>
              You are a verified member of this circle
            </p>
            <div className='text-xs text-green-300 mt-2 text-center'>
              Circle ID {onChainId}, Address: {address?.slice(0, 6)}...
              {address?.slice(-4)}
            </div>
          </div>
        )}

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
        ) : !isConnected || !address ? (
          <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6'>
            <p className='text-red-200 text-sm text-center'>
              <span className='mr-2'>⚠️</span>
              Wallet not connected. Please connect your wallet to contribute.
            </p>
            <button
              className='mt-3 w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors'
              onClick={onClose}
            >
              Close & Connect Wallet
            </button>
          </div>
        ) : isMember && onChainId && onChainId > 0 && isConnected && address ? (
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
        ) : null}
      </div>
    </div>
  );
}
