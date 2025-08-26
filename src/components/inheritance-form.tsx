import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

interface Beneficiary {
  beneficiary: string;
  share: string;
}

interface InheritanceFormProps {
  circleId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function InheritanceForm({
  circleId,
  onSuccess,
  onClose,
}: InheritanceFormProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { beneficiary: "", share: "" },
  ]);
  const [isLoading] = useState(false);
  const { primaryWallet } = useDynamicConnection();
  const { writeContractAsync } = useWriteContract();
  const address = primaryWallet?.address;

  // Fetch existing beneficiaries
  const { data: existingBeneficiaries } = useQuery({
    queryKey: ["inheritance-beneficiaries", circleId, address],
    queryFn: async () => {
      if (!address) return null;
      const response = await fetch(
        `/api/inheritance/${circleId}/beneficiaries?member=${address}`
      );
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!address,
  });

  // Load existing beneficiaries when data is available
  useEffect(() => {
    if (existingBeneficiaries?.beneficiaries?.length > 0) {
      setBeneficiaries(
        existingBeneficiaries.beneficiaries.map((b: any) => ({
          beneficiary: b.beneficiary,
          share: b.share.toString(),
        }))
      );
    }
  }, [existingBeneficiaries]);

  const setBeneficiariesMutation = useMutation({
    mutationFn: async (beneficiariesData: Beneficiary[]) => {
      if (!address) {
        throw new Error("Connect your wallet to set beneficiaries.");
      }

      // Validate total shares
      const totalShares = beneficiariesData.reduce(
        (sum, b) => sum + parseInt(b.share || "0"),
        0
      );
      if (totalShares !== 10000) {
        throw new Error("Total shares must equal 10000 (100%)");
      }

      // Get transaction data from API
      const response = await fetch(`/api/inheritance/${circleId}/beneficiaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiaries: beneficiariesData,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to prepare transaction");
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
      groveToast.success("Beneficiaries set successfully!");
      onSuccess?.();
      onClose?.();
    },
    onError: (error: any) => {
      groveToast.error(
        "Failed to set beneficiaries: " +
          (error?.message || error?.toString() || "Unknown error")
      );
    },
  });

  const handleChange = (
    idx: number,
    field: keyof Beneficiary,
    value: string
  ) => {
    setBeneficiaries((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const addBeneficiary = () =>
    setBeneficiaries((prev) => [...prev, { beneficiary: "", share: "" }]);
  
  const removeBeneficiary = (idx: number) =>
    setBeneficiaries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate beneficiaries
    const validBeneficiaries = beneficiaries.filter(
      (b) => b.beneficiary.trim() && b.share.trim()
    );
    
    if (validBeneficiaries.length === 0) {
      groveToast.error("Please add at least one beneficiary");
      return;
    }

    await setBeneficiariesMutation.mutateAsync(validBeneficiaries);
  };

  const totalShares = beneficiaries.reduce(
    (sum, b) => sum + (parseInt(b.share) || 0),
    0
  );

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
        <h2 className='text-2xl font-bold text-white mb-4'>
          Set Inheritance Beneficiaries
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {beneficiaries.map((b, idx) => (
            <div key={idx} className='flex space-x-2 items-center'>
              <input
                type='text'
                placeholder='Beneficiary Address'
                value={b.beneficiary}
                onChange={(e) =>
                  handleChange(idx, "beneficiary", e.target.value)
                }
                className='flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white'
                required
              />
              <input
                type='number'
                placeholder='Share (e.g. 1000)'
                value={b.share}
                onChange={(e) => handleChange(idx, "share", e.target.value)}
                className='w-24 px-3 py-2 rounded bg-white/10 border border-white/20 text-white'
                required
              />
              {beneficiaries.length > 1 && (
                <button
                  type='button'
                  onClick={() => removeBeneficiary(idx)}
                  className='text-red-400'
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type='button'
            onClick={addBeneficiary}
            className='text-blue-400 hover:text-blue-300'
          >
            + Add Beneficiary
          </button>
          
          {/* Total shares display */}
          <div className='bg-white/5 rounded-lg p-3 border border-white/20'>
            <div className='text-sm text-white/70'>Total Shares:</div>
            <div className={`text-lg font-semibold ${
              totalShares === 10000 ? 'text-green-400' : 
              totalShares > 10000 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {totalShares} / 10000 ({(totalShares / 100).toFixed(1)}%)
            </div>
            {totalShares !== 10000 && (
              <div className='text-xs text-white/60 mt-1'>
                {totalShares > 10000 ? 'Exceeds 100%' : 'Must equal 100%'}
              </div>
            )}
          </div>
          <div className='flex space-x-4 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold'
              disabled={isLoading || setBeneficiariesMutation.isPending}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading || setBeneficiariesMutation.isPending || totalShares !== 10000}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold'
            >
              {setBeneficiariesMutation.isPending ? "Setting..." : "Set Beneficiaries"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
