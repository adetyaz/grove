"use client";
import { Button } from "@/components/ui/button";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { useState, useEffect } from "react";

interface WalletButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export default function WalletButton({
  variant = "ghost",
  size = "default",
  className = "",
  children,
}: WalletButtonProps) {
  const {
    user,
    primaryWallet,
    // isConnected,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
  } = useDynamicConnection();

  const [copied, setCopied] = useState(false);

  // Track connection status changes for notifications
  const [prevUser, setPrevUser] = useState(user);

  useEffect(() => {
    // Show notification when user connects
    if (!prevUser && user && primaryWallet) {
      groveToast.walletConnected(primaryWallet.address);
    }
    // Show notification when user disconnects
    if (prevUser && !user) {
      groveToast.walletDisconnected();
    }
    setPrevUser(user);
  }, [user, primaryWallet, prevUser]);

  const handleAddressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryWallet?.address) {
      navigator.clipboard.writeText(primaryWallet.address);
      setCopied(true);
      groveToast.copySuccess("Wallet address");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If user is connected, show wallet info
  if (user && primaryWallet) {
    return (
      <div className='flex items-center gap-2'>
        <Button
          variant={variant}
          size={size}
          className={`${className} flex items-center gap-2`}
          onClick={disconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
              Disconnecting...
            </>
          ) : (
            <>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span className='sm:hidden'>Connected</span>
            </>
          )}
        </Button>
        <button
          onClick={handleAddressClick}
          className='hidden sm:inline-block px-2 py-1 bg-white/10 rounded text-sm font-mono hover:bg-white/20 transition-colors cursor-pointer'
          title={copied ? "Copied!" : "Click to copy address"}
        >
          {copied ? (
            <span className='text-green-400'>Copied!</span>
          ) : (
            <>
              {primaryWallet.address.slice(0, 6)}...
              {primaryWallet.address.slice(-4)}
            </>
          )}
        </button>
      </div>
    );
  }

  // Show connect button
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={connect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
          Connecting...
        </>
      ) : (
        children || "Connect Wallet"
      )}
    </Button>
  );
}
