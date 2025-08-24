"use client";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  CITREA_TESTNET,
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
} from "@/lib/contracts";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { formatBtcAmount } from "@/lib/btc-conversion";

interface CircleFormProps {
  onSuccess?: () => void;
}

export default function CircleForm({ onSuccess }: CircleFormProps) {
  const { user, primaryWallet } = useDynamicConnection();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const address = primaryWallet?.address;
  const isConnected = !!(user && primaryWallet?.address);

  const {
    writeContractAsync,
    isPending,
    error: writeError,
  } = useWriteContract();

  const isOnCorrectNetwork = chain?.id === CITREA_TESTNET.id;

  const [hash, setHash] = useState<string | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    contributionAmount: "",
    contributionInterval: "86400", // Default: daily (24 hours in seconds)
    durationDays: "30", // Default: 30 days
    isPublic: false,
    // Legacy fields for database compatibility (will be converted)
    paymentType: 1, // Always recurring for V3
    frequency: "DAILY",
    hasDeadline: true,
  });

  useEffect(() => {
    if (hash) {
      groveToast.transactionPending(hash);
    }
  }, [hash]);

  useEffect(() => {
    if (writeError) {
      groveToast.error(`Transaction failed: ${writeError.message}`);
    }
  }, [writeError]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "paymentType" ? Number(value) : value,
    }));
  };

  const createCircle = async () => {
    if (!isConnected || !address) {
      groveToast.error("Please connect your wallet first");
      return;
    }

    if (!isOnCorrectNetwork) {
      groveToast.error("Please switch to Citrea Testnet to create circles");
      return;
    }

    setIsCreating(true);

    try {
      const targetAmountWei = parseEther(formData.targetAmount);
      const contributionAmountWei = parseEther(formData.contributionAmount);
      const durationDaysBigInt = BigInt(formData.durationDays);

      // Validation
      if (targetAmountWei <= 0) {
        groveToast.error("Target amount must be greater than 0");
        return;
      }
      if (contributionAmountWei <= 0) {
        groveToast.error("Contribution amount must be greater than 0");
        return;
      }
      if (durationDaysBigInt <= 0) {
        groveToast.error("Duration must be greater than 0 days");
        return;
      }

      setIsConfirming(false);
      setIsConfirmed(false);

      groveToast.info("Creating circle in database...");

      const dbResponse = await fetch("/api/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          targetAmount: targetAmountWei.toString(),
          ownerWallet: address,
          ownerEmail: user?.email || `${address}@grove.temp`,
          // Grove system fields
          contributionAmount: contributionAmountWei.toString(),
          contributionInterval: formData.contributionInterval,
          durationDays: formData.durationDays,
          isPublic: formData.isPublic,
        }),
      });

      if (!dbResponse.ok) {
        throw new Error("Failed to create circle in database");
      }

      const dbData = await dbResponse.json();
      const databaseCircleId = dbData.databaseId;

      groveToast.info("Circle created in database, deploying to blockchain...");

      setIsCreating(false);

      const txHash = await writeContractAsync({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "createCircle",
        args: [
          formData.name,
          formData.description,
          targetAmountWei,
          contributionAmountWei,
          BigInt(formData.contributionInterval),
          BigInt(formData.durationDays),
          formData.isPublic,
        ],
      });

      setHash(txHash);
      setIsConfirming(true);

      groveToast.info("Transaction sent, waiting for confirmation...");

      const maxRetries = 6;
      let retryCount = 0;

      const checkTransactionAndSync = async (): Promise<void> => {
        try {
          const syncResponse = await fetch(
            `/api/transaction/${txHash}?databaseCircleId=${databaseCircleId}`
          );

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log("Sync response:", syncData);

            if (syncData.synced && syncData.circleId) {
              groveToast.success(
                `Circle "${formData.name}" created successfully!`
              );
              setIsConfirmed(true);

              setIsNavigating(true);

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

              if (onSuccess) {
                setTimeout(() => {
                  onSuccess();
                }, 1000);
              }
              return;
            } else if (retryCount < maxRetries) {
              retryCount++;

              setTimeout(checkTransactionAndSync, 3000);
              return;
            } else {
              throw new Error("Circle created but sync failed after retries");
            }
          } else if (syncResponse.status === 202) {
            const errorData = await syncResponse.json();
            console.log("Transaction not yet mined:", errorData);

            if (retryCount < maxRetries) {
              retryCount++;
              console.log(
                `Retry ${retryCount}/${maxRetries} - transaction not mined yet, waiting...`
              );
              groveToast.info(
                "Transaction submitted, waiting for confirmation..."
              );
              setTimeout(checkTransactionAndSync, 4000);
              return;
            } else {
              throw new Error(
                "Transaction not confirmed after maximum retries"
              );
            }
          } else {
            throw new Error(`Sync API returned error: ${syncResponse.status}`);
          }
        } catch (error) {
          console.error("Sync error:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(
              `Retry ${retryCount}/${maxRetries} due to error:`,
              error
            );
            setTimeout(checkTransactionAndSync, 3000);
          } else {
            setIsConfirming(false);
            groveToast.warning(
              "Circle created but sync failed - please refresh the page"
            );
          }
        }
      };

      setTimeout(checkTransactionAndSync, 2000);
    } catch (error) {
      console.error("Circle creation error:", error);
      groveToast.error(
        "Failed to create circle. Please check your wallet and try again."
      );
      setIsConfirming(false);
      setIsNavigating(false);
      setIsCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Network Check */}
      {isConnected && !isOnCorrectNetwork && (
        <div className='bg-primary/20 border border-primary/30 rounded-lg p-4 animate-fade-in'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-primary'>
                Switch to Citrea Testnet
              </h3>
              <p className='text-xs text-gray-300 mt-1'>
                Grove circles are created on Citrea testnet. Please switch your
                network to continue.
              </p>
            </div>
            <button
              onClick={() => switchChain({ chainId: CITREA_TESTNET.id })}
              className='px-3 py-1 bg-primary hover:bg-primary/90 text-white text-sm rounded transition-all duration-300 hover-lift'
            >
              Switch Network
            </button>
          </div>
        </div>
      )}

      <div className='grid gap-6'>
        <div>
          <label className='block text-sm text-left font-medium text-white mb-2'>
            Circle Name *
          </label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            placeholder='Family Emergency Fund'
            className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300'
            required
          />
        </div>

        <div>
          <label className='block text-sm text-left font-medium text-white mb-2'>
            Description
          </label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            placeholder='Describe the purpose of this savings circle...'
            rows={3}
            className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-400 backdrop-blur-sm resize-none transition-all duration-300'
          />
        </div>

        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Target Amount (BTC) *
            </label>
            <input
              type='number'
              name='targetAmount'
              value={formData.targetAmount}
              onChange={handleInputChange}
              placeholder='0.001'
              step='0.0001'
              min='0'
              className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300'
              required
            />
            {formData.targetAmount && parseFloat(formData.targetAmount) > 0 && (
              <p className='text-xs text-gray-300 mt-1'>
                ≈{" "}
                {formatBtcAmount(formData.targetAmount, {
                  showBoth: false,
                  btcFirst: false,
                })}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Contribution Amount per Payment (BTC) *
            </label>
            <input
              type='number'
              name='contributionAmount'
              value={formData.contributionAmount}
              onChange={handleInputChange}
              placeholder='0.001'
              step='0.0001'
              min='0'
              className='w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500'
              required
            />
            {formData.contributionAmount &&
              parseFloat(formData.contributionAmount) > 0 && (
                <p className='text-xs text-gray-300 mt-1'>
                  ≈{" "}
                  {formatBtcAmount(formData.contributionAmount, {
                    showBoth: false,
                    btcFirst: false,
                  })}{" "}
                  per payment
                </p>
              )}
          </div>

          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Contribution Interval (seconds) *
            </label>
            <select
              name='contributionInterval'
              value={formData.contributionInterval}
              onChange={handleInputChange}
              className='w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
              required
            >
              <option value='86400'>Daily (24 hours)</option>
              <option value='604800'>Weekly (7 days)</option>
              <option value='2592000'>Monthly (30 days)</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Duration (days) *
            </label>
            <input
              type='number'
              name='durationDays'
              value={formData.durationDays}
              onChange={handleInputChange}
              placeholder='30'
              min='1'
              className='w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500'
              required
            />
            <p className='text-xs text-gray-300 mt-1'>
              How long the circle will run (in days)
            </p>
          </div>

          <div>
            <label className='flex items-center text-white'>
              <input
                type='checkbox'
                name='isPublic'
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: e.target.checked,
                  }))
                }
                className='mr-2 text-purple-500 focus:ring-purple-500'
              />
              <span className='text-sm'>
                Make this circle public (others can discover and join)
              </span>
            </label>
          </div>
        </div>

        {/* Transaction Status */}
        {isPending && (
          <div className='bg-trust/20 border border-trust/30 rounded-lg p-4 animate-fade-in'>
            <p className='text-trust text-sm'>
              <strong>Transaction Pending:</strong> Please confirm the
              transaction in your wallet...
            </p>
          </div>
        )}

        {isConfirming && (
          <div className='bg-accent/20 border border-accent/30 rounded-lg p-4 animate-fade-in'>
            <p className='text-accent text-sm'>
              <strong>Confirming:</strong> Waiting for blockchain
              confirmation...
              {hash && (
                <span className='block mt-1 text-xs'>
                  Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
                </span>
              )}
            </p>
          </div>
        )}

        {isNavigating && (
          <div className='bg-trust/20 border border-trust/30 rounded-lg p-4 animate-fade-in'>
            <p className='text-trust text-sm'>
              <strong>Success:</strong> Circle created! Redirecting to
              dashboard...
            </p>
          </div>
        )}

        {/* Error Messages */}
        {writeError && (
          <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4 animate-fade-in'>
            <p className='text-red-200 text-sm'>
              <strong>Error:</strong> {writeError?.message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && (
          <div className='bg-secondary/20 border border-secondary/30 rounded-lg p-4 animate-fade-in'>
            <p className='text-secondary text-sm'>
              <strong>Success!</strong> Your circle has been created
              successfully!
              {hash && (
                <span className='block mt-1 text-xs'>
                  Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
                </span>
              )}
            </p>
          </div>
        )}

        <button
          onClick={createCircle}
          disabled={
            isPending ||
            isCreating ||
            isConfirming ||
            isNavigating ||
            !isConnected ||
            !isOnCorrectNetwork ||
            !formData.name ||
            !formData.targetAmount ||
            !formData.contributionAmount
          }
          className='w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 hover-lift disabled:hover:scale-100 shadow-lg hover:shadow-primary/25'
        >
          {isCreating ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Creating Circle...
            </div>
          ) : isPending ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Creating on Blockchain...
            </div>
          ) : isConfirming ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Confirming Transaction...
            </div>
          ) : isNavigating ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Redirecting to Dashboard...
            </div>
          ) : (
            <div className='flex items-center justify-center'>
              <span className='mr-2'>🌱</span>
              Plant Your Circle
            </div>
          )}
        </button>

        {!isConnected && (
          <div className='text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30 animate-fade-in'>
            <p className='text-sm text-red-200'>
              ⚠️ Please connect your wallet to create a circle
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
