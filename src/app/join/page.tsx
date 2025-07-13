"use client";
import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GROVE_CONTRACT_ADDRESS, GROVE_ABI } from "@/contracts/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Button } from "@/components/ui/button";
import { groveToast } from "@/lib/toast";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const circleId = searchParams.get("circleId") ?? "";
  const inviter = searchParams.get("inviter") ?? "";
  const { user, primaryWallet, isConnected, connect } = useDynamicConnection();
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  // Only call hooks once at top level
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const {
    isSuccess: txSuccess,
    isError: txError,
    error: txErrorObj,
  } = useWaitForTransactionReceipt({ hash: txHash });

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

  // Effect: when tx confirmed, update DB
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
            router.push("/dashboard");
          } else {
            groveToast.error(data.error || "Failed to join circle (DB sync).");
          }
        } catch (err) {
          const message =
            typeof err === "object" && err && "message" in err
              ? (err as any).message
              : String(err);
          groveToast.error("Failed to sync with database. " + message);
        } finally {
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

  // Always render, but show error UI if no circleId
  const showInvalid = !circleId;

  // Always render, but show loading UI if loading
  const showLoading = loading;

  // Always render, but show not found UI if no circle
  const showNotFound = !loading && !circle && !!circleId;

  // (removed duplicate contract/tx state)

  // Join handler: triggers contract tx, then DB update after confirmation
  const handleJoin = async () => {
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
      groveToast.info(
        "Confirm the transaction in your wallet to join the circle."
      );
      const hash = await writeContractAsync({
        address: GROVE_CONTRACT_ADDRESS,
        abi: GROVE_ABI,
        functionName: "joinCircle",
        args: [BigInt(circle.onChainId)],
      });
      setTxHash(hash as `0x${string}`);
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? (err as any).message
          : String(err);
      groveToast.error("Failed to send transaction. " + message);
      setJoining(false);
    }
  };

  // Effect: when tx confirmed, update DB
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
            router.push("/dashboard");
          } else {
            groveToast.error(data.error || "Failed to join circle (DB sync).");
          }
        } catch (err) {
          const message =
            typeof err === "object" && err && "message" in err
              ? (err as any).message
              : String(err);
          groveToast.error("Failed to sync with database. " + message);
        } finally {
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

  // Format deadline as a readable date
  const formatDeadline = (deadline: any) => {
    if (!deadline) return "-";
    // Accepts both string and number (seconds or ms)
    let ts = typeof deadline === "string" ? parseInt(deadline) : deadline;
    if (ts > 1e12) ts = Math.floor(ts / 1000); // convert ms to s if needed
    const date = new Date(ts * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
      <div className='max-w-xl w-full mx-auto p-8 rounded-xl shadow-lg bg-gray-900/90 border border-gray-800 text-center'>
        {showInvalid ? (
          <>
            <h1 className='text-2xl font-bold text-white mb-4'>Invalid Link</h1>
            <p className='mb-6 text-gray-300'>
              No circleId provided in the link.
            </p>
            <a
              href='/dashboard'
              className='inline-block mt-2 px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold shadow hover:opacity-90 transition'
            >
              Go back to dashboard
            </a>
          </>
        ) : showLoading ? (
          <>
            <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-white mb-2'>
              Loading Circle
            </h3>
            <p className='text-gray-300'>Fetching circle data...</p>
          </>
        ) : showNotFound ? (
          <>
            <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>❌</span>
            </div>
            <h1 className='text-2xl font-bold text-white mb-4'>
              Circle Not Found
            </h1>
            <p className='mb-6 text-gray-300'>
              No circle found for ID: {circleId}
            </p>
            <a
              href='/dashboard'
              className='inline-block mt-2 px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold shadow hover:opacity-90 transition'
            >
              Go back to dashboard
            </a>
          </>
        ) : (
          <>
            <h1 className='text-2xl font-bold text-white mb-4'>
              Join “{circle.name}”
            </h1>
            <p className='mb-2 text-gray-300'>{circle.description}</p>
            <div className='my-4 grid grid-cols-2 gap-4'>
              <div className='bg-gray-800/70 rounded-lg p-3'>
                <span className='block text-xs text-gray-400'>Target</span>
                <span className='font-semibold text-green-300'>
                  {circle.targetAmount}
                </span>
              </div>
              <div className='bg-gray-800/70 rounded-lg p-3'>
                <span className='block text-xs text-gray-400'>Current</span>
                <span className='font-semibold text-orange-300'>
                  {circle.currentAmount}
                </span>
              </div>
              <div className='bg-gray-800/70 rounded-lg p-3'>
                <span className='block text-xs text-gray-400'>Members</span>
                <span className='font-semibold text-blue-600'>
                  {circle.memberCount}
                </span>
              </div>
              <div className='bg-gray-800/70 rounded-lg p-3'>
                <span className='block text-xs text-gray-400'>Deadline</span>
                <span className='font-semibold text-yellow-300'>
                  {formatDeadline(circle.deadline)}
                </span>
              </div>
            </div>
            {inviter && (
              <div className='mb-4 text-sm text-gray-400'>
                Invited by:{" "}
                <span className='font-mono text-white'>{inviter}</span>
              </div>
            )}
            {!isConnected ? (
              <Button
                onClick={connect}
                className='mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:opacity-90'
              >
                Connect Wallet & Email to Join
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                className='mt-6 w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:opacity-90'
                disabled={joining}
              >
                {joining ? "Joining..." : "Join Circle"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
