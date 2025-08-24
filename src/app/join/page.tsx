"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/lib/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Button } from "@/components/ui/button";
import { groveToast } from "@/lib/toast";

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const circleId = searchParams.get("circleId") ?? "";
  const inviter = searchParams.get("inviter") ?? "";
  const { user, primaryWallet, isConnected, connect } = useDynamicConnection();
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [shouldAutoJoin, setShouldAutoJoin] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const {
    isSuccess: txSuccess,
    isError: txError,
    error: txErrorObj,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Check if user is already a member on blockchain
  const { data: isAlreadyMember, isLoading: checkingMembership } =
    useReadContract({
      address: GROVE_CONTRACT_ADDRESS,
      abi: GROVE_ABI,
      functionName: "isMemberOf",
      args:
        circle?.onChainId && primaryWallet?.address
          ? [BigInt(circle.onChainId), primaryWallet.address]
          : undefined,
      query: {
        enabled: !!(circle?.onChainId && primaryWallet?.address && isConnected),
      },
    });

  // Fetch circle data
  useEffect(() => {
    if (!circleId) return;
    setLoading(true);
    fetch(`/api/circles/${circleId}`)
      .then(async (res) => {
        if (!res.ok) {
          setCircle(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data && (data.id || (data.circle && data.circle.id))) {
          setCircle(data.circle ? data.circle : data);
        } else {
          setCircle(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setCircle(null);
        setLoading(false);
      });
  }, [circleId]);

  // Join handler: triggers contract tx, then DB update after confirmation
  const handleJoin = useCallback(async () => {
    if (!isConnected || !primaryWallet) {
      groveToast.error(
        "Wallet not connected. Please connect your wallet first."
      );
      return;
    }

    if (!user || !primaryWallet?.address) {
      groveToast.error("Please connect your wallet and email to join.");
      return;
    }

    if (!circle?.onChainId) {
      groveToast.error(
        "Circle is not yet synced with blockchain. Please try again later."
      );
      return;
    }

    setJoining(true);

    try {
      console.log("🔍 Checking if user is already a member on blockchain...");
      console.log("Membership check result:", {
        isAlreadyMember,
        checkingMembership,
      });

      // If user is already a member on blockchain, skip transaction and just sync to DB
      if (isAlreadyMember) {
        console.log(
          "✅ User is already a member on blockchain, syncing to database..."
        );
        groveToast.info("You're already a member! Syncing to database...");

        try {
          const res = await fetch("/api/circles/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              circleId,
              address: primaryWallet.address,
              email: user.email,
            }),
          });
          const data = await res.json();

          if (data.success) {
            groveToast.success("You have joined the circle!");
            setNavigating(true);
            router.push("/dashboard");
          } else {
            console.error("Join API error:", data);
            groveToast.warning(
              "You're already a member! Redirecting to dashboard..."
            );
            setNavigating(true);
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Database sync error:", err);
          groveToast.warning(
            "You're already a member! Redirecting to dashboard..."
          );
          setNavigating(true);
          router.push("/dashboard");
        }
        return;
      }

      // If not a member, proceed with blockchain transaction

      groveToast.info(
        "Confirm the transaction in your wallet to join the circle."
      );

      try {
        const hash = await writeContractAsync({
          address: GROVE_CONTRACT_ADDRESS,
          abi: GROVE_ABI,
          functionName: "joinCircle",
          args: [BigInt(circle.onChainId)],
        });
        setTxHash(hash as `0x${string}`);
      } catch (contractError: any) {
        const errorMessage =
          contractError?.message ||
          contractError?.toString() ||
          "Unknown error";

        if (errorMessage.includes("Connector not connected")) {
          throw new Error(
            "Wallet connection lost. Please reconnect your wallet and try again."
          );
        } else if (errorMessage.includes("User rejected")) {
          throw new Error("Transaction was rejected. Please try again.");
        } else if (
          errorMessage.includes("already") ||
          errorMessage.includes("member")
        ) {
          // Handle case where blockchain says user is already a member

          groveToast.info("You're already a member! Syncing to database...");

          try {
            const res = await fetch("/api/circles/join", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                circleId,
                address: primaryWallet.address,
                email: user.email,
              }),
            });
            const data = await res.json();

            if (data.success) {
              groveToast.success("You have joined the circle!");
            } else {
              groveToast.warning("You're already a member!");
            }
            setNavigating(true);
            router.push("/dashboard");
            return;
          } catch {
            groveToast.warning(
              "You're already a member! Redirecting to dashboard..."
            );
            setNavigating(true);
            router.push("/dashboard");
            return;
          }
        } else {
          throw contractError;
        }
      }
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? (err as any).message
          : String(err);

      groveToast.error("Failed to join circle. " + message);
      setJoining(false);
    }
  }, [
    user,
    primaryWallet,
    circle?.onChainId,
    circleId,
    writeContractAsync,
    isAlreadyMember,
    checkingMembership,
    isConnected,
    router,
  ]);

  useEffect(() => {
    if (isConnected && shouldAutoJoin && circle && !joining && !navigating) {
      console.log("🚀 Auto-joining after wallet connection");
      setShouldAutoJoin(false);
      handleJoin();
    }
  }, [isConnected, shouldAutoJoin, circle, joining, navigating, handleJoin]);

  useEffect(() => {
    const syncDb = async () => {
      if (txSuccess && txHash && user && primaryWallet?.address) {
        try {
          const res = await fetch("/api/circles/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              circleId,
              address: primaryWallet.address,
              email: user.email,
            }),
          });
          const data = await res.json();
          if (data.success) {
            groveToast.success("You have joined the circle!");
            setNavigating(true);
            router.push("/dashboard");
          } else {
            console.error("Join API error:", data);
            const errorMessage =
              data.error || "Failed to join circle (DB sync).";

            // If user is already a member on blockchain but database sync failed,
            // provide a helpful error message
            if (
              errorMessage.includes("already") ||
              data.details?.includes("already")
            ) {
              groveToast.warning(
                "You're already a member! Redirecting to dashboard..."
              );
              setNavigating(true);
              router.push("/dashboard");
            } else {
              groveToast.error(errorMessage);
              setJoining(false);
            }
          }
        } catch (err) {
          const message =
            typeof err === "object" && err && "message" in err
              ? (err as any).message
              : String(err);
          groveToast.error("Failed to sync with database. " + message);
          setJoining(false);
        }
      }
    };
    if (txSuccess) syncDb();
    if (txError) {
      const message =
        txErrorObj && typeof txErrorObj === "object" && "message" in txErrorObj
          ? (txErrorObj as any).message
          : String(txErrorObj);
      groveToast.error(
        "Transaction failed or was reverted." + (message ? ` ${message}` : "")
      );
      setJoining(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txSuccess, txError]);

  const showInvalid = !circleId;
  const showLoading = loading;
  const showNotFound = !loading && !circle && !!circleId;

  const formatDeadline = (deadline: any) => {
    if (!deadline) return "-";

    let ts = typeof deadline === "string" ? parseInt(deadline) : deadline;
    if (ts > 1e12) ts = Math.floor(ts / 1000);
    const date = new Date(ts * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4'>
      <div className='max-w-xl w-full mx-auto p-4 sm:p-8 rounded-xl shadow-lg bg-gray-900/80 text-center'>
        {showInvalid ? (
          <>
            <h1 className='text-xl sm:text-2xl font-bold text-white mb-4'>
              Invalid Link
            </h1>
            <p className='mb-6 text-sm sm:text-base text-gray-300'>
              No circleId provided in the link.
            </p>
            <a
              href='/dashboard'
              className='px-4 sm:px-6 py-2 sm:py-3 rounded bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold shadow hover:opacity-90 transition text-sm sm:text-base'
            >
              Go back to dashboard
            </a>
          </>
        ) : showLoading ? (
          <>
            <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
              Loading Circle Details
            </h3>
            <p className='text-sm sm:text-base text-gray-300'>
              Fetching circle data...
            </p>
          </>
        ) : showNotFound ? (
          <>
            <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>❌</span>
            </div>
            <h1 className='text-xl sm:text-2xl font-bold text-white mb-4'>
              Circle Not Found
            </h1>
            <p className='mb-6 text-sm sm:text-base text-gray-300'>
              No circle found for ID: {circleId}
            </p>
            <a
              href='/dashboard'
              className='px-4 sm:px-6 py-2 sm:py-3 rounded bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold shadow hover:opacity-90 transition text-sm sm:text-base'
            >
              Go back to dashboard
            </a>
          </>
        ) : (
          <>
            <h1 className='text-xl sm:text-2xl font-bold text-white mb-4'>
              Join {circle.name}
            </h1>
            <p className='mb-2 text-sm sm:text-base text-gray-300'>
              {circle.description}
            </p>
            <div className='my-4 grid grid-cols-2 gap-3 sm:gap-4'>
              <div className='bg-gray-800/70 rounded-lg p-3 hover:bg-gray-800/90 transition-colors'>
                <span className='block text-xs text-gray-400'>Target</span>
                <span className='font-semibold text-green-300 text-sm sm:text-base'>
                  {circle.targetAmount}
                </span>
              </div>
              <div className='bg-gray-800/70 rounded-lg p-3 hover:bg-gray-800/90 transition-colors'>
                <span className='block text-xs text-gray-400'>Current</span>
                <span className='font-semibold text-orange-300 text-sm sm:text-base'>
                  {circle.currentAmount}
                </span>
              </div>
              <div className='bg-gray-800/70 rounded-lg p-3 hover:bg-gray-800/90 transition-colors'>
                <span className='block text-xs text-gray-400'>Members</span>
                <span className='font-semibold text-blue-600 text-sm sm:text-base'>
                  {circle.memberCount}
                </span>
              </div>
              <div className='bg-gray-800/70 rounded-lg p-3 hover:bg-gray-800/90 transition-colors'>
                <span className='block text-xs text-gray-400'>Deadline</span>
                <span className='font-semibold text-yellow-300 text-sm sm:text-base'>
                  {formatDeadline(circle.deadline)}
                </span>
              </div>
            </div>
            {inviter && (
              <div className='mb-4 text-xs sm:text-sm text-gray-400'>
                Invited by:{" "}
                <span className='font-mono text-white'>{inviter}</span>
              </div>
            )}
            {/* Membership Status */}
            {isConnected && checkingMembership && (
              <div className='mb-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3'>
                <p className='text-blue-200 text-xs sm:text-sm text-center'>
                  <span className='animate-spin inline-block mr-2'>⏳</span>
                  Checking membership status...
                </p>
              </div>
            )}
            {isConnected && !checkingMembership && isAlreadyMember && (
              <div className='mb-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3'>
                <p className='text-green-200 text-xs sm:text-sm text-center'>
                  <span className='mr-2'>✅</span>
                  You&apos;re already a member! Click to sync with database.
                </p>
              </div>
            )}
            {!isConnected ? (
              <Button
                onClick={() => {
                  setShouldAutoJoin(true);
                  connect();
                }}
                className='mt-6 w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-300 text-sm sm:text-base'
                disabled={joining || navigating}
              >
                {joining
                  ? "Connecting & Joining..."
                  : "Connect Wallet & Join Circle"}
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                className='mt-6 w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all duration-300 text-sm sm:text-base'
                disabled={joining || navigating || checkingMembership}
              >
                {navigating
                  ? "Redirecting to Dashboard..."
                  : joining
                  ? isAlreadyMember
                    ? "Syncing to Database..."
                    : "Joining Circle..."
                  : checkingMembership
                  ? "Checking Membership..."
                  : isAlreadyMember
                  ? "Sync to Database"
                  : "Join Circle"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function JoinPageLoadingFallback() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-gray-200 mx-auto mb-4'></div>
        <p className='text-white text-lg'>Loading invitation...</p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<JoinPageLoadingFallback />}>
      <JoinPageContent />
    </Suspense>
  );
}
