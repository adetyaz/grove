"use client";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  CITREA_TESTNET,
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
} from "@/lib/contracts";
import { useState, useEffect } from "react";
import { parseEther, decodeEventLog } from "viem";
import { groveToast } from "@/lib/toast";

interface CircleFormProps {
  onSuccess?: () => void;
}

export default function CircleForm({ onSuccess }: CircleFormProps) {
  const { user, primaryWallet } = useDynamicConnection();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const address = primaryWallet?.address;
  const isConnected = !!(user && primaryWallet?.address);

  // Mock BTC to USD rate (in production, fetch from API)
  const BTC_TO_USD = 43250;

  // Helper function to convert BTC to USD
  const btcToUsd = (btcAmount: string) => {
    const btc = parseFloat(btcAmount);
    if (isNaN(btc) || btc === 0) return "$0.00";
    const usd = btc * BTC_TO_USD;
    return `$${usd.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const {
    writeContractAsync,
    isPending,
    error: writeError,
  } = useWriteContract();

  const isOnCorrectNetwork = chain?.id === CITREA_TESTNET.id;

  const [hash, setHash] = useState<string | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Wait for transaction receipt
  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}`,
    query: {
      enabled: !!hash,
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    contributionAmount: "",
    contributionInterval: "86400", // Default: daily (24 hours in seconds)
    durationDays: "30", // Auto-calculated, will be computed from other fields
    isPublic: false,
    // Legacy fields for database compatibility (will be converted)
    paymentType: 1, // Always recurring for V3
    frequency: "DAILY",
    hasDeadline: true,
  });

  // Auto-calculate duration based on target amount, contribution amount, and interval
  const calculateDuration = () => {
    if (
      !formData.targetAmount ||
      !formData.contributionAmount ||
      !formData.contributionInterval
    ) {
      return "30"; // Default fallback
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const contributionAmount = parseFloat(formData.contributionAmount);
    const intervalSeconds = parseInt(formData.contributionInterval);

    if (targetAmount <= 0 || contributionAmount <= 0 || intervalSeconds <= 0) {
      return "30"; // Default fallback
    }

    // Calculate number of contributions needed
    const contributionsNeeded = Math.ceil(targetAmount / contributionAmount);

    // Calculate total duration in seconds
    const totalDurationSeconds = contributionsNeeded * intervalSeconds;

    // Convert to days
    const durationDays = Math.ceil(totalDurationSeconds / 86400); // 86400 seconds = 1 day

    return durationDays.toString();
  };

  // Update duration when target amount, contribution amount, or interval changes
  useEffect(() => {
    const newDuration = calculateDuration();
    setFormData((prev) => ({
      ...prev,
      durationDays: newDuration,
    }));
  }, [
    formData.targetAmount,
    formData.contributionAmount,
    formData.contributionInterval,
  ]);

  useEffect(() => {
    if (hash) {
      groveToast.transactionPending(hash);
    }
  }, [hash]);

  useEffect(() => {
    if (writeError) {
      groveToast.error(`Transaction failed: ${writeError.message}`);
      setIsCreating(false);
      setIsConfirming(false);
    }
  }, [writeError]);

  useEffect(() => {
    if (receiptError) {
      groveToast.error(`Receipt error: ${receiptError.message}`);
      setIsCreating(false);
      setIsConfirming(false);
    }
  }, [receiptError]);

  // Handle successful transaction receipt
  useEffect(() => {
    if (receipt && receipt.status === "success" && address && user) {
      handleTransactionSuccess(receipt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt, address, user]);

  // Handle successful blockchain deployment
  const handleTransactionSuccess = async (receipt: any) => {
    try {
      console.log("Transaction receipt:", receipt);
      console.log("Receipt logs:", receipt.logs);

      // Extract circle ID from event logs
      let circleId = null;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: GROVE_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "CircleCreated" && decoded.args) {
            // CircleCreated event: circleId (indexed), owner (indexed), name, isPublic
            // The args object has the properties directly accessible
            circleId = (decoded.args as any).circleId;
            console.log("Found CircleCreated event:", decoded.args);
            console.log("Extracted circleId:", circleId);
            break;
          }
        } catch {
          // Skip logs that can't be decoded
          continue;
        }
      }

      if (!circleId) {
        throw new Error("Circle ID not found in transaction logs");
      }

      // Save to database with blockchain data
      const response = await fetch("/api/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          targetAmount: formData.targetAmount,
          contributionAmount: formData.contributionAmount,
          contributionInterval: formData.contributionInterval,
          durationDays: formData.durationDays,
          isPublic: formData.isPublic,
          ownerWallet: address,
          ownerEmail: user?.email || `${address}@wallet.local`,
          onChainId: Number(circleId),
          transactionHash: receipt.transactionHash,
          chainId: CITREA_TESTNET.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save circle to database");
      }

      groveToast.success("Circle deployed and saved successfully!");
      setIsConfirming(false);
      setIsCreating(false);

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        contributionAmount: "",
        contributionInterval: "86400",
        durationDays: "30",
        isPublic: false,
        paymentType: 1,
        frequency: "DAILY",
        hasDeadline: true,
      });
    } catch (error: any) {
      groveToast.error(`Failed to save circle: ${error.message}`);
      setIsConfirming(false);
      setIsCreating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Enhanced validation for amount fields
    if (name === "targetAmount" || name === "contributionAmount") {
      const numValue = parseFloat(value);

      if (name === "targetAmount") {
        // Target amount: 0.000001 - 10 BTC
        if (numValue < 0.000001 && value !== "") return;
        if (numValue > 10) return;
      } else if (name === "contributionAmount") {
        // Contribution amount: 0.000001 - 1 BTC
        if (numValue < 0.000001 && value !== "") return;
        if (numValue > 1) return;
      }
    }

    if (name === "durationDays") {
      const numValue = parseInt(value);
      // Duration: 1 - 3650 days (10 years)
      if (numValue < 1 && value !== "") return;
      if (numValue > 3650) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: CITREA_TESTNET.id });
    } catch {
      groveToast.error("Failed to switch network");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      groveToast.error("Please connect your wallet first");
      return;
    }

    if (!isOnCorrectNetwork) {
      groveToast.error("Please switch to Citrea Testnet");
      return;
    }

    try {
      setIsCreating(true);

      // Convert amounts to wei
      const targetAmountWei = parseEther(formData.targetAmount);
      const contributionAmountWei = parseEther(formData.contributionAmount);
      const durationDays = BigInt(formData.durationDays);
      const intervalSeconds = BigInt(formData.contributionInterval);

      groveToast.info("Deploying circle to blockchain...");

      // Create circle on blockchain
      const txHash = await writeContractAsync({
        address: GROVE_CONTRACT_ADDRESS as `0x${string}`,
        abi: GROVE_ABI,
        functionName: "createCircle",
        args: [
          formData.name,
          formData.description,
          targetAmountWei,
          contributionAmountWei,
          intervalSeconds,
          durationDays,
          formData.isPublic,
        ],
      });

      setHash(txHash);
      setIsConfirming(true);
      groveToast.info("Transaction sent! Waiting for confirmation...");
    } catch (error: any) {
      groveToast.error(`Deployment failed: ${error.message}`);
      setIsCreating(false);
      setIsConfirming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className='bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-700/50'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Connect Your Wallet
        </h3>
        <p className='text-slate-400 mb-6'>
          Please connect your wallet to create a contribution circle.
        </p>
      </div>
    );
  }

  if (!isOnCorrectNetwork) {
    return (
      <div className='bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-700/50'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Switch to Citrea Testnet
        </h3>
        <p className='text-slate-400 mb-6'>
          Please switch to Citrea Testnet to create a circle.
        </p>
        <button
          onClick={handleSwitchNetwork}
          className='px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium'
        >
          Switch Network
        </button>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-white mb-2'>
                Circle Name *
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='My Savings Circle'
                className='w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300'
                required
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-white mb-2'>
                Description *
              </label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your circle's purpose and goals..."
                rows={3}
                className='w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Target Amount (BTC) *
              </label>
              <input
                type='number'
                name='targetAmount'
                value={formData.targetAmount}
                onChange={handleInputChange}
                placeholder='1.0'
                step='0.000001'
                min='0.000001'
                max='10'
                className='w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300'
                required
              />
              <div className='flex justify-between items-center mt-1'>
                <p className='text-xs text-slate-400'>
                  Min: 0.000001 BTC • Max: 10 BTC
                </p>
                {formData.targetAmount && (
                  <p className='text-xs text-emerald-400 font-medium'>
                    ≈ {btcToUsd(formData.targetAmount)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Contribution Amount (BTC) *
              </label>
              <input
                type='number'
                name='contributionAmount'
                value={formData.contributionAmount}
                onChange={handleInputChange}
                placeholder='0.1'
                step='0.000001'
                min='0.000001'
                max='1'
                className='w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300'
                required
              />
              <div className='flex justify-between items-center mt-1'>
                <p className='text-xs text-slate-400'>
                  Min: 0.000001 BTC • Max: 1 BTC per contribution
                </p>
                {formData.contributionAmount && (
                  <p className='text-xs text-emerald-400 font-medium'>
                    ≈ {btcToUsd(formData.contributionAmount)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Contribution Interval *
              </label>
              <select
                name='contributionInterval'
                value={formData.contributionInterval}
                onChange={handleInputChange}
                className='w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white backdrop-blur-sm transition-all duration-300'
                style={{
                  colorScheme: "dark",
                }}
                required
              >
                <option value='86400' className='bg-slate-800 text-white'>
                  Daily (24 hours)
                </option>
                <option value='604800' className='bg-slate-800 text-white'>
                  Weekly (7 days)
                </option>
                <option value='2592000' className='bg-slate-800 text-white'>
                  Monthly (30 days)
                </option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Duration (Auto-calculated)
              </label>
              <div className='w-full px-4 py-2 bg-slate-700/50 border border-slate-500 rounded-lg text-white backdrop-blur-sm'>
                {formData.durationDays} days
              </div>
              <p className='text-xs text-slate-400 mt-1'>
                Automatically calculated based on target amount ÷ contribution
                amount × interval
              </p>
            </div>

            <div className='md:col-span-2'>
              <label className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  name='isPublic'
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className='w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary focus:ring-2'
                />
                <span className='text-sm text-white'>
                  Make this circle public (others can discover and join)
                </span>
              </label>
            </div>
          </div>

          <div className='mt-8 pt-6 border-t border-slate-700/50'>
            <button
              type='submit'
              disabled={isCreating || isPending || isConfirming}
              className='w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-base'
            >
              {isCreating || isPending || isConfirming
                ? "Creating Circle..."
                : "Create Circle"}
            </button>
          </div>

          {hash && (
            <div className='mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
              <p className='text-sm text-blue-400'>
                Transaction hash:{" "}
                <a
                  href={`https://explorer.citrea.xyz/tx/${hash}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline hover:text-blue-300'
                >
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </a>
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
