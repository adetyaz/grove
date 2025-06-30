"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletButton from "@/components/wallet-button";
import {
  formatBTCAmount,
  formatDeadline,
  calculateProgress,
} from "@/lib/grove-contract";
import { GROVE_ABI, GROVE_CONTRACT_ADDRESS } from "@/contracts/constants";
import { Loader2, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { groveToast } from "@/lib/toast";

interface InvitationData {
  id: string;
  circleId: number;
  inviterEmail: string;
  status: string;
  expiresAt: string;
  isValid: boolean;
  isExpired: boolean;
  circle: {
    id: number;
    name: string;
    description?: string;
    targetAmount: string;
    deadline: string;
    currentAmount?: bigint;
    memberCount?: number;
    isActive?: boolean;
  };
}

export default function InvitePage() {
  const params = useParams();
  const { user, primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;
  const isConnected = !!(user && primaryWallet?.address);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const invitationId = params.invitationId as string;

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${invitationId}`);
        const data = await response.json();

        if (response.ok) {
          setInvitation(data.invitation);
        } else {
          setError(data.error || "Invitation not found");
        }
      } catch (err) {
        console.error("Error fetching invitation:", err);
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    if (invitationId) {
      fetchInvitation();
    }
  }, [invitationId]);

  const acceptInvitation = async () => {
    if (!isConnected || !address) {
      groveToast.error("Please connect your wallet first");
      return;
    }

    if (!userEmail) {
      setShowEmailInput(true);
      groveToast.info("Please enter your email address to continue");
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      // First, validate the invitation on the backend
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          userEmail,
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      if (data.alreadyMember) {
        groveToast.info(
          `You're already a member of "${invitation?.circle.name}"`
        );
        setSuccess(true);
        return;
      }

      // Now execute the actual contract call to add member
      if (data.contractCall) {
        groveToast.info("Adding you to the circle on the blockchain...");
        await writeContract({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "addMember",
          args: [BigInt(invitation!.circleId), address as `0x${string}`],
        });

        // Success will be handled by the transaction confirmation
      }
    } catch (err) {
      console.error("Error accepting invitation:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      groveToast.error(`Failed to accept invitation: ${errorMessage}`);
      setAccepting(false);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && invitation) {
      groveToast.memberJoined("You", invitation.circle.name);
      setSuccess(true);
      setAccepting(false);
    }
  }, [isConfirmed, invitation]);

  // Handle transaction hash
  useEffect(() => {
    if (hash) {
      groveToast.transactionPending(hash);
    }
  }, [hash]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex items-center justify-center p-8'>
            <div className='text-center'>
              <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-orange-600' />
              <p className='text-gray-600'>Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-700'>
              <XCircle className='h-5 w-5' />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-red-600 mb-4'>{error}</p>
            <Button
              onClick={() => (window.location.href = "/")}
              className='w-full'
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-green-700'>
              <CheckCircle className='h-5 w-5' />
              Invitation Accepted!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-green-600 mb-4'>
              You&apos;ve successfully joined &ldquo;{invitation.circle.name}
              &rdquo;!
            </p>
            <p className='text-sm text-gray-600 mb-4'>
              You should now be added to the circle on the blockchain. Check
              your wallet for the transaction confirmation.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className='w-full'
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation.isValid) {
    const reason = invitation.isExpired ? "expired" : "already processed";
    return (
      <div className='min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-yellow-700'>
              <Clock className='h-5 w-5' />
              Invitation {reason}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-yellow-600 mb-4'>
              This invitation has {reason} and is no longer valid.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className='w-full'
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const targetAmount = BigInt(invitation.circle.targetAmount || "0");
  const currentAmount = invitation.circle.currentAmount || BigInt(0);
  const progress = calculateProgress(currentAmount, targetAmount);

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <Card>
          <CardHeader>
            <CardTitle className='text-center text-2xl text-orange-900'>
              🌳 You&apos;re Invited to Join Grove
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                &ldquo;{invitation.circle.name}&rdquo;
              </h2>
              {invitation.circle.description && (
                <p className='text-gray-600'>{invitation.circle.description}</p>
              )}
            </div>

            <div className='bg-orange-50 rounded-lg p-6'>
              <h3 className='font-semibold text-orange-900 mb-4'>
                Circle Details
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Target Amount:</span>
                  <span className='font-medium'>
                    {formatBTCAmount(targetAmount)} BTC
                  </span>
                </div>

                {invitation.circle.currentAmount !== undefined && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Current Amount:</span>
                      <span className='font-medium'>
                        {formatBTCAmount(currentAmount)} BTC
                      </span>
                    </div>

                    <div>
                      <div className='flex justify-between text-sm text-gray-600 mb-1'>
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-orange-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}

                <div className='flex justify-between'>
                  <span className='text-gray-600'>Deadline:</span>
                  <span className='font-medium'>
                    {formatDeadline(
                      BigInt(
                        new Date(invitation.circle.deadline).getTime() / 1000
                      )
                    )}
                  </span>
                </div>

                {invitation.circle.memberCount !== undefined && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Members:</span>
                    <span className='font-medium flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      {invitation.circle.memberCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='text-center'>
              {!isConnected ? (
                <div className='space-y-4'>
                  <p className='text-gray-600'>
                    Please connect your wallet to join this savings circle.
                  </p>
                  <WalletButton
                    variant='default'
                    size='lg'
                    className='w-full bg-orange-600 hover:bg-orange-700 text-white'
                  >
                    Connect Wallet to Join
                  </WalletButton>
                </div>
              ) : showEmailInput ? (
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address *
                    </label>
                    <input
                      type='email'
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder='your.email@example.com'
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      required
                    />
                  </div>
                  <div className='flex space-x-3'>
                    <Button
                      onClick={() => setShowEmailInput(false)}
                      variant='outline'
                      className='flex-1'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={acceptInvitation}
                      disabled={!userEmail.trim() || accepting}
                      className='flex-1 bg-orange-600 hover:bg-orange-700'
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <p className='text-gray-600'>
                    Ready to join this savings circle? You&apos;ll be able to
                    contribute and help reach the shared goal.
                  </p>

                  {accepting || isWritePending || isConfirming ? (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                      <div className='flex items-center justify-center'>
                        <Loader2 className='h-5 w-5 animate-spin mr-2 text-blue-600' />
                        <span className='text-blue-800'>
                          {accepting && !hash
                            ? "Preparing to join..."
                            : isWritePending
                              ? "Confirm transaction in wallet..."
                              : isConfirming
                                ? "Adding you to the circle..."
                                : "Processing..."}
                        </span>
                      </div>
                      {hash && (
                        <p className='text-xs text-blue-600 mt-2 text-center'>
                          Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={acceptInvitation}
                      className='w-full bg-orange-600 hover:bg-orange-700 text-lg py-3'
                    >
                      🌱 Join This Circle
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className='text-sm text-gray-500 text-center'>
              <p>
                Invitation expires:{" "}
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
