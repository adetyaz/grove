"use client";

import {
  useAccount,
  useBalance,
  useSignMessage,
  useSendTransaction,
} from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { parseEther } from "viem";

export function useWagmiIntegration() {
  const { primaryWallet, user } = useDynamicContext();
  const { address, isConnected, chain } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();

  const sendEth = async (to: string, amount: string) => {
    if (!isConnected) throw new Error("Wallet not connected");

    const hash = await sendTransactionAsync({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });

    return hash;
  };

  const signMessage = async (message: string) => {
    if (!isConnected) throw new Error("Wallet not connected");

    const signature = await signMessageAsync({
      message,
    });

    return signature;
  };

  return {
    // Wagmi data
    address,
    isConnected,
    chain,
    balance,
    refetchBalance,

    // Dynamic data
    primaryWallet,
    user,

    // Functions
    sendEth,
    signMessage,

    // Combined status
    isFullyConnected: isConnected && !!primaryWallet,
  };
}
