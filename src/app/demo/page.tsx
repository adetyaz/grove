"use client";
import GroveDemo from "@/components/grove-demo";
import WalletButton from "@/components/wallet-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-orange-50'>
      {/* Header */}
      <header className='flex items-center justify-between p-4 lg:px-8 bg-white/80 backdrop-blur-sm border-b'>
        <div className='flex items-center space-x-8'>
          <Link href='/' className='text-2xl font-bold text-green-400'>
            🌳 Grove
          </Link>
          <span className='text-gray-600'>Live Demo</span>
        </div>
        <div className='flex items-center space-x-4'>
          <WalletButton variant='ghost' className='text-gray-700' />
          <Link href='/'>
            <Button variant='outline' size='sm'>
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Demo Content */}
      <main className='py-8'>
        <GroveDemo />
      </main>

      {/* Footer */}
      <footer className='text-center py-8 text-gray-500 text-sm'>
        <p>
          🚀 This demo connects to the actual Grove smart contract on Citrea
          testnet
        </p>
        <p className='mt-1'>
          Make sure you have Citrea testnet configured in your wallet
        </p>
      </footer>
    </div>
  );
}
