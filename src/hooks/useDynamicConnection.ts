"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState, useCallback, useRef } from "react";

export function useDynamicConnection() {
  const { setShowAuthFlow, user, primaryWallet, handleLogOut } =
    useDynamicContext();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Use refs to prevent memory leaks from timeouts
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  // Minimal logging - only for critical state changes
  useEffect(() => {
    // Only log when there's a meaningful change and only in development
    if (process.env.NODE_ENV === "development") {
      if (user && primaryWallet?.address) {
        console.log(
          "✅ Wallet connected:",
          primaryWallet.address.slice(0, 6) + "..."
        );
      } else if (!user && !primaryWallet) {
        console.log("❌ Wallet disconnected");
      }
    }
  }, [user, primaryWallet]);

  // Reset connecting state when connection succeeds
  useEffect(() => {
    if (user && primaryWallet) {
      setIsConnecting(false);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = undefined;
      }
    }
  }, [user, primaryWallet]); // Fixed dependencies

  // Reset disconnecting state when disconnection completes
  useEffect(() => {
    if (!user && !primaryWallet) {
      setIsDisconnecting(false);
    }
  }, [user, primaryWallet]);

  // Memoized reset function
  const resetConnectionState = useCallback(() => {
    setIsConnecting(false);
    setIsDisconnecting(false);
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = undefined;
    }
  }, []);

  const connect = useCallback(async () => {
    // Check if already properly connected
    if (user && primaryWallet) {
      console.log("Already connected");
      return;
    }

    // If currently connecting, don't start another connection
    if (isConnecting) {
      console.log("Connection already in progress");
      return;
    }

    console.log("Starting wallet connection...");
    setIsConnecting(true);

    try {
      // Clear any existing timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      // Show the auth flow
      setShowAuthFlow(true);

      // Set a timeout for connection
      connectionTimeoutRef.current = setTimeout(() => {
        console.warn("Connection timeout after 30 seconds");
        setIsConnecting(false);
        setShowAuthFlow(false);
      }, 30000);
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnecting(false);
    }
  }, [user, primaryWallet, isConnecting, setShowAuthFlow]);

  const disconnect = useCallback(async () => {
    if (isDisconnecting || (!user && !primaryWallet)) return;

    setIsDisconnecting(true);
    try {
      await handleLogOut();
      // Small delay to ensure state cleanup
      cleanupTimeoutRef.current = setTimeout(() => {
        setIsDisconnecting(false);
      }, 100);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error disconnecting wallet:", error);
      }
      setIsDisconnecting(false);
    }
  }, [isDisconnecting, user, primaryWallet, handleLogOut]);

  return {
    user,
    primaryWallet,
    isConnected: !!(user && primaryWallet),
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
    resetConnectionState,
  };
}
