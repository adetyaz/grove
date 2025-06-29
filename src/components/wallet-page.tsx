"use client";

import WalletConnection from "@/components/wallet-connection";
import { useWagmiIntegration } from "@/hooks/useWagmiIntegration";
import { useState } from "react";

export default function WalletPage() {
  const {
    isFullyConnected,

    signMessage,
  } = useWagmiIntegration();
  const [message, setMessage] = useState("Hello Dynamic + Wagmi!");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignMessage = async () => {
    if (!message) return;

    setLoading(true);
    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (error) {
      console.error("Error signing message:", error);
      alert("Failed to sign message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Dynamic.xyz + Wagmi + Next.js 14
      </h1>

      <div className='space-y-6'>
        <WalletConnection />

        {isFullyConnected && (
          <div className='space-y-4'>
            <div className='border-t pt-6'>
              <h2 className='text-xl font-semibold mb-4'>
                Test Wagmi Functions
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Message to Sign:
                  </label>
                  <input
                    type='text'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded-lg'
                    placeholder='Enter message to sign'
                  />
                  <button
                    onClick={handleSignMessage}
                    disabled={loading || !message}
                    className='mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg'
                  >
                    {loading ? "Signing..." : "Sign Message"}
                  </button>
                </div>

                {signature && (
                  <div className='bg-green-50 p-3 rounded-lg'>
                    <p className='text-sm font-medium text-green-800'>
                      Signature:
                    </p>
                    <p className='text-xs font-mono break-all text-green-700'>
                      {signature}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
