"use client";
import { useState } from "react";
import { groveToast } from "@/lib/toast";

interface EmailInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftId: string;
  giftDetails: {
    senderAddress: string;
    senderName?: string;
    circleId: string;
    circleName: string;
    amount: string;
    message?: string;
  };
}

export default function EmailInviteModal({
  isOpen,
  onClose,
  giftId,
  giftDetails,
}: EmailInviteModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [occasion, setOccasion] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const sendEmailInvite = async () => {
    if (!recipientEmail) {
      groveToast.error("Please enter recipient email");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`/api/gifts/${giftId}/send-email-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          senderAddress: giftDetails.senderAddress,
          senderName: giftDetails.senderName,
          circleId: giftDetails.circleId,
          circleName: giftDetails.circleName,
          amount: giftDetails.amount,
          message: giftDetails.message,
          occasion: occasion || "special occasion",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email invite");
      }

      groveToast.success(`🎁 Gift email sent to ${recipientEmail}!`);
      onClose();
      setRecipientEmail("");
      setOccasion("");
    } catch (error) {
      groveToast.error(
        error instanceof Error ? error.message : "Failed to send email invite"
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailInvite();
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>📧</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Send Gift via Email
          </h2>
          <p className='text-gray-300'>
            Send a claim link to the recipient&apos;s email
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Recipient Email *
            </label>
            <input
              type='email'
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              placeholder='recipient@example.com'
              required
              disabled={sending}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Occasion (Optional)
            </label>
            <input
              type='text'
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              placeholder='birthday, wedding, graduation...'
              disabled={sending}
            />
          </div>

          {/* Gift Summary */}
          <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
            <h3 className='text-white font-semibold mb-2 flex items-center'>
              <span className='mr-2'>🎁</span>
              Gift Summary
            </h3>
            <div className='space-y-1 text-sm text-gray-300'>
              <p>
                <strong>Amount:</strong> {giftDetails.amount} BTC
              </p>
              <p>
                <strong>Circle:</strong> {giftDetails.circleName}
              </p>
              {giftDetails.message && (
                <p>
                  <strong>Message:</strong> &ldquo;{giftDetails.message}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-3'>
            <p className='text-blue-300 text-xs'>
              <strong>🔒 Security:</strong> The recipient will receive a secure
              claim link that expires in 48 hours. They can login with their
              email or social accounts to claim the gift.
            </p>
          </div>

          <div className='flex space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!recipientEmail || sending}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center'
            >
              {sending ? (
                <>
                  <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2'></div>
                  Sending...
                </>
              ) : (
                <>📧 Send Email Invite</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
