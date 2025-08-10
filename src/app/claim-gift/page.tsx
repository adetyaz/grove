"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { BtcDisplay } from "@/components/btc-display";

export default function ClaimGiftPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { primaryWallet, connect } = useDynamicConnection();

  const [giftDetails, setGiftDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (token) {
      // Fetch actual gift details from API
      const fetchGiftDetails = async () => {
        try {
          const response = await fetch(`/api/gifts/${token}`);

          if (!response.ok) {
            if (response.status === 410) {
              // Gift has expired
              setGiftDetails({ error: "expired" });
            } else if (response.status === 400) {
              // Invalid token
              setGiftDetails({ error: "invalid" });
            } else {
              // Other error
              setGiftDetails({ error: "failed" });
            }
            setLoading(false);
            return;
          }

          const data = await response.json();

          if (data.success && data.gift) {
            setGiftDetails(data.gift);
          } else {
            setGiftDetails({ error: "invalid" });
          }
        } catch (error) {
          console.error("Error fetching gift details:", error);
          setGiftDetails({ error: "failed" });
        } finally {
          setLoading(false);
        }
      };

      fetchGiftDetails();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleClaimGift = async () => {
    if (!primaryWallet?.address) {
      await connect();
      return;
    }

    setClaiming(true);
    try {
      groveToast.info("Claiming your gift...");

      // Call the actual claim API
      const response = await fetch(`/api/gifts/${token}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: primaryWallet.address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to claim gift");
      }

      const result = await response.json();

      groveToast.success(`Successfully claimed ${result.amount} BTC!`);

      // Mark gift as claimed in local state
      setGiftDetails((prev: any) => ({
        ...prev,
        status: "CLAIMED",
        claimedAt: result.claimedAt,
        txHash: result.txHash,
      }));
    } catch (error: any) {
      console.error("Claim error:", error);
      groveToast.error(`Failed to claim gift: ${error.message}`);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-white'>Loading gift details...</p>
        </div>
      </div>
    );
  }

  if (!token || !giftDetails || giftDetails.error) {
    const getErrorContent = () => {
      if (!token) {
        return {
          icon: "❌",
          title: "Invalid Gift Link",
          message:
            "This gift link is invalid or may have expired. Please check your email for the correct link.",
        };
      }

      switch (giftDetails?.error) {
        case "expired":
          return {
            icon: "⏰",
            title: "Gift Expired",
            message:
              "This gift has expired and can no longer be claimed. Gifts expire after 7 days.",
          };
        case "invalid":
          return {
            icon: "❌",
            title: "Invalid Gift Token",
            message:
              "This gift token is invalid or has been corrupted. Please check your email for the correct link.",
          };
        case "failed":
          return {
            icon: "🔧",
            title: "Service Unavailable",
            message:
              "Unable to load gift details at the moment. Please try again later.",
          };
        default:
          return {
            icon: "❌",
            title: "Invalid Gift Link",
            message:
              "This gift link is invalid or may have expired. Please check your email for the correct link.",
          };
      }
    };

    const errorContent = getErrorContent();

    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <div className='w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <span className='text-4xl'>{errorContent.icon}</span>
          </div>
          <h1 className='text-2xl font-bold text-white mb-4'>
            {errorContent.title}
          </h1>
          <p className='text-gray-300'>{errorContent.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6'>
            <span className='text-4xl'>🎁</span>
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>
            You&apos;ve Got a Gift!
          </h1>
          <p className='text-gray-300'>
            From the savings circle &ldquo;{giftDetails.circleName}&rdquo;
          </p>
        </div>

        {/* Gift Amount */}
        <div className='bg-gradient-to-r from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-lg p-6 mb-6 text-center'>
          <h2 className='text-pink-200 text-lg mb-2'>Gift Amount</h2>
          <p className='text-white font-bold text-2xl'>
            <BtcDisplay amount={giftDetails.amount} showBoth={true} />
          </p>
        </div>

        {/* Message */}
        {giftDetails.message && (
          <div className='bg-gray-500/20 border border-gray-500/30 rounded-lg p-4 mb-6'>
            <p className='text-gray-300 text-sm italic'>
              &ldquo;{giftDetails.message}&rdquo;
            </p>
          </div>
        )}

        {/* Claim Button */}
        <div className='space-y-4'>
          {giftDetails.status === "CLAIMED" ? (
            <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center'>
              <p className='text-green-300 font-semibold'>
                ✅ Gift Already Claimed
              </p>
            </div>
          ) : !primaryWallet?.address ? (
            <button
              onClick={handleClaimGift}
              className='w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200'
            >
              🔗 Connect Wallet to Claim
            </button>
          ) : (
            <button
              onClick={handleClaimGift}
              disabled={claiming}
              className='w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
            >
              {claiming ? "Claiming Gift..." : "🎁 Claim Your Gift"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-gray-400 text-xs'>
            Powered by Grove - Bitcoin Savings Circles
          </p>
        </div>
      </div>
    </div>
  );
}
