"use client";
import { useState } from "react";
import { groveToast } from "@/lib/toast";

interface InviteFormProps {
  circleId: number;
  circleName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function InviteForm({
  circleId,
  circleName,
  onSuccess,
  onClose,
}: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteType, setInviteType] = useState<"email" | "wallet">("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !walletAddress) {
      groveToast.error("Please enter an email address or wallet address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circleId,
          inviteType,
          email: inviteType === "email" ? email : undefined,
          walletAddress: inviteType === "wallet" ? walletAddress : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (inviteType === "email" && email) {
          groveToast.invitationSent(email);
        } else if (inviteType === "wallet" && walletAddress) {
          groveToast.success(
            `Invitation sent to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          );
        }
        setEmail("");
        setWalletAddress("");
        onSuccess?.();
        onClose?.();
      } else {
        groveToast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      groveToast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>👥</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Invite to Circle
          </h2>
          <p className='text-gray-300'>
            Invite someone to join &ldquo;{circleName}&rdquo;
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Invite Type Toggle */}
          <div className='flex bg-white/10 rounded-lg p-1'>
            <button
              type='button'
              onClick={() => setInviteType("email")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inviteType === "email"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Email
            </button>
            <button
              type='button'
              onClick={() => setInviteType("wallet")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inviteType === "wallet"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Wallet Address
            </button>
          </div>

          {inviteType === "email" ? (
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='friend@example.com'
                required
              />
            </div>
          ) : (
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Wallet Address
              </label>
              <input
                type='text'
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='0x...'
                required
              />
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
              disabled={isLoading || (!email && !walletAddress)}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200'
            >
              {isLoading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
