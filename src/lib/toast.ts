import { toast, ToastOptions } from "react-toastify";

// Custom toast configurations for Grove
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const groveToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  // Specific notifications for Grove features
  walletConnected: (address: string) => {
    toast.success(
      `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      {
        ...defaultOptions,
        autoClose: 3000,
      }
    );
  },

  walletDisconnected: () => {
    toast.info("Wallet disconnected", {
      ...defaultOptions,
      autoClose: 3000,
    });
  },

  circleCreated: (circleName: string) => {
    toast.success(`Circle "${circleName}" created successfully! 🌳`, {
      ...defaultOptions,
      autoClose: 4000,
    });
  },

  invitationSent: (email: string) => {
    toast.success(`Invitation sent to ${email} 📧`, {
      ...defaultOptions,
      autoClose: 4000,
    });
  },

  contributionMade: (amount: string) => {
    toast.success(`Contribution of ${amount} BTC added to your circle! 💰`, {
      ...defaultOptions,
      autoClose: 4000,
    });
  },

  transactionPending: (txHash: string) => {
    toast.info(`Transaction submitted: ${txHash.slice(0, 10)}... ⏳`, {
      ...defaultOptions,
      autoClose: 10000,
    });
  },

  transactionConfirmed: (txHash: string) => {
    toast.success(`Transaction confirmed: ${txHash.slice(0, 10)}... ✅`, {
      ...defaultOptions,
      autoClose: 6000,
    });
  },

  transactionFailed: (error: string) => {
    toast.error(`Transaction failed: ${error}`, {
      ...defaultOptions,
      autoClose: 8000,
    });
  },

  memberJoined: (memberName: string, circleName: string) => {
    toast.success(`${memberName} joined "${circleName}"! 🎉`, {
      ...defaultOptions,
      autoClose: 4000,
    });
  },

  copySuccess: (text: string) => {
    toast.success(`${text} copied to clipboard! 📋`, {
      ...defaultOptions,
      autoClose: 2000,
    });
  },
};
