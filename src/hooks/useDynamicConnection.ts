"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";

export function useDynamicConnection() {
  const { setShowAuthFlow, user, primaryWallet, handleLogOut } =
    useDynamicContext();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Reset connecting state when user changes
  useEffect(() => {
    if (user && primaryWallet) {
      setIsConnecting(false);
    }
  }, [user, primaryWallet]);

  // Reset disconnecting state when user is fully logged out
  useEffect(() => {
    if (!user && !primaryWallet) {
      setIsDisconnecting(false);
    }
  }, [user, primaryWallet]);
  const connect = async () => {
    if (isConnecting || (user && primaryWallet)) return;

    setIsConnecting(true);
    try {
      // Add a small delay to ensure Dynamic is fully initialized
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force show the auth flow
      setShowAuthFlow(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setIsConnecting(false);

      // Show user-friendly error message
      if (error instanceof Error && error.message.includes("mobile provider")) {
        alert(
          "Please make sure you have a compatible wallet installed (like MetaMask) or try using WalletConnect for mobile wallets."
        );
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    }
  };

  const disconnect = async () => {
    if (isDisconnecting || (!user && !primaryWallet)) return;

    setIsDisconnecting(true);
    try {
      await handleLogOut();
      // Small delay to ensure state cleanup
      setTimeout(() => {
        setIsDisconnecting(false);
      }, 100);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setIsDisconnecting(false);
    }
  };

  return {
    user,
    primaryWallet,
    isConnected: !!(user && primaryWallet),
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
  };
}
