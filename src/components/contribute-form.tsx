"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { formatBtcAmount } from "@/lib/btc-conversion";

import { useWriteContract, useReadContract } from "wagmi";
import { 
  GROVE_CONTRACT_ADDRESS, 
  GROVE_ABI,
  TREASURY_CONTRACT_ADDRESS,
  TREASURY_ABI 
} from "@/lib/contracts";

interface ContributeFormProps {
  circleId: string;
  onChainId: number;
  circleName: string;
  circlePaymentType?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onContributionSuccess?: (
    circleId: string,
    contributionAmount: bigint
  ) => void;
  onRefresh?: () => void;
}

export default function ContributeForm({
  circleId,
  onChainId,
  circleName,
  circlePaymentType = "ONETIME",
  onSuccess,
  onClose,
  onContributionSuccess,
  onRefresh,
}: ContributeFormProps) {
  const [amount, setAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositSection, setShowDepositSection] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [hash, setHash] = useState<string | undefined>(undefined);
  const { primaryWallet, isConnected } = useDynamicConnection();
  const address = primaryWallet?.address;
  const { recordActivity } = useStreakTracking();

  const isRecurringCircle = circlePaymentType === "RECURRING";

  const { writeContractAsync } = useWriteContract();

  // Check if user is a member
  const {
    data: isMember,
    isLoading: isLoadingMembership,
    refetch: refetchMembership,
  } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "isMember",
    args: onChainId && address ? [BigInt(onChainId), address] : undefined,
    query: {
      enabled: !!(onChainId && address && onChainId > 0),
      retry: 3,
      staleTime: 1000 * 60 * 2,
    },
  });

  // Check user's vault balance
  const {
    data: vaultData,
    isLoading: isLoadingVault,
    refetch: refetchVault,
  } = useReadContract({
    address: TREASURY_CONTRACT_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "getUserVault",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: 3,
      staleTime: 1000 * 30, // 30 seconds
    },
  });

  // Deposit mutation for vault
  const depositMutation = useMutation({
    mutationFn: async (depositAmount: string) => {
      if (!address || !depositAmount) {
        throw new Error("Please enter a valid deposit amount");
      }

      const depositValue = parseEther(depositAmount);
      groveToast.info("Depositing to vault...");

      try {
        const txHash = await writeContractAsync({
          address: TREASURY_CONTRACT_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "depositToVault",
          args: [],
          value: depositValue,
        });

        groveToast.transactionPending(txHash);
        
        // Wait for transaction and refresh vault data
        await new Promise((resolve) => setTimeout(resolve, 5000));
        refetchVault();
        
        groveToast.transactionSuccess(txHash);
        setDepositAmount("");
        
        return txHash;
      } catch (error: any) {
        const errorMessage = error?.message || "Deposit failed";
        groveToast.error(errorMessage);
        throw error;
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address || !amount) {
        throw new Error("Please enter a valid amount and connect your wallet");
      }

      if (!isMember) {
        throw new Error(
          "You are not a member of this circle. Please join the circle first."
        );
      }

      const contributionAmount = parseEther(amount);

      // Check if user has sufficient vault balance
      if (vaultData) {
        const [, availableBalance] = vaultData as [bigint, bigint, bigint, bigint, bigint];
        if (availableBalance < contributionAmount) {
          throw new Error(
            `Insufficient vault balance. You have ${formatBtcAmount(availableBalance.toString())} BTC available, but need ${formatBtcAmount(contributionAmount.toString())} BTC. Please deposit more funds to your vault first.`
          );
        }
      }

      setTimeoutReached(false);
      groveToast.info("Processing contribution...");

      try {
        // Call Grove contract's contribute function with amount parameter
        const txHash = await writeContractAsync({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "contribute",
          args: [BigInt(onChainId), contributionAmount], // Correct: circleId, amount
          value: BigInt(0), // No ETH sent directly - using vault funds
        });

        setHash(txHash);
        groveToast.transactionPending(txHash);

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
            "Insufficient funds in your vault. Please deposit more funds first."
          );
        }

        if (errorMessage.includes("Wrong contribution amount")) {
          throw new Error(
            "Invalid contribution amount. Please check the required amount for this circle."
          );
        }

        throw new Error(`Transaction failed: ${errorMessage}`);
      }

      if (isRecurringCircle) {
        try {
          const scheduleResponse = await fetch("/api/payments/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userAddress: address,
              circleId: circleId,
              amount: parseFloat(amount),
              frequency: "WEEKLY",
              maxPayments: null,
            }),
          });

          const scheduleData = await scheduleResponse.json();
          if (!scheduleData.success) {
            console.warn(
              "Failed to set up recurring schedule:",
              scheduleData.error
            );
          }
        } catch (scheduleError) {
          console.warn("Failed to set up recurring schedule:", scheduleError);
        }
      }

      setTimeout(() => {
        setTimeoutReached(true);
      }, 45000);

      const contributionAmount = parseEther(amount);

      // Track contribution and trigger achievement check directly in frontend
      try {
        // Track the contribution activity first
        await fetch("/api/activity/track-contribution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address,
            circleId,
            amount,
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
            contributionAmount: amount,
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

      await recordActivity("CONTRIBUTION");

      if (onContributionSuccess) {
        onContributionSuccess(circleId, contributionAmount);
      }

      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }

      setTimeout(() => {
        onSuccess?.();
        onClose?.();
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
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full hover-lift'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-4 glow'>
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
          <div className='bg-accent/20 border border-accent/30 rounded-lg p-4 mb-6'>
            <p className='text-accent text-sm text-center'>
              <span className='mr-2'>⚠️</span>
              Circle is not yet synced with blockchain. Please wait for the
              circle to be deployed or try again later.
            </p>
            <div className='text-xs text-gray-300 mt-2 text-center'>
              onChainId: {onChainId || "null"} • Address: {address?.slice(0, 6)}
              ...{address?.slice(-4)}
            </div>
            <div className='flex space-x-2 mt-3'>
              <button
                className='flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm'
                onClick={onClose}
              >
                Close
              </button>
              <button
                className='flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm'
                onClick={() => {
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
          <div className='space-y-6'>
            {/* Vault Balance Section */}
            {vaultData && (
              <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-emerald-300 font-semibold flex items-center'>
                    <span className='mr-2'>🏦</span>
                    Vault Balance
                  </span>
                  <button
                    type='button'
                    onClick={() => setShowDepositSection(!showDepositSection)}
                    className='text-xs text-emerald-300 hover:text-emerald-200 underline'
                  >
                    {showDepositSection ? 'Hide Deposit' : 'Add Funds'}
                  </button>
                </div>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-400 block'>Available:</span>
                    <span className='text-white font-mono'>
                      {formatBtcAmount((vaultData[1] as bigint).toString())} BTC
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-400 block'>Locked:</span>
                    <span className='text-white font-mono'>
                      {formatBtcAmount((vaultData[2] as bigint).toString())} BTC
                    </span>
                  </div>
                </div>
                
                {/* Deposit Section */}
                {showDepositSection && (
                  <div className='mt-4 pt-4 border-t border-emerald-500/20'>
                    <div className='space-y-3'>
                      <label className='block text-sm font-medium text-emerald-300'>
                        Deposit Amount (BTC)
                      </label>
                      <input
                        type='number'
                        step='0.0001'
                        min='0'
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300'
                        placeholder='0.001'
                      />
                      <button
                        type='button'
                        onClick={() => depositMutation.mutate(depositAmount)}
                        disabled={!depositAmount || depositMutation.isPending}
                        className='w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300'
                      >
                        {depositMutation.isPending ? 'Depositing...' : 'Deposit to Vault'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Circle Payment Type Info */}
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-2'>
                <span className='text-lg'>
                  {isRecurringCircle ? "🔄" : "💰"}
                </span>
                <span className='text-blue-300 font-semibold'>
                  {isRecurringCircle ? "Recurring Circle" : "One-time Circle"}
                </span>
              </div>
              <p className='text-blue-200 text-sm'>
                {isRecurringCircle
                  ? "This circle uses recurring payments. You can set up automatic contributions."
                  : "This circle uses one-time payments. Make individual contributions as needed."}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Contribution Amount (BTC)
              </label>
              <input
                type='number'
                step='0.0001'
                min='0'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-300'
                placeholder='0.001'
                required
              />
              <div className='flex justify-between text-xs mt-1'>
                <p className='text-gray-400'>
                  Enter the amount in BTC you want to contribute
                </p>
                {amount && parseFloat(amount) > 0 && (
                  <p className='text-gray-300'>
                    ≈{" "}
                    {formatBtcAmount(amount, {
                      showBoth: false,
                      btcFirst: false,
                    })}
                  </p>
                )}
              </div>
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
                className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-300'
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={!amount || mutation.isPending}
                className={`flex-1 py-3 px-4 bg-gradient-to-r ${
                  isRecurringCircle
                    ? "from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                    : "from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary"
                } disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 hover-lift shadow-lg hover:shadow-secondary/25`}
              >
                {mutation.isPending ? "Contributing..." : "Contribute"}
              </button>
            </div>

            {mutation.isPending && !timeoutReached && (
              <div className='bg-trust/20 border border-trust/30 rounded-lg p-4'>
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-trust'></div>
                  <p className='text-trust text-sm'>
                    Processing contribution...
                  </p>
                </div>
              </div>
            )}
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
