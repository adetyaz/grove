"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";

import { useWriteContract, useReadContract } from "wagmi";
import {
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
  TREASURY_CONTRACT_ADDRESS,
  TREASURY_ABI,
} from "@/lib/contracts";

interface ContributeFormProps {
  circleId: string;
  onChainId?: number;
  circleName: string;
  circlePaymentType?: string;
  requiredAmount?: string;
  circleOwner?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onContributionSuccess?: (
    circleId: string,
    contributionAmount: bigint
  ) => void;
}

export default function ContributeForm({
  circleId,
  onChainId,
  circleName,
  circlePaymentType = "ONETIME",
  requiredAmount,
  circleOwner,
  onSuccess,
  onClose,
  onContributionSuccess,
}: ContributeFormProps): React.JSX.Element {
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [hash, setHash] = useState<string | undefined>(undefined);
  const { primaryWallet, isConnected } = useDynamicConnection();
  const address = primaryWallet?.address;
  const { recordActivity } = useStreakTracking();

  const isRecurringCircle = circlePaymentType === "RECURRING";

  // Use the contribution amount directly from the database (already in BTC format)
  const btcAmount = requiredAmount || "0.001";

  const { writeContractAsync } = useWriteContract();

  // Check if user is a member (for deployed circles)
  const { data: isMember } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "isMemberOf",
    args: onChainId && address ? [BigInt(onChainId), address] : undefined,
    query: {
      enabled: !!(onChainId && address && onChainId > 0),
      retry: 3,
      staleTime: 1000 * 60 * 2,
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Please connect your wallet");
      }

      if (!requiredAmount) {
        throw new Error(
          "Invalid circle configuration - no required amount set"
        );
      }

      // Check if circle is deployed to blockchain
      if (!onChainId || onChainId === 0) {
        throw new Error(
          "This circle is not yet deployed to the blockchain. Please wait for deployment to complete before contributing."
        );
      }

      const contributionValue = parseEther(btcAmount.toString());

      // Check if user is a member for deployed circles (unless they're the owner)
      const isOwner =
        circleOwner &&
        address &&
        circleOwner.toLowerCase() === address.toLowerCase();
      if (onChainId && onChainId > 0 && !isMember && !isOwner) {
        throw new Error(
          "You are not a member of this circle. Please join the circle first."
        );
      }

      setTimeoutReached(false);
      groveToast.info("Processing contribution...");

      try {
        // Step 1: Deposit to Treasury vault (with small buffer for gas optimization)
        const depositAmount = contributionValue + parseEther("0.0001"); // Add small buffer
        groveToast.info("💰 Step 1/2: Depositing to vault...");

        const depositTxHash = await writeContractAsync({
          address: TREASURY_CONTRACT_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "depositToVault",
          args: [],
          value: depositAmount, // Send BTC to vault
        });

        groveToast.success("✅ Deposit successful! Moving to contribution...");

        // Wait for deposit confirmation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Step 2: Contribute from vault to circle
        groveToast.info("🎯 Step 2/2: Contributing to circle...");

        const txHash = await writeContractAsync({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "contribute",
          args: [BigInt(onChainId), contributionValue], // Use actual onChainId, not 0
          // NO value field - Grove contract is non-payable, uses Treasury vault
        });

        setHash(txHash);
        groveToast.success(
          "🎉 Contribution complete! Funds deposited and contributed successfully."
        );

        // Wait for transaction confirmation
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (contractError: any) {
        const errorMessage =
          contractError?.message ||
          contractError?.toString() ||
          "Unknown error";

        if (errorMessage.includes("Connector not connected")) {
          throw new Error(
            "Wallet connection lost. Please reconnect your wallet and try again."
          );
        }

        if (errorMessage.includes("User rejected")) {
          throw new Error("Transaction was cancelled by user.");
        }

        if (errorMessage.includes("Insufficient vault balance")) {
          throw new Error(
            "Insufficient funds for contribution. Please try again with a smaller amount."
          );
        }

        if (errorMessage.includes("Wrong contribution amount")) {
          throw new Error(
            "Invalid contribution amount. Please check the required amount for this circle."
          );
        }

        if (errorMessage.includes("Not a member")) {
          throw new Error(
            "You are not a member of this circle. Please join the circle first."
          );
        }

        // Check which step failed for better error messages
        if (errorMessage.includes("depositToVault")) {
          throw new Error(`Failed to deposit to vault: ${errorMessage}`);
        } else if (errorMessage.includes("contribute")) {
          throw new Error(`Failed to contribute to circle: ${errorMessage}`);
        }

        throw new Error(`Transaction failed: ${errorMessage}`);
      }

      setTimeout(() => {
        setTimeoutReached(true);
      }, 45000);

      const finalContributionAmount = parseEther(btcAmount);

      // Track contribution and trigger achievement check directly in frontend
      try {
        // Track the contribution activity first
        await fetch("/api/activity/track-contribution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address,
            circleId,
            amount: btcAmount,
            txHash: hash,
            circleName,
            isRecurring: isRecurringCircle,
          }),
        });
      } catch (logError) {
        console.warn("Failed to track contribution:", logError);
      }

      // Track contribution and trigger achievement check directly in frontend
      try {
        console.log("🔍 Calling achievement calculation API...");
        // Calculate achievements based on actual contribution data
        const achievementResponse = await fetch("/api/achievements/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address,
            contributionAmount: btcAmount,
            circleId,
            txHash: hash,
          }),
        });

        console.log(
          "🔍 Achievement response status:",
          achievementResponse.status
        );

        if (achievementResponse.ok) {
          const achievementData = await achievementResponse.json();
          console.log("🔍 Achievement data received:", achievementData);

          // Show toast notifications for any new achievements earned
          if (
            achievementData.achievements &&
            achievementData.achievements.length > 0
          ) {
            console.log(
              "🎉 Showing achievement toasts for:",
              achievementData.achievements
            );
            setTimeout(() => {
              achievementData.achievements.forEach((achievement: any) => {
                groveToast.success(
                  `🎉 Achievement Unlocked: ${achievement.name}! ${achievement.icon}\n${achievement.description}`,
                  {
                    autoClose: 6000,
                  }
                );
              });

              // Also show a summary if multiple achievements
              if (achievementData.achievements.length > 1) {
                groveToast.success(
                  `🏆 Earned ${achievementData.achievements.length} achievements! Check your profile to see them all.`,
                  {
                    autoClose: 8000,
                  }
                );
              }
            }, 1500); // Delay to show after contribution success
          } else {
            console.log("🔍 No new achievements earned");
          }
        } else {
          console.error(
            "❌ Achievement API error:",
            await achievementResponse.text()
          );
        }
      } catch (achievementError) {
        console.warn("Failed to calculate achievements:", achievementError);
      }

      // Show success toast for contribution
      groveToast.success(
        `🎉 Successfully contributed ${btcAmount} BTC to "${circleName}"!`,
        {
          autoClose: 5000,
        }
      );

      await recordActivity("CONTRIBUTION");

      if (onContributionSuccess) {
        onContributionSuccess(circleId, finalContributionAmount);
      }

      setTimeout(() => {
        onSuccess?.();
        onClose?.();
        // Redirect to overview after successful contribution
        window.location.href = "/dashboard";
      }, 1000);
    },
    onError: (err: any) => {
      groveToast.error(`Contribution failed: ${err.message || err.toString()}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
      <div className='bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 max-w-md w-full shadow-2xl'>
        <div className='text-center mb-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg'>
            <span className='text-xl'>₿</span>
          </div>
          <h2 className='text-xl font-bold text-white mb-1'>
            Contribute to Circle
          </h2>
          <p className='text-slate-300 text-sm'>&ldquo;{circleName}&rdquo;</p>
        </div>

        {/* Circle Status - Only show if there's a real issue */}
        {onChainId && onChainId > 0 ? (
          <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6'>
            <p className='text-green-200 text-sm text-center'>
              ✅ Circle is deployed and ready for contributions
            </p>
            <div className='text-xs text-green-300 mt-2 text-center'>
              Circle ID #{onChainId}
            </div>
          </div>
        ) : null}

        {/* Membership Check for Deployed Circles */}
        {onChainId &&
          onChainId > 0 &&
          isMember === false &&
          !(
            circleOwner &&
            address &&
            circleOwner.toLowerCase() === address.toLowerCase()
          ) && (
            <div className='bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-6'>
              <p className='text-orange-400 text-sm text-center font-semibold mb-3'>
                🔐 You need to join this circle first
              </p>
              <p className='text-gray-300 text-xs text-center mb-4'>
                You must be a member of the circle before you can contribute
              </p>
              <div className='flex justify-center'>
                <button
                  onClick={async () => {
                    try {
                      groveToast.info("Joining circle...");
                      const txHash = await writeContractAsync({
                        address: GROVE_CONTRACT_ADDRESS,
                        abi: GROVE_ABI,
                        functionName: "joinCircle",
                        args: [BigInt(onChainId)],
                      });
                      groveToast.transactionPending(txHash);
                      // Wait a bit then refetch membership status
                      setTimeout(() => window.location.reload(), 3000);
                    } catch (error: any) {
                      groveToast.error(
                        `Failed to join circle: ${error.message}`
                      );
                    }
                  }}
                  className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors'
                >
                  Join Circle
                </button>
              </div>
            </div>
          )}

        {mutation.isSuccess ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>✓</span>
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Contribution Successful!
            </h3>
            <p className='text-gray-300 mb-4'>
              Your contribution of {btcAmount} BTC has been added to the circle.
            </p>
            <div className='text-sm text-gray-400'>
              Transaction: {hash?.slice(0, 6)}...{hash?.slice(-4)}
            </div>
          </div>
        ) : timeoutReached ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>!</span>
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
              Wallet not connected. Please connect your wallet to contribute.
            </p>
            <button
              className='mt-3 w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors'
              onClick={onClose}
            >
              Close & Connect Wallet
            </button>
          </div>
        ) : isConnected && address ? (
          // Only show form if user is a member (for deployed circles) or circle is not deployed
          !onChainId || onChainId === 0 || isMember === true ? (
            <div className='space-y-4'>
              <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Simplified contribution info */}
                <div className='bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3'>
                  <div className='text-center'>
                    <div className='text-sm text-blue-300 mb-1'>
                      Contribution Amount
                    </div>
                    <div className='text-lg font-bold text-white'>
                      {btcAmount} BTC
                    </div>
                    <div className='text-xs text-blue-200'>
                      Fixed amount for this circle
                    </div>
                  </div>
                </div>

                {mutation.isError && (
                  <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
                    <p className='text-red-200 text-sm'>
                      Error:{" "}
                      {mutation.error?.message || mutation.error?.toString()}
                    </p>
                  </div>
                )}

                <div className='flex space-x-4'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-300'
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={
                      !btcAmount ||
                      mutation.isPending ||
                      !onChainId ||
                      onChainId === 0
                    }
                    className={`flex-1 py-3 px-4 bg-gradient-to-r ${
                      isRecurringCircle
                        ? "from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                        : "from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary"
                    } disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 hover-lift shadow-lg hover:shadow-secondary/25`}
                  >
                    {mutation.isPending ? "Processing..." : "Contribute"}
                  </button>
                </div>

                {mutation.isPending && !timeoutReached && (
                  <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400'></div>
                      <div>
                        <p className='text-blue-200 text-sm font-medium'>
                          Processing Contribution
                        </p>
                        <p className='text-blue-300 text-xs'>
                          Step 1: Depositing to vault → Step 2: Contributing to
                          circle
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show warning for undeployed circles */}
                {(!onChainId || onChainId === 0) && (
                  <div className='bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-yellow-400 text-sm'>⚠️</span>
                      <p className='text-yellow-200 text-sm'>
                        Circle not yet deployed to blockchain. Please wait for
                        deployment.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          ) : (
            // User is not a member of a deployed circle - membership check section already shown above
            <div className='text-center py-8'>
              <p className='text-gray-400'>
                Please join the circle first to contribute.
              </p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
