"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, User, Clock } from "lucide-react";
import { groveToast } from "@/lib/toast";

interface Contribution {
  id: string;
  contributor: string;
  amount: string;
  timestamp: string;
  txHash?: string;
}

export default function ContributionHistory({
  contributions = [],
}: {
  contributions?: Contribution[];
}) {
  // Mock contributions for now - this will be replaced with real blockchain data
  const mockContributions: Contribution[] = [
    {
      id: "1",
      contributor: "0x742d35Cc6634C0532925a3b8D33AA6183EDf77AE",
      amount: "0.001",
      timestamp: "2024-01-15T10:30:00Z",
      txHash: "0x1234567890abcdef",
    },
    {
      id: "2",
      contributor: "0x8ba1f109551bD432803012645Hac136c22C10F7E",
      amount: "0.002",
      timestamp: "2024-01-14T15:45:00Z",
      txHash: "0xabcdef1234567890",
    },
    {
      id: "3",
      contributor: "0x742d35Cc6634C0532925a3b8D33AA6183EDf77AE",
      amount: "0.0015",
      timestamp: "2024-01-13T09:20:00Z",
      txHash: "0x567890abcdef1234",
    },
  ];

  const displayContributions =
    contributions.length > 0 ? contributions : mockContributions;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyTxHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    groveToast.copySuccess("Transaction hash");
  };

  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-white flex items-center gap-2'>
          <TrendingUp className='w-5 h-5' />
          Contribution History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayContributions.length === 0 ? (
          <div className='text-center py-8'>
            <TrendingUp className='w-12 h-12 text-gray-600 mx-auto mb-4' />
            <p className='text-gray-400 mb-2'>No contributions yet</p>
            <p className='text-sm text-gray-500'>
              Be the first to contribute to this circle!
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {displayContributions.map((contribution) => (
              <div
                key={contribution.id}
                className='flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/50'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
                    <User className='w-5 h-5 text-green-400' />
                  </div>
                  <div>
                    <p className='text-white font-medium'>
                      {formatAddress(contribution.contributor)}
                    </p>
                    <div className='flex items-center space-x-2 text-xs text-gray-400'>
                      <Clock className='w-3 h-3' />
                      <span>{formatDate(contribution.timestamp)}</span>
                      {contribution.txHash && (
                        <button
                          onClick={() => copyTxHash(contribution.txHash!)}
                          className='text-blue-400 hover:text-blue-300 underline'
                          title='Click to copy transaction hash'
                        >
                          View Tx
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-white font-semibold'>
                    +{contribution.amount} BTC
                  </p>
                  <p className='text-xs text-gray-400'>Contribution</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
