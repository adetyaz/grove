import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Connect your wallet to claim inheritance.");
      }

      // TODO: Implement Grove V3 inheritance claiming
      // For now, this is a placeholder that will need Grove V3 inheritance contract integration

      // Simulate Grove V3 inheritance check
      const mockIsActive = true;
      const mockIsBeneficiary = true;
      const mockAlreadyClaimed = false;

      if (!mockIsActive) {
        throw new Error(
          "Inheritance has not been activated for this member yet."
        );
      }

      if (!mockIsBeneficiary) {
        throw new Error("You are not a beneficiary of this inheritance.");
      }

      if (mockAlreadyClaimed) {
        throw new Error("You have already claimed your inheritance share.");
      }

      // TODO: Implement actual Grove V3 inheritance claim transaction
      // This should use INHERITANCE_CONTRACT_ADDRESS and INHERITANCE_ABI from lib/contracts.ts
      console.log("Grove V3 inheritance claim - placeholder implementation");

      // Simulate successful claim
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const checkInheritance = async () => {
    if (!address) {
      groveToast.error("Connect your wallet first");
      return;
    }

    setIsChecking(true);
    try {
      // TODO: Implement Grove V3 inheritance checking
      // This should use INHERITANCE_CONTRACT_ADDRESS and INHERITANCE_ABI from lib/contracts.ts

      // Simulate Grove V3 inheritance check
      const mockIsActive = true;
      const mockAmount = BigInt(1000000); // 1M sats
      const mockIsBeneficiary = true;

      if (!mockIsActive) {
        groveToast.info("Inheritance not yet activated for this member");
      } else if (!mockIsBeneficiary) {
        groveToast.error("You are not a beneficiary of this inheritance");
      } else {
        groveToast.success(
          `Inheritance active. Total amount: ${mockAmount.toString()} sats`
        );
      }
    } catch (error: any) {
      groveToast.error(`Error checking inheritance: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
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
        </div>

        <div className='space-y-4'>
          <button
            onClick={checkInheritance}
            disabled={isChecking}
            className='w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold transition-colors'
          >
            {isChecking ? "Checking..." : "Check Inheritance Status"}
          </button>

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
              disabled={claimMutation.isPending}
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
