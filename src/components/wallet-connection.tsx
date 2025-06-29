"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function WalletConnection() {
  const { primaryWallet, user } = useDynamicContext();
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='animate-pulse bg-gray-200 h-10 w-32 rounded'></div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <DynamicWidget />

        {isConnected && (
          <button
            onClick={() => disconnect()}
            className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors'
          >
            Disconnect Wagmi
          </button>
        )}
      </div>

      {isConnected && address && (
        <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
          <h3 className='font-semibold text-lg'>Wallet Info (via Wagmi):</h3>
          <p>
            <span className='font-medium'>Address:</span> {address}
          </p>
          <p>
            <span className='font-medium'>Chain:</span>{" "}
            {chain?.name || "Unknown"}
          </p>
          <p>
            <span className='font-medium'>Chain ID:</span> {chain?.id}
          </p>
          {balance && (
            <p>
              <span className='font-medium'>Balance:</span>{" "}
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          )}
        </div>
      )}

      {primaryWallet && (
        <div className='bg-blue-50 p-4 rounded-lg space-y-2'>
          <h3 className='font-semibold text-lg'>Dynamic Wallet Info:</h3>
          <p>
            <span className='font-medium'>Address:</span>{" "}
            {primaryWallet.address}
          </p>
          <p>
            <span className='font-medium'>Connector:</span>{" "}
            {primaryWallet.connector.name}
          </p>
          {user && (
            <p>
              <span className='font-medium'>User ID:</span> {user.userId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
