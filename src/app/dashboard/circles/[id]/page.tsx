"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Users,
  Bitcoin,
  Calendar,
  Clock,
  Globe,
  Lock,
  Target,
  Plus,
  Share2,
  Settings,
} from "lucide-react";
import { convertUsdToBtc } from "@/lib/btc-conversion";
import WalletConnection from "@/components/wallet-connection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ContributeForm from "@/components/contribute-form";

interface Circle {
  id: string;
  onChainId: number | null;
  name: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  deadline: number;
  paymentType: string;
  frequency: string;
  contributionAmount: string;
  isActive: boolean;
  syncStatus: string;
  memberCount: number;
  members: string[];
  creator: string;
  contractAddress: string | null;
}

// Helper function to format BTC amounts properly
const formatBtcAmount = (usdAmount: string) => {
  const btcAmount = convertUsdToBtc(usdAmount);
  const formattedBtc = Number(btcAmount).toFixed(8);
  const usdValue = `$${Number(usdAmount).toLocaleString()}`;
  return { btc: formattedBtc, usd: usdValue };
};

// Helper function to convert wei string to BTC decimal
const formatWeiToBtc = (weiAmount: string) => {
  if (!weiAmount || weiAmount === "0") return "0.001";
  const wei = BigInt(weiAmount);
  const btc = Number(wei) / 1e18;
  return btc.toFixed(8);
};

