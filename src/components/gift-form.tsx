"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { giftEngineContract } from "@/lib/giftengine-contract";
import { formatBtcAmount } from "@/lib/btc-conversion";

interface GiftFormProps {
  circleId: number;
  circleName: string;
  contributionAmount: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function GiftForm({
  circleId,
  circleName,
  contributionAmount,
  onSuccess,
  onClose,
}: GiftFormProps) {
  const amount = contributionAmount;
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const { primaryWallet, user } = useDynamicConnection();
  const address = primaryWallet?.address;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!amount || !address) {
        throw new Error(
          "Please enter a valid amount and ensure wallet is connected"
        );
      }

      const parsedAmount = parseEther(amount);
      if (parsedAmount === BigInt(0)) {
        throw new Error("Gift amount must be greater than 0");
      }

      console.log("Gift amount:", {
        original: amount,
        parsed: parsedAmount.toString(),
        inWei: parsedAmount,
      });

      // Create escrow gift for email recipients
      const parsedAmountEscrow = parseEther(amount);
      console.log("Creating escrow gift:", {
        circleId,
        recipient: address,
        amount: parsedAmountEscrow.toString(),
        message: message || "A gift from Grove!",
        expirationDays: 30,
      });

      const escrowParams = {
        circleId,
        recipient: address as `0x${string}`,
        amount: parsedAmountEscrow,
        message: message || "A gift from Grove!",
        expirationDays: 30,
      };

      const escrowResult = await giftEngineContract.createEscrowGift(
        escrowParams,
        address as `0x${string}`
      );

      // Create the gift claim invite record
      const claimResponse = await fetch(
        "/api/gifts/" + escrowResult.giftId + "/send-email-invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail,
            senderAddress: address,
            senderName:
              user?.email || `${address.slice(0, 6)}...${address.slice(-4)}`,
            circleId: circleId.toString(),
            circleName,
            amount,
            message: message || "A gift from Grove!",
            occasion: "Circle Gift",
          }),
        }
      );

      if (!claimResponse.ok) {
        throw new Error("Failed to create email invite");
      }

      return {
        type: "escrow",
        hash: escrowResult.hash,
        giftId: escrowResult.giftId,
        recipientEmail,
      };
    },
    onSuccess: (result) => {
      groveToast.success(
        `🎁 Gift email sent to ${result.recipientEmail}! They can claim it within 30 days.`
      );

      fetch("/api/activity/track-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: address,
          recipientAddress: "ESCROW",
          circleId: circleId.toString(),
          amount,
          txHash: result.hash,
          message: message || "A gift from Grove!",
          circleName,
        }),
      }).catch(console.error);

      onSuccess?.();
    },
    onError: (err: any) => {
      console.error("Gift error:", err);
      let errorMessage = "Failed to send gift";

      if (
        err.message?.includes("User denied") ||
        err.message?.includes("not been authorized")
      ) {
        errorMessage =
          "Transaction was rejected by user. Please approve the transaction in your wallet to send the gift.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet to send this gift.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      groveToast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-gray-900/95 backdrop-blur-md border border-pink-500/30 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='p-6 pb-4 border-b border-gray-700/50 shrink-0'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>🎁</span>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>Send a Gift</h2>
            <p className='text-gray-300'>
              Send a gift in &ldquo;{circleName}&rdquo;
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto custom-scrollbar p-6 pt-4'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Recipient Email Address
              </label>
              <input
                type='email'
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                placeholder='recipient@example.com'
                required
              />
              <p className='text-xs text-gray-400 mt-1'>
                Gift will be held in escrow for 30 days. Recipient gets a secure
                claim link via email.
              </p>
            </div>

            {/* Gift Amount Display - Simple fixed amount */}
            <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-300'>
                  Gift Amount
                </span>
                <span className='text-lg font-bold text-white'>
                  {amount} BTC
                </span>
              </div>
              <p className='text-xs text-gray-400'>
                Standard gift amount from your circle
              </p>
              {parseFloat(amount) > 0 && (
                <p className='text-xs text-gray-300 mt-1'>
                  ≈{" "}
                  {formatBtcAmount(amount, {
                    showBoth: false,
                    btcFirst: false,
                  })}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none'
                placeholder='Add a personal message...'
                rows={3}
                maxLength={200}
              />
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
                disabled={!amount || !recipientEmail || mutation.isPending}
                className='flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
              >
                {mutation.isPending ? "Sending Gift..." : "Send Gift"}
              </button>
            </div>
          </form>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar {
            /* Firefox */
            scrollbar-width: thin;
            scrollbar-color: #ec4899 rgba(255, 255, 255, 0.1);
          }

          /* Webkit browsers (Chrome, Safari, Edge) */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
            margin: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(145deg, #ec4899, #be185d);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(145deg, #f97316, #ea580c);
            transform: scale(1.1);
            transition: all 0.2s ease;
          }
        `}</style>
      </div>
    </div>
  );
}
