import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

interface InheritanceClaimFormProps {
  circleId: number;
  deceasedAddress: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function InheritanceClaimForm({
  circleId,
  deceasedAddress,
  onSuccess,
  onClose,
}: InheritanceClaimFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicConnection();
  const { writeContractAsync } = useWriteContract();
  const address = primaryWallet?.address;

  // Query inheritance status and claimable amount
  const { data: inheritanceData, isLoading: isChecking } = useQuery({
    queryKey: ["inheritance-claim", circleId, deceasedAddress, address],
    queryFn: async () => {
      if (!address) return null;
      const response = await fetch(
        `/api/inheritance/${circleId}/claim?deceased=${deceasedAddress}&beneficiary=${address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch inheritance data");
      }
      return response.json();
    },
    enabled: !!address,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Connect your wallet to claim inheritance.");
      }

      if (!inheritanceData?.isActive) {
        throw new Error("Inheritance has not been activated for this member yet.");
      }

      if (inheritanceData?.claimableAmount === "0") {
        throw new Error("You have no inheritance to claim or have already claimed.");
      }

      // Get transaction data from API
      const response = await fetch(`/api/inheritance/${circleId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deceasedAddress,
          beneficiaryAddress: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to prepare claim transaction");
      }

      const { transactionData } = await response.json();

      // Execute the contract transaction
      const txHash = await writeContractAsync({
        address: transactionData.contractAddress as `0x${string}`,
        abi: transactionData.abi,
        functionName: transactionData.functionName,
        args: transactionData.args,
      });
      
      return txHash;
    },
    onSuccess: () => {
      groveToast.success("Inheritance claimed successfully!");
      onSuccess?.();
      onClose?.();
    },
    onError: (err: any) => {
      setError(
        "Failed to claim inheritance: " +
          (err?.message || err?.toString() || "Unknown error")
      );
    },
  });

  const formatAmount = (amount: string) => {
    if (!amount || amount === "0") return "0";
    return (parseInt(amount) / 100000000).toFixed(8); // Convert sats to BTC
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <h2 className='text-2xl font-bold text-white mb-4'>
          Claim Inheritance
        </h2>
        <div className='space-y-4 mb-4'>
          <p className='text-white/80'>
            <strong>Circle ID:</strong> {circleId}
          </p>
          <p className='text-white/80'>
            <strong>Deceased Member:</strong> {deceasedAddress}
          </p>
          
          {/* Inheritance Status Display */}
          {inheritanceData && (
            <div className='bg-white/5 rounded-lg p-4 border border-white/20'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-white/70'>Status:</span>
                  <span className={inheritanceData.isActive ? 'text-green-400' : 'text-red-400'}>
                    {inheritanceData.isActive ? 'Active' : 'Not Active'}
                  </span>
                </div>
                {inheritanceData.isActive && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-white/70'>Total Amount:</span>
                      <span className='text-white'>{formatAmount(inheritanceData.totalAmount)} BTC</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-white/70'>Your Claimable:</span>
                      <span className='text-green-400 font-semibold'>
                        {formatAmount(inheritanceData.claimableAmount)} BTC
                      </span>
                    </div>
                    {inheritanceData.activationReason && (
                      <div className='flex justify-between'>
                        <span className='text-white/70'>Reason:</span>
                        <span className='text-white/80'>{inheritanceData.activationReason}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          {!inheritanceData && (
            <button
              onClick={() => window.location.reload()}
              disabled={isChecking}
              className='w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold transition-colors'
            >
              {isChecking ? "Checking..." : "Check Inheritance Status"}
            </button>
          )}

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
              disabled={claimMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending || !inheritanceData?.isActive || inheritanceData?.claimableAmount === "0"}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200'
            >
              {claimMutation.isPending ? "Claiming..." : "Claim My Inheritance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
