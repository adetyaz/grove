import { useState } from "react";
import { inheritanceModuleContract } from "@/lib/inheritancemodule-contract";
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
  const [isLoading, setIsLoading] = useState(false);
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

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
    if (!address) {
      groveToast.error("Connect your wallet to set beneficiaries.");
      return;
    }
    if (beneficiaries.some((b) => !b.beneficiary || !b.share)) {
      groveToast.error("Fill in all beneficiary addresses and shares.");
      return;
    }
    setIsLoading(true);
    try {
      const formatted = beneficiaries.map((b) => ({
        beneficiary: b.beneficiary as `0x${string}`,
        share: BigInt(b.share),
      }));
      const simulation = await inheritanceModuleContract.setBeneficiaries(
        circleId,
        formatted,
        address as `0x${string}`
      );
      const { request } = simulation;
      const publicClient = (inheritanceModuleContract as any).publicClient;
      await publicClient.writeContract(request);
      groveToast.success("Beneficiaries set successfully!");
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      groveToast.error(
        "Failed to set beneficiaries: " + (err?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            className='text-blue-400'
          >
            + Add Beneficiary
          </button>
          <div className='flex space-x-4 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold'
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold'
            >
              {isLoading ? "Setting..." : "Set Beneficiaries"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
