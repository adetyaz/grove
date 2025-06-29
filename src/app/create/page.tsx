"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import CircleForm from "@/components/circle-form";
import WalletButton from "@/components/wallet-button";
import { groveToast } from "@/lib/toast";

export default function CreateCircle() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleSuccess = () => {
    groveToast.success(
      "🎉 Circle created successfully! Redirecting to your dashboard..."
    );
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <div className='mb-6'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-green-500 rounded-full mb-4'>
              <span className='text-4xl'>🌳</span>
            </div>
          </div>
          <h1 className='text-5xl font-bold text-white mb-6'>
            Plant Your Savings Seed
          </h1>
          <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
            Create a collaborative savings circle and watch your Bitcoin grow
            together. Set goals, invite friends, and achieve financial
            milestones as a community.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Form Section */}
          <div className='order-2 lg:order-1'>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center'>
              {isConnected ? (
                <>
                  <div className='mb-6'>
                    <h2 className='text-2xl font-bold text-white mb-2'>
                      Create Your Circle
                    </h2>
                    <p className='text-gray-300'>
                      Fill in the details to start your savings journey
                    </p>
                  </div>
                  <CircleForm onSuccess={handleSuccess} />
                </>
              ) : (
                <>
                  <div className='mb-6'>
                    <div className='w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <span className='text-2xl'>🔗</span>
                    </div>
                    <h2 className='text-2xl font-semibold text-white mb-4'>
                      Connect Your Wallet
                    </h2>
                    <p className='text-gray-300 mb-6'>
                      Connect your wallet to start creating savings circles on
                      Citrea&apos;s Bitcoin L2
                    </p>
                  </div>
                  <WalletButton
                    variant='default'
                    size='lg'
                    className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white mb-6 px-8 py-3 text-lg'
                  >
                    Connect Wallet to Start
                  </WalletButton>
                  <div className='bg-orange-500/20 rounded-lg p-4'>
                    <p className='text-sm text-orange-200'>
                      💡 Make sure you&apos;re connected to Citrea testnet
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Benefits Section */}
          <div className='order-1 lg:order-2'>
            <div className='bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10'>
              <h3 className='text-2xl font-bold text-white mb-6'>
                💡 How Grove Works
              </h3>

              <div className='space-y-6'>
                <div className='flex items-start space-x-4'>
                  <div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-white text-sm font-bold'>1</span>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-white mb-2'>
                      Set Your Goal
                    </h4>
                    <p className='text-gray-300'>
                      Define your savings target and timeline. Whether it&apos;s
                      an emergency fund or dream vacation!
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-white text-sm font-bold'>2</span>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-white mb-2'>
                      Choose Payment Style
                    </h4>
                    <p className='text-gray-300'>
                      Pick one-time contributions or set up recurring monthly
                      payments for steady progress.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-white text-sm font-bold'>3</span>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-white mb-2'>
                      Invite Your Circle
                    </h4>
                    <p className='text-gray-300'>
                      Add family and friends via email or wallet address to grow
                      your savings together.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-white text-sm font-bold'>4</span>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-white mb-2'>
                      Track & Achieve
                    </h4>
                    <p className='text-gray-300'>
                      Monitor progress, celebrate milestones, and unlock
                      achievements on Bitcoin&apos;s most secure L2.
                    </p>
                  </div>
                </div>
              </div>

              <div className='mt-8 p-4 bg-gradient-to-r from-orange-500/20 to-green-500/20 rounded-lg border border-orange-500/30'>
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='text-lg'>🔒</span>
                  <span className='text-orange-200 font-semibold'>
                    Bitcoin-Native Security
                  </span>
                </div>
                <p className='text-sm text-gray-300'>
                  All transactions settle on Bitcoin L1 via Citrea&apos;s
                  ZK-Rollup technology
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
