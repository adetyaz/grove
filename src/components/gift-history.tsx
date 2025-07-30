"use client";
import { useQuery } from "@tanstack/react-query";
import {
  giftEngineContract,
  formatGiftAmount,
} from "@/lib/giftengine-contract";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";

interface GiftHistoryProps {
  circleId: number;
  className?: string;
}

export default function GiftHistory({
  circleId,
  className = "",
}: GiftHistoryProps) {
  const { primaryWallet } = useDynamicConnection();
  const userAddress = primaryWallet?.address;

  const {
    data: gifts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gifts", circleId],
    queryFn: () => giftEngineContract.getCircleGifts(circleId),
    refetchInterval: 30000,
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return `${message.slice(0, maxLength)}...`;
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <h3 className='text-lg font-semibold text-white mb-4'>Gift History</h3>
        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-white/5 rounded-lg p-4 animate-pulse'>
              <div className='h-4 bg-white/10 rounded w-3/4 mb-2'></div>
              <div className='h-3 bg-white/10 rounded w-1/2'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <h3 className='text-lg font-semibold text-white mb-4'>Gift History</h3>
        <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
          <p className='text-red-200 text-sm'>
            Failed to load gift history:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <h3 className='text-lg font-semibold text-white mb-4'>Gift History</h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50'>
            <span className='text-2xl'>🎁</span>
          </div>
          <p className='text-gray-400'>No gifts sent in this circle yet</p>
          <p className='text-gray-500 text-sm mt-1'>
            Be the first to spread some joy!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <h3 className='text-lg font-semibold text-white mb-4'>
        Gift History ({gifts.length})
      </h3>
      <div className='space-y-3 max-h-96 overflow-y-auto'>
        {gifts.map((gift, index) => (
          <div
            key={`${gift.transactionHash}-${index}`}
            className='bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors'
          >
            <div className='flex items-start justify-between mb-2'>
              <div className='flex items-center space-x-2'>
                <span className='text-lg'>🎁</span>
                <div>
                  <div className='flex items-center space-x-2 text-sm'>
                    <span
                      className={`font-medium ${
                        gift.from.toLowerCase() === userAddress?.toLowerCase()
                          ? "text-pink-400"
                          : "text-gray-300"
                      }`}
                    >
                      {gift.from.toLowerCase() === userAddress?.toLowerCase()
                        ? "You"
                        : truncateAddress(gift.from)}
                    </span>
                    <span className='text-gray-400'>→</span>
                    <span
                      className={`font-medium ${
                        gift.to.toLowerCase() === userAddress?.toLowerCase()
                          ? "text-green-400"
                          : "text-gray-300"
                      }`}
                    >
                      {gift.to.toLowerCase() === userAddress?.toLowerCase()
                        ? "You"
                        : truncateAddress(gift.to)}
                    </span>
                  </div>
                  {gift.message && gift.message !== "A gift from Grove!" && (
                    <p className='text-gray-400 text-xs mt-1'>
                      &ldquo;{truncateMessage(gift.message)}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <div className='text-right'>
                <div className='text-pink-400 font-semibold'>
                  {formatGiftAmount(gift.amount)} BTC
                </div>
                <div className='text-gray-500 text-xs'>
                  {formatDate(gift.timestamp)}
                </div>
              </div>
            </div>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>Tx: {truncateAddress(gift.transactionHash)}</span>
              {(gift.from.toLowerCase() === userAddress?.toLowerCase() ||
                gift.to.toLowerCase() === userAddress?.toLowerCase()) && (
                <span className='text-pink-400'>
                  {gift.from.toLowerCase() === userAddress?.toLowerCase()
                    ? "Sent"
                    : "Received"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
