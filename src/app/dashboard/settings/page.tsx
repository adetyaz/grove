"use client";

import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Bitcoin,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  Shield,
  Bell,
  Zap,
} from "lucide-react";
import { TREASURY_CONTRACT_ADDRESS, TREASURY_ABI } from "@/lib/contracts";
import { formatEther, parseEther } from "viem";
import { groveToast } from "@/lib/toast";
import WalletButton from "@/components/wallet-button";

export default function SettingsPage() {
  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [autoTopUp, setAutoTopUp] = useState(false);

  const { writeContractAsync } = useWriteContract();

  // Get user's vault info
  const { data: vaultData, refetch: refetchVault } = useReadContract({
    address: TREASURY_CONTRACT_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "getUserVault",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const handleDeposit = async () => {
    if (!depositAmount || !address) return;

    try {
      groveToast.info("Processing deposit...");

      await writeContractAsync({
        address: TREASURY_CONTRACT_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "depositToVault",
        args: [],
        value: parseEther(depositAmount),
      });

      groveToast.success(
        `Successfully deposited ${depositAmount} BTC to vault!`
      );
      setDepositAmount("");
      refetchVault();
    } catch (error: any) {
      groveToast.error(`Deposit failed: ${error.message}`);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !address) return;

    try {
      groveToast.info("Processing withdrawal...");

      await writeContractAsync({
        address: TREASURY_CONTRACT_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "withdrawFromVault",
        args: [parseEther(withdrawAmount)],
      });

      groveToast.success(
        `Successfully withdrew ${withdrawAmount} BTC from vault!`
      );
      setWithdrawAmount("");
      refetchVault();
    } catch (error: any) {
      groveToast.error(`Withdrawal failed: ${error.message}`);
    }
  };

  if (!address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <Settings className='w-16 h-16 text-slate-600 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-4'>
            Connect Your Wallet
          </h2>
          <p className='text-slate-400 mb-6'>
            Please connect your wallet to access settings.
          </p>
          <WalletButton
            variant='default'
            size='lg'
            className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          />
        </div>
      </div>
    );
  }

  const vaultBalance = vaultData
    ? Number(formatEther((vaultData as any)[0]))
    : 0;
  const lockedAmount = vaultData
    ? Number(formatEther((vaultData as any)[1]))
    : 0;
  const availableBalance = vaultBalance - lockedAmount;

  return (
    <div className='max-w-4xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Settings</h1>
        <p className='text-slate-400'>
          Manage your vault, preferences, and account settings
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Vault Management */}
        <div className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <CardTitle className='text-white flex items-center space-x-2'>
                <Wallet className='w-5 h-5' />
                <span>Vault Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Balance Overview */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                  <div>
                    <p className='text-sm text-slate-400'>Total Balance</p>
                    <p className='text-xl font-bold text-white flex items-center space-x-1'>
                      <Bitcoin className='w-5 h-5 text-orange-500' />
                      <span>{vaultBalance.toFixed(6)} BTC</span>
                    </p>
                  </div>
                  <Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
                    Available: {availableBalance.toFixed(6)} BTC
                  </Badge>
                </div>

                {lockedAmount > 0 && (
                  <div className='flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20'>
                    <div>
                      <p className='text-sm text-yellow-300'>
                        Locked in Circles
                      </p>
                      <p className='text-lg font-semibold text-yellow-200'>
                        {lockedAmount.toFixed(6)} BTC
                      </p>
                    </div>
                    <Shield className='w-5 h-5 text-yellow-500' />
                  </div>
                )}
              </div>

              {/* Deposit */}
              <div className='space-y-3'>
                <Label className='text-white flex items-center space-x-2'>
                  <ArrowUpCircle className='w-4 h-4 text-green-500' />
                  <span>Deposit to Vault</span>
                </Label>
                <div className='flex space-x-2'>
                  <Input
                    placeholder='Amount in BTC'
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className='bg-slate-700 border-slate-600 text-white'
                  />
                  <Button
                    onClick={handleDeposit}
                    disabled={!depositAmount}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    Deposit
                  </Button>
                </div>
              </div>

              {/* Withdraw */}
              <div className='space-y-3'>
                <Label className='text-white flex items-center space-x-2'>
                  <ArrowDownCircle className='w-4 h-4 text-blue-500' />
                  <span>Withdraw from Vault</span>
                </Label>
                <div className='flex space-x-2'>
                  <Input
                    placeholder='Amount in BTC'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className='bg-slate-700 border-slate-600 text-white'
                  />
                  <Button
                    onClick={handleWithdraw}
                    disabled={
                      !withdrawAmount ||
                      Number(withdrawAmount) > availableBalance
                    }
                    variant='outline'
                    className='border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
                  >
                    Withdraw
                  </Button>
                </div>
                <p className='text-xs text-slate-400'>
                  Available for withdrawal: {availableBalance.toFixed(6)} BTC
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className='space-y-6'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <CardTitle className='text-white flex items-center space-x-2'>
                <Settings className='w-5 h-5' />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Auto Top-up */}
              <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                <div>
                  <div className='flex items-center space-x-2'>
                    <Zap className='w-4 h-4 text-blue-500' />
                    <p className='font-medium text-white'>Auto Top-up</p>
                  </div>
                  <p className='text-sm text-slate-400'>
                    Automatically top up vault when balance is low
                  </p>
                </div>
                <Button
                  variant={autoTopUp ? "default" : "outline"}
                  size='sm'
                  onClick={() => setAutoTopUp(!autoTopUp)}
                >
                  {autoTopUp ? "ON" : "OFF"}
                </Button>
              </div>

              {/* Notifications */}
              <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                <div>
                  <div className='flex items-center space-x-2'>
                    <Bell className='w-4 h-4 text-purple-500' />
                    <p className='font-medium text-white'>Notifications</p>
                  </div>
                  <p className='text-sm text-slate-400'>
                    Get notified about circle activities
                  </p>
                </div>
                <Button variant='default' size='sm'>
                  ON
                </Button>
              </div>

              {/* Security */}
              <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                <div>
                  <div className='flex items-center space-x-2'>
                    <Shield className='w-4 h-4 text-green-500' />
                    <p className='font-medium text-white'>Enhanced Security</p>
                  </div>
                  <p className='text-sm text-slate-400'>
                    Require confirmation for large transactions
                  </p>
                </div>
                <Button variant='default' size='sm'>
                  ON
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <CardTitle className='text-white'>Account Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-slate-400'>Wallet Address</p>
                <p className='text-white font-mono text-sm break-all'>
                  {address}
                </p>
              </div>
              <div>
                <p className='text-sm text-slate-400'>Network</p>
                <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>
                  Citrea Testnet
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
