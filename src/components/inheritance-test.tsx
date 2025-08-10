"use client";
import { useState } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

/**
 * Simple test component for new inheritance system
 * This will be integrated into the main UI later
 */
export default function InheritanceTest() {
  const [circleId, setCircleId] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [share, setShare] = useState("");
  const [deceasedAddress, setDeceasedAddress] = useState("");

  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  const handleSetBeneficiaries = async () => {
    try {
      if (!address || !circleId || !beneficiaryAddress || !share) {
        groveToast.error("Please fill all fields and connect wallet");
        return;
      }

      // TODO: Integrate with updated inheritanceModuleContract
      groveToast.success(
        "This will integrate with enhanced InheritanceModule once contracts are deployed"
      );
    } catch (error: any) {
      groveToast.error(`Failed: ${error.message}`);
    }
  };

  const handleActivateInheritance = async () => {
    try {
      if (!address || !circleId || !deceasedAddress) {
        groveToast.error("Please fill all fields and connect wallet");
        return;
      }

      // TODO: Call activateInheritance function
      groveToast.success("This will activate inheritance for inactive member");
    } catch (error: any) {
      groveToast.error(`Failed: ${error.message}`);
    }
  };

  const handleClaimInheritance = async () => {
    try {
      if (!address || !circleId || !deceasedAddress) {
        groveToast.error("Please fill all fields and connect wallet");
        return;
      }

      // TODO: Call claimInheritance function
      groveToast.success("This will claim your inheritance share");
    } catch (error: any) {
      groveToast.error(`Failed: ${error.message}`);
    }
  };

  return (
    <div className='space-y-6 p-6 bg-white rounded-lg shadow'>
      <h3 className='text-xl font-semibold'>
        Enhanced Inheritance System Test
      </h3>

      {/* Set Beneficiaries */}
      <div className='space-y-4'>
        <h4 className='font-medium'>
          1. Set Beneficiaries (unchanged from existing)
        </h4>
        <input
          type='number'
          placeholder='Circle ID'
          value={circleId}
          onChange={(e) => setCircleId(e.target.value)}
          className='w-full p-2 border rounded'
        />
        <input
          type='text'
          placeholder='Beneficiary Address'
          value={beneficiaryAddress}
          onChange={(e) => setBeneficiaryAddress(e.target.value)}
          className='w-full p-2 border rounded'
        />
        <input
          type='number'
          placeholder='Share (out of 10000)'
          value={share}
          onChange={(e) => setShare(e.target.value)}
          className='w-full p-2 border rounded'
        />
        <button
          onClick={handleSetBeneficiaries}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Set Beneficiaries
        </button>
      </div>

      {/* Activate Inheritance */}
      <div className='space-y-4'>
        <h4 className='font-medium'>
          2. Activate Inheritance (NEW - after 90 days inactivity)
        </h4>
        <input
          type='text'
          placeholder='Deceased Member Address'
          value={deceasedAddress}
          onChange={(e) => setDeceasedAddress(e.target.value)}
          className='w-full p-2 border rounded'
        />
        <button
          onClick={handleActivateInheritance}
          className='px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600'
        >
          Activate Inheritance
        </button>
      </div>

      {/* Claim Inheritance */}
      <div className='space-y-4'>
        <h4 className='font-medium'>
          3. Claim Inheritance (NEW - beneficiaries claim their share)
        </h4>
        <button
          onClick={handleClaimInheritance}
          className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
        >
          Claim My Inheritance Share
        </button>
      </div>

      <div className='text-sm text-gray-600 space-y-2'>
        <p>
          <strong>How it works:</strong>
        </p>
        <ul className='list-disc list-inside space-y-1'>
          <li>Set beneficiaries (same as before - no breaking changes)</li>
          <li>After 90 days of inactivity, anyone can activate inheritance</li>
          <li>Beneficiaries can claim their proportional share</li>
          <li>Funds come from the deceased member&apos;s contributions</li>
          <li>Activity is tracked automatically on deposits</li>
        </ul>
      </div>
    </div>
  );
}
