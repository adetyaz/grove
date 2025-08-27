"use client";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useRouter } from "next/navigation";
import CircleForm from "@/components/circle-form";
import WalletButton from "@/components/wallet-button";
import { groveToast } from "@/lib/toast";

export default function CreateCircle() {
  const { user, primaryWallet } = useDynamicConnection();
  const router = useRouter();

  const isConnected = !!(user && primaryWallet?.address);

  const handleSuccess = () => {
    groveToast.success(
      "🎉 Circle created successfully! Redirecting to your dashboard..."
    );
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className='min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Create New Circle
          </h1>
          <p className='text-slate-400'>
            Start your collaborative savings journey with friends and family
          </p>
        </div>

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div className='bg-slate-800/50 border border-slate-700 rounded-lg p-4'>
            <div className='flex items-center space-x-2 mb-2'>
              <span className='text-2xl'>🎯</span>
              <h3 className='font-semibold text-white'>Set Goals</h3>
            </div>
            <p className='text-sm text-slate-400'>
              Define your savings target and contribution schedule together
            </p>
          </div>

          <div className='bg-slate-800/50 border border-slate-700 rounded-lg p-4'>
            <div className='flex items-center space-x-2 mb-2'>
              <span className='text-2xl'>👥</span>
              <h3 className='font-semibold text-white'>Invite Members</h3>
            </div>
            <p className='text-sm text-slate-400'>
              Add trusted friends and family to grow savings collectively
            </p>
          </div>

          <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-4'>
            <div className='flex items-center space-x-2 mb-2'>
              <span className='text-2xl'>⚠️</span>
              <h3 className='font-semibold text-red-400'>Punishment System</h3>
            </div>
            <p className='text-sm text-red-300'>
              Missing contributions triggers penalties. Members face temporary
              restrictions and potential circle removal
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className='bg-slate-800/50 border border-slate-700 rounded-lg p-6'>
          {isConnected ? (
            <>
              <div className='mb-6 text-center'>
                <h2 className='text-xl font-semibold text-white mb-2'>
                  Circle Details
                </h2>
                <p className='text-slate-400'>
                  Fill in the information below to create your savings circle
                </p>
              </div>
              <CircleForm onSuccess={handleSuccess} />
            </>
          ) : (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🔗</span>
              </div>
              <h2 className='text-2xl font-semibold text-white mb-4'>
                Connect Your Wallet
              </h2>
              <p className='text-slate-400 mb-6'>
                Connect your wallet to start creating savings circles on Citrea
                testnet
              </p>
              <WalletButton
                variant='default'
                size='lg'
                className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg'
              >
                Connect Wallet to Start
              </WalletButton>
              <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-6'>
                <p className='text-sm text-blue-200'>
                  💡 Make sure you&apos;re connected to Citrea testnet
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
