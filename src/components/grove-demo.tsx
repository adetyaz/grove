"use client";
import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEther } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GROVE_ABI,
  GROVE_CONTRACT_ADDRESS,
  PaymentType,
} from "@/contracts/constants";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Coins,
  Users,
  Calendar,
} from "lucide-react";

export default function GroveDemo() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    paymentType: PaymentType.OneTime,
    fixedAmount: "",
    deadline: "",
  });

  // Read contract data
  const { data: circleCount } = useReadContract({
    address: GROVE_CONTRACT_ADDRESS,
    abi: GROVE_ABI,
    functionName: "circleCount",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: parseInt(e.target.value) as PaymentType,
    }));
  };

  const createCircle = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const targetAmountWei = parseEther(formData.targetAmount);
      const fixedAmountWei = formData.fixedAmount
        ? parseEther(formData.fixedAmount)
        : BigInt(0);
      const deadlineTimestamp = BigInt(
        Math.floor(new Date(formData.deadline).getTime() / 1000)
      );

      await writeContract({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "createCircle",
        args: [
          formData.name,
          formData.description,
          targetAmountWei,
          formData.paymentType,
          fixedAmountWei,
          deadlineTimestamp,
        ],
      });

      // Reset form on successful transaction initiation
      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        paymentType: PaymentType.OneTime,
        fixedAmount: "",
        deadline: "",
      });
    } catch (error) {
      console.error("Error creating circle:", error);
      alert("Failed to create circle. Please try again.");
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-8'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          🌳 Grove Contract Demo
        </h1>
        <p className='text-gray-600'>
          Real-world integration with the Grove smart contract on Citrea
        </p>
        {circleCount !== undefined && circleCount !== null && (
          <div className='mt-4 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
            <Coins className='w-4 h-4 mr-1' />
            {circleCount.toString()} circles created so far
          </div>
        )}
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className='space-y-2'>
              <p className='text-green-700'>
                ✅ Connected to {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <p className='text-sm text-gray-600'>
                Ready to interact with Grove contract
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              <p className='text-red-700'>❌ Wallet not connected</p>
              <p className='text-sm text-gray-600'>
                Please connect your wallet to use Grove
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {(hash || isPending || isConfirming || isSuccess) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {isPending && (
                <Loader2 className='w-5 h-5 animate-spin text-blue-500' />
              )}
              {isConfirming && (
                <Loader2 className='w-5 h-5 animate-spin text-orange-500' />
              )}
              {isSuccess && <CheckCircle className='w-5 h-5 text-green-500' />}
              Transaction Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {isPending && (
                <p className='text-blue-700'>
                  📤 Transaction initiated... Please confirm in your wallet
                </p>
              )}
              {isConfirming && (
                <p className='text-orange-700'>
                  ⏳ Transaction confirming on Citrea...
                </p>
              )}
              {isSuccess && (
                <p className='text-green-700'>
                  🎉 Transaction confirmed! Circle created successfully
                </p>
              )}
              {hash && (
                <p className='text-sm text-gray-600 font-mono'>
                  TX: {hash.slice(0, 10)}...{hash.slice(-8)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Circle Form */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Create New Savings Circle
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Circle Name *
              </label>
              <Input
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Family Emergency Fund'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Target Amount (BTC) *
              </label>
              <Input
                type='number'
                name='targetAmount'
                value={formData.targetAmount}
                onChange={handleInputChange}
                placeholder='0.1'
                step='0.001'
                min='0'
                required
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Describe the purpose of this savings circle...'
              rows={3}
              className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Payment Type *
              </label>
              <select
                value={formData.paymentType.toString()}
                onChange={handleSelectChange}
                className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              >
                <option value={PaymentType.OneTime.toString()}>
                  One-Time Payment
                </option>
                <option value={PaymentType.Recurring.toString()}>
                  Recurring Payments
                </option>
              </select>
            </div>

            {formData.paymentType === PaymentType.Recurring && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Monthly Amount (BTC) *
                </label>
                <Input
                  type='number'
                  name='fixedAmount'
                  value={formData.fixedAmount}
                  onChange={handleInputChange}
                  placeholder='0.01'
                  step='0.001'
                  min='0'
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Deadline *
            </label>
            <Input
              type='datetime-local'
              name='deadline'
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button
            onClick={createCircle}
            disabled={
              !isConnected ||
              isPending ||
              isConfirming ||
              !formData.name ||
              !formData.targetAmount ||
              !formData.deadline ||
              (formData.paymentType === PaymentType.Recurring &&
                !formData.fixedAmount)
            }
            className='w-full bg-orange-600 hover:bg-orange-700'
            size='lg'
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {isPending ? "Confirming..." : "Creating Circle..."}
              </>
            ) : (
              <>
                <Calendar className='w-4 h-4 mr-2' />
                Create Circle on Citrea
              </>
            )}
          </Button>

          {!isConnected && (
            <div className='flex items-center justify-center p-4 bg-amber-50 border border-amber-200 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-amber-600 mr-2' />
              <span className='text-amber-700 text-sm'>
                Connect your wallet to create circles
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Contract Address:</span>
              <span className='font-mono'>{GROVE_CONTRACT_ADDRESS}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Network:</span>
              <span>Citrea Testnet</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Chain ID:</span>
              <span>5115</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
