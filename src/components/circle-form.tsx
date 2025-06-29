"use client";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  GROVE_ABI,
  GROVE_CONTRACT_ADDRESS,
  PaymentType,
} from "@/contracts/constants";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { groveToast } from "@/lib/toast";

interface CircleFormProps {
  onSuccess?: () => void;
}

export default function CircleForm({ onSuccess }: CircleFormProps) {
  const { address, isConnected } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    paymentType: PaymentType.OneTime,
    fixedAmount: "",
    deadline: "",
  });

  // Handle successful transaction
  useEffect(() => {
    const storeCircleData = async () => {
      if (isConfirmed && hash && address) {
        try {
          groveToast.circleCreated(formData.name);

          // Store circle data in database
          const targetAmountWei = parseEther(formData.targetAmount);
          const fixedAmountWei = formData.fixedAmount
            ? parseEther(formData.fixedAmount)
            : BigInt(0);
          const deadlineTimestamp = BigInt(
            Math.floor(new Date(formData.deadline).getTime() / 1000)
          );

          const response = await fetch("/api/circles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              targetAmount: targetAmountWei.toString(),
              paymentType: formData.paymentType,
              fixedAmount: fixedAmountWei.toString(),
              deadline: deadlineTimestamp.toString(),
              transactionHash: hash,
              ownerWallet: address,
              ownerEmail: `${address}@grove.temp`, // Temporary email
            }),
          });

          if (!response.ok) {
            console.error("Failed to store circle data");
            groveToast.warning(
              "Circle created on-chain but failed to store locally"
            );
          } else {
            groveToast.success("Circle data stored successfully!");
          }
        } catch (error) {
          console.error("Error storing circle data:", error);
          groveToast.warning(
            "Circle created on-chain but failed to store locally"
          );
        }

        // Reset form on success
        setFormData({
          name: "",
          description: "",
          targetAmount: "",
          paymentType: PaymentType.OneTime,
          fixedAmount: "",
          deadline: "",
        });
        onSuccess?.();
      }
    };

    storeCircleData();
  }, [isConfirmed, hash, address, formData, onSuccess]);

  // Handle transaction hash
  useEffect(() => {
    if (hash) {
      groveToast.transactionPending(hash);
    }
  }, [hash]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      groveToast.error(`Transaction failed: ${writeError.message}`);
    }
    if (receiptError) {
      groveToast.error(`Transaction error: ${receiptError.message}`);
    }
  }, [writeError, receiptError]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createCircle = async () => {
    if (!isConnected || !address) {
      groveToast.error("Please connect your wallet first");
      return;
    }

    try {
      const targetAmountWei = parseEther(formData.targetAmount);
      const fixedAmountWei = formData.fixedAmount
        ? parseEther(formData.fixedAmount)
        : BigInt(0);

      // Convert deadline to timestamp
      const deadlineTimestamp = BigInt(
        Math.floor(new Date(formData.deadline).getTime() / 1000)
      );

      // Validate the inputs
      if (targetAmountWei <= 0) {
        groveToast.error("Target amount must be greater than 0");
        return;
      }

      if (deadlineTimestamp <= BigInt(Math.floor(Date.now() / 1000))) {
        groveToast.error("Deadline must be in the future");
        return;
      }

      if (
        formData.paymentType === PaymentType.Recurring &&
        fixedAmountWei <= 0
      ) {
        groveToast.error("Recurring amount must be greater than 0");
        return;
      }

      console.log("Creating circle with params:", {
        name: formData.name,
        description: formData.description,
        targetAmount: targetAmountWei.toString(),
        paymentType: formData.paymentType,
        fixedAmount: fixedAmountWei.toString(),
        deadline: deadlineTimestamp.toString(),
      });

      console.log("Wallet connected:", isConnected, "Address:", address);
      console.log("Grove contract address:", GROVE_CONTRACT_ADDRESS);

      // Make sure user is on the correct network
      console.log("About to call writeContract...");

      writeContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "createCircle",
        args: [
          formData.name,
          formData.paymentType,
          fixedAmountWei,
          [address], // initialMembers array with the creator
        ],
      });

      // Reset form on success (will happen in useEffect when transaction confirms)
    } catch (error) {
      console.error("Error creating circle:", error);
      groveToast.error(
        "Failed to create circle. Please check your wallet and try again."
      );
    }
  };

  return (
    <div className='space-y-6'>
      <div className='grid gap-6'>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Circle Name *
          </label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            placeholder='Family Emergency Fund'
            className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Description
          </label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            placeholder='Describe the purpose of this savings circle...'
            rows={3}
            className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm resize-none'
          />
        </div>

        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Target Amount (BTC) *
            </label>
            <input
              type='number'
              name='targetAmount'
              value={formData.targetAmount}
              onChange={handleInputChange}
              placeholder='0.1'
              step='0.001'
              min='0'
              className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Payment Type *
            </label>
            <select
              name='paymentType'
              value={formData.paymentType}
              onChange={handleInputChange}
              className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white backdrop-blur-sm'
            >
              <option
                value={PaymentType.OneTime}
                className='bg-gray-800 text-white'
              >
                One-Time Payment
              </option>
              <option
                value={PaymentType.Recurring}
                className='bg-gray-800 text-white'
              >
                Recurring Payments
              </option>
            </select>
          </div>
        </div>

        {formData.paymentType === PaymentType.Recurring && (
          <div className='bg-orange-500/20 rounded-lg p-4 border border-orange-500/30'>
            <label className='block text-sm font-medium text-orange-200 mb-2'>
              Monthly Contribution Amount (BTC) *
            </label>
            <input
              type='number'
              name='fixedAmount'
              value={formData.fixedAmount}
              onChange={handleInputChange}
              placeholder='0.01'
              step='0.001'
              min='0'
              className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm'
              required
            />
            <p className='text-xs text-orange-200 mt-2 flex items-center'>
              <span className='mr-1'>🔄</span>
              This amount will be contributed monthly by each member
            </p>
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Goal Deadline *
          </label>
          <input
            type='datetime-local'
            name='deadline'
            value={formData.deadline}
            onChange={handleInputChange}
            className='w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white backdrop-blur-sm'
            required
          />
        </div>

        {/* Transaction Status */}
        {isPending && (
          <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4'>
            <p className='text-blue-200 text-sm'>
              <strong>Transaction Pending:</strong> Please confirm the
              transaction in your wallet...
            </p>
          </div>
        )}

        {isConfirming && (
          <div className='bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4'>
            <p className='text-yellow-200 text-sm'>
              <strong>Confirming:</strong> Waiting for blockchain
              confirmation...
              {hash && (
                <span className='block mt-1 text-xs'>
                  Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Error Messages */}
        {(writeError || receiptError) && (
          <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
            <p className='text-red-200 text-sm'>
              <strong>Error:</strong>{" "}
              {writeError?.message || receiptError?.message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && (
          <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-4'>
            <p className='text-green-200 text-sm'>
              <strong>Success!</strong> Your circle has been created
              successfully!
              {hash && (
                <span className='block mt-1 text-xs'>
                  Transaction: {hash.slice(0, 6)}...{hash.slice(-4)}
                </span>
              )}
            </p>
          </div>
        )}

        <button
          onClick={createCircle}
          disabled={
            isPending ||
            isConfirming ||
            !isConnected ||
            !formData.name ||
            !formData.targetAmount ||
            !formData.deadline ||
            (formData.paymentType === PaymentType.Recurring &&
              !formData.fixedAmount)
          }
          className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg'
        >
          {isPending ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Creating Circle...
            </div>
          ) : isConfirming ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Confirming Transaction...
            </div>
          ) : (
            <div className='flex items-center justify-center'>
              <span className='mr-2'>🌱</span>
              Plant Your Circle
            </div>
          )}
        </button>

        {!isConnected && (
          <div className='text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30'>
            <p className='text-sm text-red-200'>
              ⚠️ Please connect your wallet to create a circle
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
