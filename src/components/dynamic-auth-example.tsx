"use client";
import { useDynamicAuth } from "@/lib/dynamic";
import { Button } from "@/components/ui/button";

export default function DynamicAuthExample() {
  const {
    sdkHasLoaded,
    isLoggedIn,
    user,
    // userWithMissingInfo,
    primaryWallet,
    isAuthenticated,
    needsOnboarding,
  } = useDynamicAuth();

  // Show loading state while SDK loads
  if (!sdkHasLoaded) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600'></div>
        <span className='ml-2'>Loading Dynamic SDK...</span>
      </div>
    );
  }

  // Show different states based on user authentication
  if (needsOnboarding) {
    return (
      <div className='text-center p-6 bg-yellow-50 rounded-lg'>
        <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
          Complete Your Profile
        </h3>
        <p className='text-yellow-600 mb-4'>
          You&apos;re authenticated but need to complete the onboarding process.
        </p>
        <Button className='bg-yellow-600 hover:bg-yellow-700'>
          Continue Setup
        </Button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className='text-center p-6 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
          Connect Your Wallet
        </h3>
        <p className='text-gray-600 mb-4'>
          Please connect your wallet to access Grove features.
        </p>
        <Button className='bg-orange-600 hover:bg-orange-700'>
          Connect Wallet
        </Button>
      </div>
    );
  }

  // User is fully logged in
  return (
    <div className='p-6 bg-green-50 rounded-lg'>
      <h3 className='text-lg font-semibold text-green-800 mb-4'>
        🎉 Welcome to Grove!
      </h3>

      <div className='space-y-3 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Status:</span>
          <span className='font-medium text-green-700'>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </span>
        </div>

        {user?.email && (
          <div className='flex justify-between'>
            <span className='text-gray-600'>Email:</span>
            <span className='font-mono text-sm'>{user.email}</span>
          </div>
        )}

        {primaryWallet?.address && (
          <div className='flex justify-between'>
            <span className='text-gray-600'>Wallet:</span>
            <span className='font-mono text-sm'>
              {primaryWallet.address.slice(0, 6)}...
              {primaryWallet.address.slice(-4)}
            </span>
          </div>
        )}

        {primaryWallet?.chain && (
          <div className='flex justify-between'>
            <span className='text-gray-600'>Network:</span>
            <span className='font-medium'>{primaryWallet.chain}</span>
          </div>
        )}
      </div>

      <div className='mt-4 pt-4 border-t border-green-200'>
        <Button
          variant='outline'
          size='sm'
          className='w-full border-green-300 text-green-700 hover:bg-green-100'
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}
