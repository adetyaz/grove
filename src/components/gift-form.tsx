"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { giftEngineContract } from "@/lib/giftengine-contract";

interface GiftFormProps {
  circleId: number;
  circleName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function GiftForm({
  circleId,
  circleName,
  onSuccess,
  onClose,
}: GiftFormProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!amount || !recipient || !address) {
        throw new Error(
          "Please enter a valid amount, recipient, and ensure wallet is connected"
        );
      }

      const giftParams = {
        circleId,
        to: recipient as `0x${string}`,
        amount: parseEther(amount),
        message: message || "A gift from Grove!",
      };

      const result = await giftEngineContract.sendGift(
        giftParams,
        address as `0x${string}`
      );

      return result;
    },
    onSuccess: (result) => {
      groveToast.success(`Gift of ${amount} BTC sent successfully!`);

      fetch("/api/activity/track-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: address,
          recipientAddress: recipient,
          circleId: circleId.toString(),
          amount,
          txHash: result.hash,
          message: message || "A gift from Grove!",
          circleName,
        }),
      }).catch(console.error);

      console.log("Gift sent:", result);
      onSuccess?.();
      onClose?.();
    },
    onError: (err: any) => {
      groveToast.error(`Failed to send gift. ${err.message || err.toString()}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🎁</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>Send a Gift</h2>
          <p className='text-gray-300'>
            Send a gift in &ldquo;{circleName}&rdquo;
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Recipient Address
            </label>
            <input
              type='text'
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              placeholder='0x...'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Gift Amount (BTC)
            </label>
            <input
              type='number'
              step='0.00001'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              placeholder='0.001'
              required
            />
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
              disabled={!amount || !recipient || mutation.isPending}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
            >
              {mutation.isPending ? "Sending..." : "Send Gift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
