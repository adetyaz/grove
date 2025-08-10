"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

interface GiftDetails {
  id: string;
  senderName: string;
  senderAddress: string;
  amount: string;
  message?: string;
  occasion?: string;
  circleName: string;
  expiresAt: string;
}

interface ClaimPageProps {
  params: { token: string };
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const { token } = params;
  const router = useRouter();
  const { primaryWallet, user } = useDynamicConnection();
  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify claim token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/claim/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify claim token");
        }

        setGiftDetails(data.giftDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load gift details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const processClaim = async () => {
    if (!primaryWallet || !giftDetails) {
      groveToast.error("Please connect your wallet to claim this gift");
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      const response = await fetch(`/api/claim/${token}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: primaryWallet.address,
          userEmail: user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process gift claim");
      }

      groveToast.success(
        `🎉 Gift claimed successfully! ${giftDetails.amount} BTC from ${giftDetails.senderName}`
      );

      // Redirect to dashboard after successful claim
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim gift");
      groveToast.error("Failed to claim gift. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full text-center'>
          <div className='animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4'></div>
          <h2 className='text-xl font-bold text-white mb-2'>
            Loading your gift...
          </h2>
          <p className='text-gray-300'>Verifying claim details</p>
        </div>
      </div>
    );
  }

  if (error && !giftDetails) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/50 max-w-md w-full text-center'>
          <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>❌</span>
          </div>
          <h2 className='text-xl font-bold text-white mb-2'>Claim Error</h2>
          <p className='text-red-300 mb-6'>{error}</p>
          <button
            onClick={() => router.push("/")}
            className='w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors'
          >
            Go to Grove Home
          </button>
        </div>
      </div>
    );
  }

  if (!giftDetails) return null;

  const timeUntilExpiry =
    new Date(giftDetails.expiresAt).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60 * 60)));

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-lg w-full overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-center'>
          <div className='text-6xl mb-4'>🎁</div>
          <h1 className='text-2xl font-bold text-white mb-2'>
            You Have a Gift!
          </h1>
          <p className='text-orange-100'>
            Someone sent you Bitcoin through Grove
          </p>
        </div>

        {/* Gift Details */}
        <div className='p-8'>
          <div className='bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-xl p-6 mb-6'>
            <div className='text-center'>
              <h2 className='text-3xl font-bold text-orange-400 mb-2'>
                {giftDetails.amount} BTC
              </h2>
              <p className='text-gray-300 mb-1'>
                From{" "}
                <span className='font-semibold text-white'>
                  {giftDetails.senderName}
                </span>
              </p>
              <p className='text-gray-400 text-sm'>
                in &ldquo;{giftDetails.circleName}&rdquo; circle
              </p>
              {giftDetails.occasion && (
                <p className='text-pink-300 text-sm mt-2'>
                  For your {giftDetails.occasion}
                </p>
              )}
            </div>
          </div>

          {/* Personal Message */}
          {giftDetails.message && (
            <div className='bg-white/5 border border-white/10 rounded-lg p-4 mb-6'>
              <h3 className='text-white font-semibold mb-2 flex items-center'>
                <span className='mr-2'>💌</span>
                Personal Message
              </h3>
              <p className='text-gray-300 italic'>
                &ldquo;{giftDetails.message}&rdquo;
              </p>
            </div>
          )}

          {/* Expiry Warning */}
          {hoursLeft < 24 && (
            <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6'>
              <div className='flex items-center text-yellow-300'>
                <span className='text-xl mr-2'>⏰</span>
                <div>
                  <p className='font-semibold'>Claim Soon!</p>
                  <p className='text-sm'>
                    This gift expires in {hoursLeft} hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <div className='space-y-4'>
            <h3 className='text-white font-semibold'>
              Connect your wallet to claim:
            </h3>

            {!primaryWallet ? (
              <div className='space-y-4'>
                <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-4'>
                  <p className='text-blue-300 text-sm mb-3'>
                    <strong>Login options:</strong> Use the email this was sent
                    to, or connect via social media
                  </p>
                </div>
                <DynamicWidget />
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='bg-green-500/10 border border-green-500/30 rounded-lg p-4'>
                  <p className='text-green-300 text-sm'>
                    ✅ Connected: {primaryWallet.address.slice(0, 6)}...
                    {primaryWallet.address.slice(-4)}
                  </p>
                  {user?.email && (
                    <p className='text-green-300 text-sm'>
                      Email: {user.email}
                    </p>
                  )}
                </div>

                <button
                  onClick={processClaim}
                  disabled={claiming}
                  className='w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center'
                >
                  {claiming ? (
                    <>
                      <div className='animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2'></div>
                      Claiming Gift...
                    </>
                  ) : (
                    <>🎁 Claim My Gift</>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-4'>
                <p className='text-red-300 text-sm'>{error}</p>
              </div>
            )}
          </div>

          {/* What is Grove */}
          <div className='bg-white/5 border border-white/10 rounded-lg p-4 mt-6'>
            <h3 className='text-white font-semibold mb-2 flex items-center'>
              <span className='mr-2'>🌳</span>
              What is Grove?
            </h3>
            <p className='text-gray-300 text-sm'>
              Grove empowers communities to grow their Bitcoin savings together.
              Create circles with family and friends, track shared goals, and
              build financial security on Bitcoin&apos;s most advanced Layer 2.
            </p>
            <p className='text-orange-300 text-sm mt-2 font-semibold'>
              Your gift is just the beginning! Join Grove to start your own
              savings journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
