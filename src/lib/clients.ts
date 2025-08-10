import { createWalletClient, createPublicClient, custom, http } from "viem";
import { CITREA_TESTNET } from "@/contracts/constants";

export function getWalletClient() {
  if (typeof window === "undefined") {
    throw new Error("Wallet client requires browser");
  }
  return createWalletClient({
    chain: CITREA_TESTNET,
    transport: custom(window.ethereum!),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: CITREA_TESTNET,
    transport: http(),
  });
}
