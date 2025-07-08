"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { CITREA_TESTNET } from "@/contracts/constants";

// Configure Wagmi with primary focus on Citrea testnet
const config = createConfig({
  chains: [CITREA_TESTNET], // Only Citrea for simplicity
  multiInjectedProviderDiscovery: false,
  transports: {
    [CITREA_TESTNET.id]: http(),
  },
  ssr: false, // Disable SSR to prevent hydration issues
});

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - reduced from 10
      gcTime: 1000 * 60 * 10, // 10 minutes - reduced from 15
      retry: 1, // Reduced retries to avoid connection issues
      refetchOnWindowFocus: true, // Re-enable for wallet state updates
      refetchOnMount: true, // Re-enable for wallet state updates
    },
    mutations: {
      retry: 1,
    },
  },
});

interface DynamicWagmiProviderProps {
  children: React.ReactNode;
}

export default function DynamicWagmiProvider({
  children,
}: DynamicWagmiProviderProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],

        // Authentication mode - connect and sign for full authentication
        initialAuthenticationMode: "connect-and-sign",

        // App branding
        appName: "Grove",
        appLogoUrl: "/favicon.ico",

        // CSS overrides for better UI
        cssOverrides: `
          .dynamic-modal {
            z-index: 9999;
          }
        `,

        // Configure only Citrea testnet - primary focus
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: [
                CITREA_TESTNET.blockExplorers?.default?.url ||
                  "https://explorer.testnet.citrea.xyz",
              ],
              chainId: CITREA_TESTNET.id,
              chainName: CITREA_TESTNET.name,
              iconUrls: ["https://citrea.xyz/favicon.ico"],
              name: CITREA_TESTNET.name,
              nativeCurrency: {
                decimals: CITREA_TESTNET.nativeCurrency.decimals,
                name: CITREA_TESTNET.nativeCurrency.name,
                symbol: CITREA_TESTNET.nativeCurrency.symbol,
                iconUrl: "https://citrea.xyz/favicon.ico",
              },
              networkId: CITREA_TESTNET.id,
              rpcUrls: [...CITREA_TESTNET.rpcUrls.default.http],
              vanityName: "Citrea Testnet",
            },
          ],
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
