"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import { giftEngineContract } from "@/lib/giftengine-contract";
import EmailInviteModal from "./email-invite-modal";
import { formatBtcAmount } from "@/lib/btc-conversion";

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
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftType, setGiftType] = useState<"wallet" | "email">("wallet");
  const [message, setMessage] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [completedGiftId, setCompletedGiftId] = useState<string | null>(null);

  const { primaryWallet, user } = useDynamicConnection();
  const address = primaryWallet?.address;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!amount || !address) {
        throw new Error(
          "Please enter a valid amount and ensure wallet is connected"
        );
      }

      if (giftType === "wallet" && !recipient) {
        throw new Error("Please enter recipient wallet address");
      }

      if (giftType === "email" && !recipientEmail) {
        throw new Error("Please enter recipient email address");
      }

      if (giftType === "email") {
        // Create escrow gift for email recipients
        const escrowParams = {
          circleId,
          recipient: address as `0x${string}`, // Temporary - use sender as placeholder until recipient claims
          amount: parseEther(amount),
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
      } else {
        // Direct wallet gift (existing flow)
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

        return {
          type: "direct",
          ...result,
        };
      }
    },
    onSuccess: (result) => {
      if (result.type === "escrow") {
        groveToast.success(
          `🎁 Gift email sent to ${result.recipientEmail}! They can claim it within 30 days.`
        );
      } else {
        groveToast.success(`Gift of ${amount} BTC sent successfully!`);
      }

      fetch("/api/activity/track-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: address,
          recipientAddress: result.type === "escrow" ? "ESCROW" : recipient,
          circleId: circleId.toString(),
          amount,
          txHash: result.hash,
          message: message || "A gift from Grove!",
          circleName,
        }),
      }).catch(console.error);

      if (result.type === "direct") {
        // Store gift details for potential email invite
        setCompletedGiftId(result.hash);

        // Show option to send email invite after successful gift
        groveToast.success(
          `🎁 Gift sent! Want to notify the recipient via email?`,
          {
            autoClose: 6000,
          }
        );
      }

      onSuccess?.();
    },
    onError: (err: any) => {
      groveToast.error(`Failed to send gift. ${err.message || err.toString()}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const showEmailInviteOption = () => {
    if (completedGiftId) {
      setShowEmailModal(true);
    }
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
            <label className='block text-sm font-medium text-gray-300 mb-3'>
              How would you like to send the gift?
            </label>
            <div className='flex gap-4 mb-4'>
              <label className='flex items-center text-gray-300'>
                <input
                  type='radio'
                  value='wallet'
                  checked={giftType === "wallet"}
                  onChange={(e) =>
                    setGiftType(e.target.value as "wallet" | "email")
                  }
                  className='mr-2 text-pink-500 focus:ring-pink-500'
                />
                To Wallet Address
              </label>
              <label className='flex items-center text-gray-300'>
                <input
                  type='radio'
                  value='email'
                  checked={giftType === "email"}
                  onChange={(e) =>
                    setGiftType(e.target.value as "wallet" | "email")
                  }
                  className='mr-2 text-pink-500 focus:ring-pink-500'
                />
                Via Email (Escrow)
              </label>
            </div>
          </div>

          {giftType === "wallet" ? (
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Recipient Wallet Address
              </label>
              <input
                type='text'
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                placeholder='0x...'
                required={giftType === "wallet"}
              />
            </div>
          ) : (
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
                required={giftType === "email"}
              />
              <p className='text-xs text-gray-400 mt-1'>
                Gift will be held in escrow for 30 days. Recipient gets a secure
                claim link via email.
              </p>
            </div>
          )}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Gift Amount (BTC)
            </label>
            <input
              type='number'
              step='0.0001'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
              placeholder='0.001'
              required
            />
            {amount && parseFloat(amount) > 0 && (
              <p className='text-xs text-gray-300 mt-1'>
                ≈{" "}
                {formatBtcAmount(amount, { showBoth: false, btcFirst: false })}
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

          {/* Email Invite Option - Show after successful gift */}
          {completedGiftId && !mutation.isPending && (
            <div className='bg-orange-500/10 border border-orange-500/30 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='text-orange-300 font-semibold text-sm'>
                    Gift Sent Successfully! 🎉
                  </h4>
                  <p className='text-orange-200 text-xs mt-1'>
                    Want to notify the recipient via email?
                  </p>
                </div>
                <button
                  onClick={showEmailInviteOption}
                  className='px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-md font-medium transition-colors'
                >
                  📧 Send Email
                </button>
              </div>
            </div>
          )}

          <div className='flex space-x-4'>
            <button
              type='button'
              onClick={() => {
                onClose?.();
                setCompletedGiftId(null);
              }}
              className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
              disabled={mutation.isPending}
            >
              {completedGiftId ? "Close" : "Cancel"}
            </button>
            <button
              type='submit'
              disabled={
                !amount ||
                (giftType === "wallet" && !recipient) ||
                (giftType === "email" && !recipientEmail) ||
                mutation.isPending
              }
              className='flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
            >
              {mutation.isPending
                ? giftType === "email"
                  ? "Creating Escrow Gift..."
                  : "Sending..."
                : giftType === "email"
                ? "Send via Email"
                : "Send Gift"}
            </button>
          </div>
        </form>
      </div>

      {/* Email Invite Modal */}
      {showEmailModal && completedGiftId && (
        <EmailInviteModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            onClose?.();
            setCompletedGiftId(null);
          }}
          giftId={completedGiftId}
          giftDetails={{
            senderAddress: address || "",
            senderName:
              user?.firstName ||
              `${address?.slice(0, 6)}...${address?.slice(-4)}`,
            circleId: circleId.toString(),
            circleName,
            amount,
            message: message || "A gift from Grove!",
          }}
        />
      )}
    </div>
  );
}
