"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Users,
  Bitcoin,
  Calendar,
  Clock,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import WalletConnection from "@/components/wallet-connection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import ContributeForm from "@/components/contribute-form";

interface Circle {
  id: string;
  onChainId: number | null;
  name: string;
  description: string | null;
  targetAmount: string;
  contributionAmount: string;
  contributionInterval: string;
  durationDays: string;
  isPublic: boolean;
  syncStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyCirclesPage() {
  const { primaryWallet } = useDynamicConnection();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openContributeDialogs, setOpenContributeDialogs] = useState<{
    [key: string]: boolean;
  }>({});

  // Handle loading state for wallet connection
  useEffect(() => {
    // Give wallet some time to reconnect after page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch user's circles
  const {
    data: circles,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-circles", primaryWallet?.address, searchTerm],
    queryFn: async () => {
      if (!primaryWallet?.address) {
        throw new Error("Wallet not connected");
      }

      const params = new URLSearchParams();
      params.append("wallet", primaryWallet.address);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/user/circles?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch circles");
      }

      const data = await response.json();
      return data.circles || [];
    },
    enabled: !!primaryWallet?.address,
  });

  // Fetch BTC price
  const { data: btcPrice = 43000 } = useQuery({
    queryKey: ['btc-price'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        return parseFloat(data.bpi.USD.rate.replace(',', ''));
      } catch {
        return 43000; // fallback price
      }
    },
    refetchInterval: 60000, // refresh every minute
  });

  const filteredCircles =
    circles?.filter(
      (circle: Circle) =>
        circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circle.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatInterval = (seconds: string) => {
    const sec = parseInt(seconds);
    if (sec >= 86400) return `${Math.floor(sec / 86400)} days`;
    if (sec >= 3600) return `${Math.floor(sec / 3600)} hours`;
    if (sec >= 60) return `${Math.floor(sec / 60)} minutes`;
    return `${sec} seconds`;
  };

  const formatDuration = (days: string) => {
    const d = parseInt(days);
    if (d >= 365)
      return `${Math.floor(d / 365)} year${Math.floor(d / 365) > 1 ? "s" : ""}`;
    if (d >= 30)
      return `${Math.floor(d / 30)} month${Math.floor(d / 30) > 1 ? "s" : ""}`;
    return `${d} day${d > 1 ? "s" : ""}`;
  };

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

  if (isLoading) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <h2 className='text-xl font-bold text-white mb-2'>
            Connecting Wallet...
          </h2>
          <p className='text-slate-400'>
            Please wait while we connect to your wallet.
          </p>
        </div>
      </div>
    );
  }

  if (!primaryWallet?.address) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
        <div className='text-center py-12'>
          <div className='max-w-md mx-auto'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Wallet Not Connected
            </h2>
            <p className='text-slate-400 mb-6'>
              Please connect your wallet to view your circles.
            </p>
            <WalletConnection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 lg:px-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-white mb-2'>My Circles</h1>
          <p className='text-slate-400'>
            Manage and track the circles you&apos;ve created
          </p>
        </div>

        <div className='mt-4 md:mt-0'>
          <Link href='/create'>
            <Button className='bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'>
              <Plus className='w-5 h-5 mr-2' />
              Create New Circle
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8'>
        {/* Search */}
        <div className='lg:col-span-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
            <Input
              placeholder='Search circles...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className='bg-slate-800/50 rounded-lg p-4 border border-slate-700'>
          <div className='text-2xl font-bold text-white'>
            {filteredCircles.length}
          </div>
          <div className='text-sm text-slate-400'>Total Circles</div>
        </div>

        <div className='bg-slate-800/50 rounded-lg p-4 border border-slate-700'>
          <div className='text-2xl font-bold text-green-400'>
            {
              filteredCircles.filter((c: Circle) => c.syncStatus === "SYNCED")
                .length
            }
          </div>
          <div className='text-sm text-slate-400'>Active</div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-slate-400'>Loading your circles...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='text-center py-12'>
          <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto'>
            <h3 className='text-lg font-semibold text-red-400 mb-2'>
              Error Loading Circles
            </h3>
            <p className='text-red-300 text-sm mb-4'>
              {error instanceof Error
                ? error.message
                : "Failed to load circles"}
            </p>
            <Button
              onClick={() => refetch()}
              variant='outline'
              className='border-red-500/30 text-red-400 hover:bg-red-500/10'
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCircles.length === 0 && (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Users className='w-8 h-8 text-slate-400' />
          </div>
          <h3 className='text-xl font-semibold text-white mb-2'>
            {searchTerm ? "No circles found" : "No circles yet"}
          </h3>
          <p className='text-slate-400 mb-6'>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first circle to start building your savings goals"}
          </p>
          {!searchTerm && (
            <Link href='/create'>
              <Button className='bg--blue-600  text-white font-semibold px-6 py-2 rounded-lg'>
                <Plus className='w-5 h-5 mr-2' />
                Create Your First Circle
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Circles Grid */}
      {!isLoading && !error && filteredCircles.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredCircles.map((circle: Circle) => (
            <Card
              key={circle.id}
              className='bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-xl'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg font-bold text-white mb-2 line-clamp-1'>
                      {circle.name}
                    </CardTitle>

                    <div className='flex items-center space-x-2 mb-3'>
                      <Badge className={getStatusColor(circle.syncStatus)}>
                        {circle.syncStatus}
                      </Badge>

                      <Badge
                        variant='outline'
                        className='border-slate-600 text-slate-300'
                      >
                        {circle.isPublic ? (
                          <>
                            <Globe className='w-3 h-3 mr-1' /> Public
                          </>
                        ) : (
                          <>
                            <Lock className='w-3 h-3 mr-1' /> Private
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-slate-400 hover:text-white'
                    onClick={() =>
                      (window.location.href = `/dashboard/circles/${circle.id}`)
                    }
                  >
                    <ExternalLink className='w-4 h-4' />
                  </Button>
                </div>

                {circle.description && (
                  <p className='text-slate-400 text-sm line-clamp-2'>
                    {circle.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className='pt-0'>
                <div className='space-y-3'>
                  {/* Target Amount */}
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-400 text-sm'>
                      Target Amount
                    </span>
                    <div className='text-right'>
                      <div className='flex items-center space-x-1'>
                        <Bitcoin className='w-4 h-4 text-orange-500' />
                        <span className='font-semibold text-white'>
                          {circle.targetAmount} BTC
                        </span>
                      </div>
                      <div className='text-xs text-slate-500'>
                        ${(parseFloat(circle.targetAmount) * btcPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Contribution Amount */}
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-400 text-sm'>
                      Per Contribution
                    </span>
                    <div className='text-right'>
                      <div className='flex items-center space-x-1'>
                        <Bitcoin className='w-4 h-4 text-orange-500' />
                        <span className='font-semibold text-white'>
                          {circle.contributionAmount} BTC
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-400 text-sm'>Frequency</span>
                    <div className='flex items-center space-x-1'>
                      <Clock className='w-4 h-4 text-blue-500' />
                      <span className='font-semibold text-white'>
                        Every {formatInterval(circle.contributionInterval)}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className='flex items-center justify-between'>
                    <span className='text-slate-400 text-sm'>Duration</span>
                    <div className='flex items-center space-x-1'>
                      <Calendar className='w-4 h-4 text-green-500' />
                      <span className='font-semibold text-white'>
                        {formatDuration(circle.durationDays)}
                      </span>
                    </div>
                  </div>

                

                  {/* Created Date */}
                  <div className='flex items-center justify-between pt-2 border-t border-slate-700'>
                    <span className='text-slate-500 text-xs'>
                      Created {new Date(circle.createdAt).toLocaleDateString()}
                    </span>
                    {circle.onChainId && (
                      <span className='text-slate-500 text-xs'>
                        ID: #{circle.onChainId}
                      </span>
                    )}
                  </div>

                  {/* Contribute Button */}
                  <div className='pt-4'>
                    <Dialog
                      open={openContributeDialogs[circle.id] || false}
                      onOpenChange={(open) =>
                        setOpenContributeDialogs((prev) => ({
                          ...prev,
                          [circle.id]: open,
                        }))
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className='w-full bg-blue-600  text-white font-semibold'>
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
                          onChainId={circle.onChainId || 0}
                          circleName={circle.name}
                          circlePaymentType={
                            circle.isPublic ? "PUBLIC" : "PRIVATE"
                          }
                          requiredAmount={circle.contributionAmount}
                          circleOwner={primaryWallet?.address}
                          onClose={() =>
                            setOpenContributeDialogs((prev) => ({
                              ...prev,
                              [circle.id]: false,
                            }))
                          }
                          onSuccess={() => {
                            setOpenContributeDialogs((prev) => ({
                              ...prev,
                              [circle.id]: false,
                            }));
                            refetch();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
