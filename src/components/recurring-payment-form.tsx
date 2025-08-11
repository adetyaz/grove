"use client";

import { useState, useEffect, useCallback } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { formatBtcAmount } from "@/lib/btc-conversion";

interface RecurringPaymentFormProps {
  circleId: string;
  circleName: string;
  onClose?: () => void;
}

interface PaymentSchedule {
  id: string;
  circleId: string;
  amount: string;
  frequency: string;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  isActive: boolean;
  totalPayments: number;
  maxPayments?: number;
  circle: {
    name: string;
    targetAmount: string;
  };
  payments: Array<{
    id: string;
    status: string;
    transactionHash?: string;
    scheduledFor: string;
    processedAt?: string;
  }>;
}

export default function RecurringPaymentForm({
  circleId,
  circleName,
  onClose,
}: RecurringPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("WEEKLY");
  const [maxPayments, setMaxPayments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [showExisting, setShowExisting] = useState(false);

  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const fetchSchedules = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `/api/payments/schedule?userAddress=${address}`
      );
      const data = await response.json();

      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  }, [address]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      groveToast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      groveToast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          circleId,
          amount: parseFloat(amount),
          frequency,
          maxPayments: maxPayments ? parseInt(maxPayments) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        groveToast.success("Recurring payment scheduled!");
        setAmount("");
        setMaxPayments("");
        fetchSchedules();
      } else {
        groveToast.error(data.error || "Failed to schedule payment");
      }
    } catch (err) {
      console.error("Error scheduling payment:", err);
      groveToast.error("Failed to schedule recurring payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(
        `/api/payments/schedule?scheduleId=${scheduleId}&userAddress=${address}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        groveToast.success("Recurring payment cancelled");
        fetchSchedules();
      } else {
        groveToast.error(data.error || "Failed to cancel payment");
      }
    } catch (err) {
      console.error("Error cancelling payment:", err);
      groveToast.error("Failed to cancel recurring payment");
    }
  };

  const formatAmount = (amountWei: string) => {
    // Convert from wei back to BTC for display with USD equivalent
    const btc = parseFloat(amountWei) / 1e18;
    return formatBtcAmount(btc, {
      showBoth: true,
      btcFirst: true,
      precision: 8,
    });
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      default:
        return freq;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-400";
      case "FAILED":
        return "text-red-400";
      case "PENDING":
        return "text-yellow-400";
      case "PROCESSING":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl w-full h-fit max-h-[85vh] flex flex-col'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🔄</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Recurring Payments
          </h2>
          <p className='text-gray-300'>
            Set up automatic contributions to &ldquo;{circleName}&rdquo;
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className='flex space-x-1 mb-6 bg-white/5 rounded-lg p-1'>
          <button
            onClick={() => setShowExisting(false)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              !showExisting
                ? "bg-purple-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            New Schedule
          </button>
          <button
            onClick={() => setShowExisting(true)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              showExisting
                ? "bg-purple-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            My Schedules ({schedules.length})
          </button>
        </div>

        {!showExisting ? (
          /* New Schedule Form */
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Amount per Payment (BTC)
              </label>
              <input
                type='number'
                step='0.0001'
                min='0'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='0.001'
                required
              />
              {amount && parseFloat(amount) > 0 && (
                <p className='text-xs text-gray-300 mt-1'>
                  ≈{" "}
                  {formatBtcAmount(amount, {
                    showBoth: false,
                    btcFirst: false,
                  })}{" "}
                  per payment
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
              >
                <option value='DAILY'>Daily</option>
                <option value='WEEKLY'>Weekly</option>
                <option value='MONTHLY'>Monthly</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Max Payments (Optional)
              </label>
              <input
                type='number'
                min='1'
                value={maxPayments}
                onChange={(e) => setMaxPayments(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='Leave empty for unlimited'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Limit the number of automatic payments
              </p>
            </div>

            {/* Preview */}
            {amount && (
              <div className='bg-purple-500/20 border border-purple-500/30 rounded-lg p-4'>
                <h3 className='text-purple-200 font-semibold mb-2'>Preview</h3>
                <p className='text-purple-100 text-sm'>
                  {formatAmount((parseFloat(amount) * 1e18).toString())} BTC{" "}
                  {getFrequencyLabel(frequency).toLowerCase()}
                  {maxPayments && ` for ${maxPayments} payments`}
                </p>
                <p className='text-purple-200 text-xs mt-1'>
                  Next payment:{" "}
                  {new Date(
                    Date.now() +
                      (frequency === "DAILY"
                        ? 86400000
                        : frequency === "WEEKLY"
                        ? 604800000
                        : 2592000000)
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className='flex space-x-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={!amount || isLoading}
                className='flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors'
              >
                {isLoading ? "Scheduling..." : "Schedule Payments"}
              </button>
            </div>
          </form>
        ) : (
          /* Existing Schedules */
          <div className='space-y-4'>
            {schedules.length === 0 ? (
              <div className='text-center py-8'>
                <div className='w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-2xl'>📅</span>
                </div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  No Schedules
                </h3>
                <p className='text-gray-300'>
                  You haven&apos;t set up any recurring payments yet.
                </p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className='bg-white/5 border border-white/10 rounded-lg p-6'
                >
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <h3 className='font-semibold text-white'>
                        {schedule.circle.name}
                      </h3>
                      <p className='text-gray-300 text-sm'>
                        {formatAmount(schedule.amount)} BTC{" "}
                        {getFrequencyLabel(schedule.frequency).toLowerCase()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.isActive
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm mb-4'>
                    <div>
                      <span className='text-gray-400'>Next Payment:</span>
                      <p className='text-white'>
                        {new Date(
                          schedule.nextPaymentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className='text-gray-400'>Total Payments:</span>
                      <p className='text-white'>
                        {schedule.totalPayments}
                        {schedule.maxPayments && ` / ${schedule.maxPayments}`}
                      </p>
                    </div>
                  </div>

                  {/* Recent Payments */}
                  {schedule.payments.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='text-gray-300 text-sm font-medium mb-2'>
                        Recent Payments
                      </h4>
                      <div className='space-y-1'>
                        {schedule.payments.slice(0, 3).map((payment) => (
                          <div
                            key={payment.id}
                            className='flex justify-between items-center text-xs'
                          >
                            <span
                              className={`${getStatusColor(
                                payment.status
                              )} font-medium`}
                            >
                              {payment.status}
                            </span>
                            <span className='text-gray-400'>
                              {new Date(
                                payment.scheduledFor
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {schedule.isActive && (
                    <button
                      onClick={() => handleCancelSchedule(schedule.id)}
                      className='w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-semibold transition-colors text-sm'
                    >
                      Cancel Schedule
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
