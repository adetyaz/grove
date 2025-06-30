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
      console.log("Dynamic state change:", {
        hasUser: !!user,
        hasWallet: !!primaryWallet,
        hasAddress: !!primaryWallet?.address,
        timestamp: new Date().toISOString(),
      });

      if (user && primaryWallet?.address) {
        console.log(
          "✅ Wallet connected:",
          primaryWallet.address.slice(0, 6) + "..."
        );
      } else if (!user && !primaryWallet) {
        console.log("❌ Wallet disconnected");
      }
    }

    // Handle inconsistent state: wallet present but no user
    // Add a delay to avoid triggering cleanup during normal connection flow
    if (primaryWallet && !user) {
      console.warn("Inconsistent state detected - waiting before cleanup...");

      // Wait a bit before cleanup to allow normal connection flow
      const cleanupTimeout = setTimeout(() => {
        if (primaryWallet && !user) {
          console.warn("Still inconsistent after delay - cleaning up");
          handleLogOut().catch(() => {
            // Silent error handling
          });
        }
      }, 2000); // Wait 2 seconds

      return () => clearTimeout(cleanupTimeout);
    }
  }, [user, primaryWallet, handleLogOut]);

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
      return;
    }

    // If currently connecting, don't start another connection
    if (isConnecting) {
      return;
    }

    // If there's a wallet but no user (inconsistent state), clean up first
    if (primaryWallet && !user) {
      try {
        await handleLogOut();
        // Small delay for cleanup
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        // Silent error handling in production
        if (process.env.NODE_ENV === "development") {
          console.error("Error cleaning up state:", error);
        }
      }
    }

    setIsConnecting(true);

    try {
      setShowAuthFlow(true);

      // Set timeout with ref to prevent memory leaks
      connectionTimeoutRef.current = setTimeout(() => {
        if (!user || !primaryWallet) {
          setIsConnecting(false);
        }
      }, 15000); // 15 second timeout
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error in connect function:", error);
      }
      setIsConnecting(false);
    }
  }, [user, primaryWallet, isConnecting, setShowAuthFlow, handleLogOut]);

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
