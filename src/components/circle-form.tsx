"use client";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import {
  CITREA_TESTNET,
  GROVE_CONTRACT_ADDRESS,
  GROVE_ABI,
} from "@/contracts/constants";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { formatBtcAmount } from "@/lib/btc-conversion";
import { PUNISHMENT_PRESETS } from "@/lib/punishment-system";

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
    paymentType: 0,
    fixedAmount: "",
    frequency: "MONTHLY",
    deadline: "",
    hasDeadline: true, // New field to control deadline requirement
    punishmentPreset: "MODERATE" as keyof typeof PUNISHMENT_PRESETS,
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
      const fixedAmountWei = formData.fixedAmount
        ? parseEther(formData.fixedAmount)
        : BigInt(0);

      // Deadline validation based on payment type
      let deadlineTimestamp = BigInt(0); // Default to no deadline (0)

      if (formData.paymentType === 0) {
        // One-time payments: Deadline is REQUIRED
        if (!formData.deadline) {
          groveToast.error("One-time payment circles must have a deadline");
          return;
        }
        deadlineTimestamp = BigInt(
          Math.floor(new Date(formData.deadline).getTime() / 1000)
        );
        if (deadlineTimestamp <= BigInt(Math.floor(Date.now() / 1000))) {
          groveToast.error("Deadline must be in the future");
          return;
        }
      } else if (formData.paymentType === 1) {
        // Recurring payments: Deadline is OPTIONAL
        if (formData.hasDeadline && formData.deadline) {
          deadlineTimestamp = BigInt(
            Math.floor(new Date(formData.deadline).getTime() / 1000)
          );
          if (deadlineTimestamp <= BigInt(Math.floor(Date.now() / 1000))) {
            groveToast.error("Deadline must be in the future");
            return;
          }
        } else if (formData.hasDeadline && !formData.deadline) {
          groveToast.error("Please set a deadline or choose 'No Deadline'");
          return;
        }
        // If hasDeadline is false, deadlineTimestamp stays 0 (no deadline)
      }

      if (targetAmountWei <= 0) {
        groveToast.error("Target amount must be greater than 0");
        return;
      }
      if (
        formData.paymentType === 1 &&
        (!formData.fixedAmount || parseFloat(formData.fixedAmount) <= 0)
      ) {
        groveToast.error("Recurring amount must be greater than 0");
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
          paymentType: formData.paymentType,
          fixedAmount: fixedAmountWei.toString(),
          frequency: formData.frequency,
          deadline: deadlineTimestamp.toString(),
          ownerWallet: address,
          ownerEmail: user?.email || `${address}@grove.temp`,
          punishmentPreset: formData.punishmentPreset,
        }),
      });

      if (!dbResponse.ok) {
        throw new Error("Failed to create circle in database");
      }

      const dbData = await dbResponse.json();
      const databaseCircleId = dbData.databaseId;

      groveToast.info("Circle created in database, deploying to blockchain...");

      const contributionAmount = BigInt(1);
      const interval = BigInt(86400);
      const goal = targetAmountWei;

      setIsCreating(false);

      const txHash = await writeContractAsync({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "createCircle",
        args: [formData.name, contributionAmount, interval, goal],
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

              // Auto-enable voting for recurring circles
              if (formData.paymentType === 1) {
                // 1 = RECURRING
                try {
                  groveToast.info(
                    "Enabling democratic voting for recurring circle..."
                  );

                  const { votingModuleService } = await import(
                    "@/lib/voting-module-contract"
                  );

                  // Enable voting with delegation
                  const enableHash =
                    await votingModuleService.enableVotingWithDelegation(
                      syncData.circleId,
                      address as `0x${string}`
                    );
                  console.log("✅ Voting enabled for circle:", enableHash);

                  // Deposit escrow for voting operations
                  const escrowHash = await votingModuleService.depositEscrow(
                    syncData.circleId,
                    "0.1", // 0.1 ETH
                    address as `0x${string}`
                  );
                  console.log("✅ Escrow deposited for voting:", escrowHash);

                  groveToast.success(
                    `Circle created with democratic voting enabled!`
                  );
                } catch (votingError: any) {
                  console.error("Failed to enable voting:", votingError);
                  groveToast.warning(
                    `Circle created successfully, but voting enablement failed. You can enable it later from the circle page.`
                  );
                }
              }

              setIsNavigating(true);

              setFormData({
                name: "",
                description: "",
                targetAmount: "",
                paymentType: 0,
                fixedAmount: "",
                frequency: "MONTHLY",
                deadline: "",
                hasDeadline: true,
                punishmentPreset: "MODERATE" as keyof typeof PUNISHMENT_PRESETS,
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
              Payment Type *
            </label>
            <select
              name='paymentType'
              value={formData.paymentType}
              onChange={handleInputChange}
              className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white backdrop-blur-sm transition-all duration-300'
            >
              <option value={0} className='bg-gray-800 text-white'>
                One-Time Payment
              </option>
              <option value={1} className='bg-gray-800 text-white'>
                Recurring Payments
              </option>
            </select>
          </div>
        </div>

        {formData.paymentType === 1 && (
          <div className='bg-blue-500/20 border-2 border-purple-500 rounded-lg p-6 space-y-4'>
            <h3 className='text-purple-300 font-bold text-lg'>
              Recurring Payment Settings
            </h3>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Payment Frequency *
              </label>
              <select
                name='frequency'
                value={formData.frequency}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                required
              >
                <option value='DAILY'>Daily</option>
                <option value='WEEKLY'>Weekly</option>
                <option value='MONTHLY'>Monthly</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Contribution Amount per Payment (BTC) *
              </label>
              <input
                type='number'
                name='fixedAmount'
                value={formData.fixedAmount}
                onChange={handleInputChange}
                placeholder='0.001'
                step='0.0001'
                min='0'
                className='w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500'
                required
              />
              {formData.fixedAmount && parseFloat(formData.fixedAmount) > 0 && (
                <p className='text-xs text-gray-300 mt-1'>
                  ≈{" "}
                  {formatBtcAmount(formData.fixedAmount, {
                    showBoth: false,
                    btcFirst: false,
                  })}{" "}
                  per payment
                </p>
              )}
              <p className='text-xs text-gray-300 mt-2 flex items-center'>
                <span className='mr-1'>🔄</span>
                This amount will be contributed{" "}
                {formData.frequency.toLowerCase()} by each member
              </p>
            </div>
          </div>
        )}

        {/* Goal Deadline Controls - Compulsory for One-Time, Optional for Recurring */}
        {formData.paymentType === 0 ? (
          // One-Time Payments: Deadline is COMPULSORY
          <div className='bg-green-500/20 border-2 border-green-500 rounded-lg p-6 space-y-4'>
            <h3 className='text-green-300 font-bold text-lg'>
              💰 One-Time Payment Settings
            </h3>

            <div>
              <label className='block text-sm text-left font-medium text-white mb-2'>
                Goal Deadline *
              </label>
              <input
                type='datetime-local'
                name='deadline'
                value={formData.deadline}
                onChange={handleInputChange}
                className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white backdrop-blur-sm transition-all duration-300'
                required
              />
              <p className='text-xs text-gray-300 mt-1'>
                Set payment deadlines
              </p>
            </div>
          </div>
        ) : (
          // Recurring Payments: Deadline is OPTIONAL
          <div className='bg-blue-500/20 border-2 border-blue-500 rounded-lg p-6 space-y-4'>
            <h3 className='text-blue-300 font-bold text-lg'>
              ⏰ Recurring Payment Deadline (Optional)
            </h3>

            <div>
              <label className='block text-sm text-left font-medium text-white mb-3'>
                Goal Deadline
              </label>

              {/* Deadline Option Toggle for Recurring Only */}
              <div className='flex space-x-4 mb-4'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='hasDeadline'
                    checked={formData.hasDeadline === true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, hasDeadline: true }))
                    }
                    className='mr-2 text-primary focus:ring-primary'
                  />
                  <span className='text-white text-sm'>Set deadline</span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='hasDeadline'
                    checked={formData.hasDeadline === false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        hasDeadline: false,
                        deadline: "",
                      }))
                    }
                    className='mr-2 text-primary focus:ring-primary'
                  />
                  <span className='text-white text-sm'>No deadline</span>
                </label>
              </div>

              {/* Deadline Input (only shown if hasDeadline is true) */}
              {formData.hasDeadline && (
                <input
                  type='datetime-local'
                  name='deadline'
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white backdrop-blur-sm transition-all duration-300'
                  required={formData.hasDeadline}
                />
              )}

              {!formData.hasDeadline && (
                <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-3'>
                  <p className='text-blue-200 text-sm flex items-center'>
                    <span className='mr-2'>∞</span>
                    This recurring circle will run indefinitely without a
                    deadline
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Punishment Settings Section - Only for recurring payments */}
        {formData.paymentType === 1 && (
          <div className='bg-orange-500/20 border-2 border-orange-500 rounded-lg p-6 space-y-4'>
            <h3 className='text-orange-300 font-bold text-lg flex items-center'>
              ⚖️ Missed Payment Policy
            </h3>
            <div className='text-orange-100 text-sm space-y-1'>
              <p>
                What happens when someone misses their scheduled recurring
                payment?
              </p>
              <p className='text-orange-200'>
                Choose how strict you want to be with members who don&apos;t pay
                on time.
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-3'>
                Choose Enforcement Level *
              </label>
              <div className='space-y-3'>
                {Object.entries(PUNISHMENT_PRESETS).map(([key, preset]) => {
                  const isSelected = formData.punishmentPreset === key;
                  return (
                    <div
                      key={key}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/20"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          punishmentPreset:
                            key as keyof typeof PUNISHMENT_PRESETS,
                        })
                      }
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2 mb-2'>
                            <input
                              type='radio'
                              name='punishmentPreset'
                              value={key}
                              checked={isSelected}
                              onChange={handleInputChange}
                              className='text-orange-500'
                            />
                            <h4 className='font-semibold text-white'>
                              {preset.name}
                            </h4>
                          </div>
                          {preset.enabled ? (
                            <div className='text-sm text-gray-300 space-y-1'>
                              <p>
                                📝 {preset.maxWarnings} warning
                                {preset.maxWarnings !== 1 ? "s" : ""} for missed
                                payments (just logged)
                              </p>
                              <p>
                                💰 Then{" "}
                                {((preset.penaltyMultiplier - 1) * 100).toFixed(
                                  0
                                )}
                                % extra fee on each missed payment
                              </p>
                              <p>
                                ⏸️ Auto-disable payments after{" "}
                                {preset.autoSuspendAfter} failures (can be
                                re-enabled)
                              </p>
                              {preset.autoSuspendAfter <= 3 &&
                              !preset.allowAppeals ? (
                                <p>
                                  🚫 Get kicked out of circle (no appeals
                                  allowed)
                                </p>
                              ) : (
                                <p>📋 Can appeal suspensions to rejoin</p>
                              )}
                            </div>
                          ) : (
                            <p className='text-sm text-gray-300'>
                              😌 No consequences for missed payments
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
            // One-time payments always need deadline, recurring only if hasDeadline is true
            (formData.paymentType === 0 && !formData.deadline) ||
            (formData.paymentType === 1 &&
              formData.hasDeadline &&
              !formData.deadline) ||
            (formData.paymentType === 1 && !formData.fixedAmount)
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