export default function CircleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { primaryWallet } = useDynamicConnection();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);

  const circleId = params.id as string;

  useEffect(() => {
    const fetchCircleDetails = async () => {
      if (!primaryWallet?.address || !circleId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/circles/${circleId}`, {
          headers: {
            "x-wallet-address": primaryWallet.address,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch circle details");
        }

        const circleData = await response.json();
        setCircle(circleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCircleDetails();
  }, [primaryWallet?.address, circleId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SYNCED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!primaryWallet?.address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <div className='max-w-md mx-auto'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Wallet Not Connected
            </h2>
            <p className='text-slate-400 mb-6'>
              Please connect your wallet to view circle details.
            </p>
            <WalletConnection />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-slate-400'>Loading circle details...</p>
        </div>
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto'>
            <h3 className='text-lg font-semibold text-red-400 mb-2'>
              Error Loading Circle
            </h3>
            <p className='text-red-300 text-sm mb-4'>
              {error || "Circle not found"}
            </p>
            <Button
              onClick={() => router.back()}
              variant='outline'
              className='border-red-500/30 text-red-400 hover:bg-red-500/10'
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress using real blockchain data
  const progressPercentage = Math.min(
    (Number(circle.currentAmount) / Number(circle.targetAmount)) * 100,
    100
  );

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='flex items-center mb-8'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.back()}
          className='text-slate-400 hover:text-white mr-4'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back
        </Button>

        <div className='flex-1'>
          <h1 className='text-3xl font-bold text-white mb-2'>{circle.name}</h1>
          <div className='flex items-center space-x-3'>
            <Badge
              variant='outline'
              className='border-slate-600 text-slate-300'
            >
              {circle.paymentType === "PUBLIC" ? (
                <>
                  <Globe className='w-3 h-3 mr-1' /> Public
                </>
              ) : (
                <>
                  <Lock className='w-3 h-3 mr-1' /> Private
                </>
              )}
            </Badge>
            {circle.onChainId && (
              <Badge
                variant='outline'
                className='border-slate-600 text-slate-300'
              >
                ID: #{circle.onChainId}
              </Badge>
            )}
          </div>
        </div>

        <div className='flex space-x-3'>
          <Dialog
            open={isContributeDialogOpen}
            onOpenChange={setIsContributeDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold'>
                <Plus className='w-4 h-4 mr-2' />
                Contribute
              </Button>
            </DialogTrigger>
            <DialogContent className='bg-slate-900 border-slate-700 max-w-md'>
              <DialogHeader>
                <DialogTitle className='text-white'>
                  Contribute to {circle.name}
                </DialogTitle>
                <DialogDescription className='text-slate-400'>
                  Make a contribution to this circle
                </DialogDescription>
              </DialogHeader>
              <ContributeForm
                circleId={circle.id}
                circleName={circle.name}
                requiredAmount={circle.contributionAmount}
                circleOwner={circle.creator}
                onClose={() => setIsContributeDialogOpen(false)}
                onSuccess={() => {
                  setIsContributeDialogOpen(false);
                  // Refresh circle data
                  window.location.reload();
                }}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant='outline'
            className='border-slate-600 text-slate-300 hover:bg-slate-700'
          >
            <Share2 className='w-4 h-4 mr-2' />
            Share
          </Button>

          <Button
            variant='outline'
            className='border-slate-600 text-slate-300 hover:bg-slate-700'
          >
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Circle Overview */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Progress Card */}
          <Card className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white'>
            <CardHeader>
              <CardTitle className='text-xl font-bold flex items-center space-x-3'>
                <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                  <Target className='w-5 h-5 text-white' />
                </div>
                <span>Progress Overview</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className='space-y-6'>
                {/* Progress Bar */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-slate-400'>
                      Current Progress
                    </span>
                    <span className='text-sm font-semibold text-white'>
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className='h-3 bg-slate-700'
                  />
                  <div className='flex items-center justify-between mt-2'>
                    <div className='text-sm'>
                      <div className='flex items-center space-x-1'>
                        <Bitcoin className='w-4 h-4 text-orange-500' />
                        <span className='font-semibold text-white'>
                          {formatBtcAmount(circle.currentAmount).btc} BTC
                        </span>
                      </div>
                      <div className='text-xs text-slate-500'>
                        {formatBtcAmount(circle.currentAmount).usd} raised
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='flex items-center space-x-1'>
                        <span className='text-sm text-slate-400'>Goal:</span>
                        <Bitcoin className='w-4 h-4 text-orange-500' />
                        <span className='font-semibold text-white'>
                          {formatBtcAmount(circle.targetAmount).btc} BTC
                        </span>
                      </div>
                      <div className='text-xs text-slate-500'>
                        {formatBtcAmount(circle.targetAmount).usd}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700'>
                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-2'>
                      <Bitcoin className='w-5 h-5 text-orange-500' />
                    </div>
                    <div className='font-semibold text-white'>
                      {circle.contributionAmount} BTC
                    </div>
                    <div className='text-xs text-slate-400'>
                      Per Contribution
                    </div>
                  </div>

                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-2'>
                      <Clock className='w-5 h-5 text-blue-500' />
                    </div>
                    <div className='font-semibold text-white'>
                      {circle.frequency}
                    </div>
                    <div className='text-xs text-slate-400'>Frequency</div>
                  </div>

                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-2'>
                      <Calendar className='w-5 h-5 text-green-500' />
                    </div>
                    <div className='font-semibold text-white'>
                      {new Date(circle.deadline * 1000).toLocaleDateString()}
                    </div>
                    <div className='text-xs text-slate-400'>Deadline</div>
                  </div>

                  <div className='text-center'>
                    <div className='flex items-center justify-center mb-2'>
                      <Users className='w-5 h-5 text-purple-500' />
                    </div>
                    <div className='font-semibold text-white'>
                      {circle.memberCount}
                    </div>
                    <div className='text-xs text-slate-400'>Members</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {circle.description && (
            <Card className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white'>
              <CardHeader>
                <CardTitle className='text-xl font-bold'>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-slate-300 leading-relaxed'>
                  {circle.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Circle Info */}
          <Card className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white'>
            <CardHeader>
              <CardTitle className='text-lg font-bold'>
                Circle Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Creator</span>
                <span className='text-white font-medium'>
                  {circle.creator.slice(0, 6)}...{circle.creator.slice(-4)}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-slate-400'>Deadline</span>
                <span className='text-white font-medium'>
                  {new Date(circle.deadline * 1000).toLocaleDateString()}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-slate-400'>Visibility</span>
                <span className='text-white font-medium'>
                  {circle.paymentType === "PUBLIC" ? "Public" : "Private"}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-slate-400'>Status</span>
                <Badge className={getStatusColor(circle.syncStatus)}>
                  {circle.syncStatus}
                </Badge>
              </div>

              {circle.contractAddress && (
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Contract</span>
                  <span className='text-white font-medium font-mono text-xs'>
                    {circle.contractAddress.slice(0, 6)}...
                    {circle.contractAddress.slice(-4)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity (placeholder) */}
          <Card className='bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700 text-white'>
            <CardHeader>
              <CardTitle className='text-lg font-bold'>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='text-sm text-slate-400 text-center py-4'>
                  No recent activity to show
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
