"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { toast } from 'react-toastify';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DynamicErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dynamic SDK Error:", error, errorInfo);

    // Show toast notification for wallet errors
    toast.error("Wallet connection error detected. Please try refreshing or switching browsers.", {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Check if it's the mobile provider error
    if (
      error.message.includes("mobile provider") ||
      error.message.includes("SDK state invalid")
    ) {
      console.log("Detected mobile provider error, attempting to reset...");

      // Try to reset the error state after a delay
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 2000);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        this.props.fallback || (
          <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
            <div className='text-center max-w-md mx-auto p-8'>
              <div className='w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>⚠️</span>
              </div>
              <h2 className='text-xl font-bold text-white mb-4'>
                Wallet Connection Issue
              </h2>
              <p className='text-gray-300 mb-6'>
                There was an issue initializing the wallet connection. This
                usually happens with mobile wallets.
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold'
              >
                Try Again
              </button>
              <p className='text-xs text-gray-500 mt-4'>
                If the issue persists, try using a desktop browser with MetaMask
                installed.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default DynamicErrorBoundary;
