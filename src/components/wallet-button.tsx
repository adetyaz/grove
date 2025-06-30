"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import { useState, useEffect, useCallback, useMemo } from "react";

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
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
  } = useDynamicConnection();

  const [copied, setCopied] = useState(false);

  // Memoize connection state to prevent unnecessary re-renders
  const connectionState = useMemo(
    () => ({
      isConnected: !!(user && primaryWallet?.address),
      address: primaryWallet?.address,
      userExists: !!user,
      walletExists: !!primaryWallet,
    }),
    [user, primaryWallet]
  );

  // Only log in development and when state changes meaningfully
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (isConnecting || isDisconnecting || connectionState.isConnected) {
        const logKey = `${connectionState.isConnected}-${isConnecting}-${isDisconnecting}`;
        const lastLogKey = sessionStorage.getItem("lastWalletLogKey");

        if (logKey !== lastLogKey) {
          console.log("WalletButton state:", {
            isConnected: connectionState.isConnected,
            isConnecting,
            isDisconnecting,
          });
          sessionStorage.setItem("lastWalletLogKey", logKey);
        }
      }
    }
  }, [connectionState.isConnected, isConnecting, isDisconnecting]);

  // Track connection status changes for notifications - use previous state tracking
  const [prevConnected, setPrevConnected] = useState<boolean | null>(null); // Start with null to detect initial state

  useEffect(() => {
    // Skip the first render to avoid false notifications
    if (prevConnected === null) {
      setPrevConnected(connectionState.isConnected);
      return;
    }

    // Show notification when user connects
    if (
      !prevConnected &&
      connectionState.isConnected &&
      connectionState.address
    ) {
      groveToast.walletConnected(connectionState.address);
    }
    // Show notification when user disconnects
    if (prevConnected && !connectionState.isConnected) {
      groveToast.walletDisconnected();
    }
    setPrevConnected(connectionState.isConnected);
  }, [connectionState.isConnected, connectionState.address, prevConnected]);

  // Memoize the address click handler
  const handleAddressClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (connectionState.address) {
        navigator.clipboard.writeText(connectionState.address);
        setCopied(true);
        groveToast.copySuccess("Wallet address");
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [connectionState.address]
  );

  // If user is connected, show wallet info
  if (connectionState.isConnected && connectionState.address) {
    return (
      <TooltipProvider>
        <div className='flex items-center gap-2'>
          {/* Address display with tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleAddressClick}
                className='hidden sm:inline-block px-2 py-1 bg-white/10 rounded text-sm font-mono hover:bg-white/20 transition-colors cursor-pointer'
              >
                {copied ? (
                  <span className='text-green-400'>Copied!</span>
                ) : (
                  <>
                    {connectionState.address.slice(0, 6)}...
                    {connectionState.address.slice(-4)}
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Address copied!" : "Copy address"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Connected status with disconnect option */}
          <Button
            variant={variant}
            size={size}
            className={`${className} flex items-center gap-2`}
            onClick={disconnect}
            disabled={isDisconnecting}
            title='Disconnect wallet'
          >
            {isDisconnecting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
                Disconnecting...
              </>
            ) : (
              <>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='hidden sm:inline'>Disconnect</span>
                <span className='sm:hidden'>❌</span>
              </>
            )}
          </Button>
        </div>
      </TooltipProvider>
    );
  }

  // Show connect button
  const handleConnect = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("Connect button clicked!");
    }

    // Show toast notification about using Google login
    groveToast.warning(
      "Please use Google Login for now - MetaMask integration is being fixed!"
    );

    connect();
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleConnect}
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
