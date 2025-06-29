"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet, sepolia, polygon, arbitrum } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { CITREA_TESTNET } from "@/contracts/constants";

// Configure Wagmi
const config = createConfig({
  chains: [CITREA_TESTNET, mainnet, sepolia, polygon, arbitrum],
  multiInjectedProviderDiscovery: false,
  transports: {
    [CITREA_TESTNET.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false, // Disable SSR to prevent hydration issues
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
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

        // Optional: Additional configuration
        cssOverrides: `
          .dynamic-modal {
            z-index: 9999;
          }
        `,
        initialAuthenticationMode: "connect-only",

        // Enhanced UI settings
        appName: "Grove",
        appLogoUrl: "/favicon.ico",

        // Preferred chains
        walletConnectPreferredChains: [`eip155:${CITREA_TESTNET.id}` as const],

        // Custom onboarding
        onboardingImageUrl: "/favicon.ico",
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
