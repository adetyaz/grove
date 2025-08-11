"use client";
import { useState } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { achievementNFTContract } from "@/lib/achievementnft-contract";

interface AchievementFormProps {
  circleId: number;
  circleName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function AchievementForm({
  circleId: _circleId, // eslint-disable-line @typescript-eslint/no-unused-vars
  circleName,
  onSuccess,
  onClose,
}: AchievementFormProps) {
  const [achievementId, setAchievementId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<any>(null);
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementId || !address) {
      groveToast.error(
        "Please enter a valid achievement ID and ensure wallet is connected"
      );
      return;
    }
    try {
      setIsLoading(true);
      setIsPending(true);
      setError(null);
      setIsConfirming(false);

      // Claim the achievement using the AchievementNFT contract
      await achievementNFTContract.claimAchievement(
        parseInt(achievementId),
        address as `0x${string}`
      );

      setIsConfirming(true);

      // Wait for confirmation and then offer Farcaster sharing
      setTimeout(async () => {
        setIsConfirming(false);
        setIsPending(false);
        setIsLoading(false);

        // Get achievement metadata and offer Farcaster sharing
        try {
          const achievement =
            await achievementNFTContract.getAchievementMetadata(
              parseInt(achievementId)
            );
          const farcasterUrl = achievementNFTContract.generateFarcasterShareUrl(
            achievement,
            address
          );

          // Show success message
          groveToast.success(`🏅 Achievement "${achievement.name}" claimed!`);

          // Show Farcaster sharing option after a brief delay
          setTimeout(() => {
            if (
              window.confirm(
                "🎉 Achievement claimed! Would you like to share this on Farcaster?"
              )
            ) {
              window.open(farcasterUrl, "_blank");
            }
          }, 1000);
        } catch (err) {
          console.error("Failed to get achievement metadata:", err);
          groveToast.success(`Achievement ${achievementId} claimed!`);
        }

        onSuccess?.();
        onClose?.();
      }, 3000);
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      setIsPending(false);
      groveToast.error("Failed to claim achievement. Please try again.");
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🏅</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Claim Achievement
          </h2>
          <p className='text-gray-300'>
            Claim an achievement in &ldquo;{circleName}&rdquo;
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Achievement ID
            </label>
            <input
              type='text'
              value={achievementId}
              onChange={(e) => setAchievementId(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='e.g. 1'
              required
            />
          </div>
          {error && (
            <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
              <p className='text-red-200 text-sm'>Error: {error.message}</p>
            </div>
          )}
          <div className='flex space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
              disabled={isPending || isConfirming || isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={
                !achievementId || isPending || isConfirming || isLoading
              }
              className='flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
            >
              {isPending || isConfirming || isLoading
                ? "Claiming..."
                : "Claim Achievement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
