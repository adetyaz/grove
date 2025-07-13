import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { satVaultContract } from "@/lib/satvault-contract";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

interface InheritanceClaimFormProps {
  circleId: number;
  maxAmount: bigint;
  receiver: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function InheritanceClaimForm({
  circleId,
  maxAmount,
  receiver,
  onSuccess,
  onClose,
}: InheritanceClaimFormProps) {
  const [amount, setAmount] = useState("");
  // Removed legacy isLoading state, now using mutation.isPending
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Connect your wallet to claim inheritance.");
      }
      if (!amount || isNaN(Number(amount)) || BigInt(amount) <= BigInt(0)) {
        throw new Error("Enter a valid positive amount to claim.");
      }
      if (BigInt(amount) > maxAmount) {
        throw new Error(`Amount exceeds available inheritance (${maxAmount.toString()})`);
      }
      const simulation = await satVaultContract.withdraw(
        circleId,
        BigInt(amount),
        receiver as `0x${string}`,
        address as `0x${string}`
      );
      const { request } = simulation;
      const publicClient = (satVaultContract as any).publicClient;
      await publicClient.writeContract(request);
    },
    onSuccess: () => {
      groveToast.success("Inheritance claimed successfully!");
      onSuccess?.();
      onClose?.();
    },
    onError: (err: any) => {
      setError("Failed to claim inheritance: " + (err?.message || err?.toString() || "Unknown error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <h2 className='text-2xl font-bold text-white mb-4'>
          Claim Inheritance
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='number'
            min='0'
            step='0.00001'
            placeholder={`Amount (max ${maxAmount.toString()})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className='w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            required
            disabled={mutation.isPending}
          />
          {error && (
            <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm'>
              {error}
            </div>
          )}
          <div className='flex space-x-4 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={mutation.isPending}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200'
            >
              {mutation.isPending ? "Claiming..." : "Claim Inheritance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
