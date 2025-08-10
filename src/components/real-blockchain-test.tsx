"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { useAchievementClaiming } from "@/hooks/useAchievementClaiming";
import { groveToast } from "@/lib/toast";

export default function RealBlockchainTest() {
  const { primaryWallet } = useDynamicConnection();
  const { claimAchievement } = useAchievementClaiming();
  const [isTestingReal, setIsTestingReal] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testRealClaim = async (achievementId: number) => {
    if (!primaryWallet?.address) {
      groveToast.error("Please connect your wallet first");
      return;
    }

    setIsTestingReal(true);
    const startTime = Date.now();

    try {
      groveToast.info("��� Step 1: Checking if achievement was earned...");

      const checkResponse = await fetch("/api/achievements/real-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: primaryWallet.address,
          achievementId,
        }),
      });

      const checkResult = await checkResponse.json();

      if (!checkResult.success) {
        setTestResults((prev) => [
          ...prev,
          {
            achievementId,
            step: "Database Check",
            status: "FAILED",
            message: checkResult.error,
            debug: checkResult.debug,
            timestamp: new Date().toISOString(),
          },
        ]);

        groveToast.error("❌ Achievement not earned in database");

        if (checkResult.debug) {
          console.log("��� Debug info:", checkResult.debug);
          groveToast.info("��� Run test scenario first to earn achievements");
        }

        return;
      }

      groveToast.success("✅ Step 1: Achievement verified in database");
      groveToast.info("��� Step 2: Initiating blockchain transaction...");

      const txHash = await claimAchievement(achievementId);

      setTestResults((prev) => [
        ...prev,
        {
          achievementId,
          step: "Blockchain Transaction",
          status: "SUCCESS",
          message: `NFT claimed successfully! TX: ${txHash}`,
          txHash,
          timestamp: new Date().toISOString(),
        },
      ]);

      groveToast.success("��� REAL NFT CLAIMED!");
    } catch (error: any) {
      setTestResults((prev) => [
        ...prev,
        {
          achievementId,
          step: "Blockchain Transaction",
          status: "FAILED",
          message: error.message || "Unknown error",
          timestamp: new Date().toISOString(),
        },
      ]);

      groveToast.error(`❌ Blockchain transaction failed: ${error.message}`);
    } finally {
      setIsTestingReal(false);
    }
  };

  return (
    <div className='p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20'>
      <h2 className='text-2xl font-bold text-white mb-4'>
        ��� Real Blockchain Testing
      </h2>

      <div className='mb-6'>
        <p className='text-gray-300 mb-2'>
          This will test REAL blockchain interactions with wallet prompts and
          gas fees.
        </p>

        <div className='mt-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded'>
          <p className='text-blue-300 text-sm font-semibold'>
            ��� Before Testing:
          </p>
          <p className='text-gray-300 text-sm'>
            1. First run Test All Achievements above to earn achievements in
            database
          </p>
          <p className='text-gray-300 text-sm'>
            2. Then use the buttons below to test real blockchain claiming
          </p>
        </div>
      </div>

      <div className='space-y-3 mb-6'>
        <Button
          onClick={() => testRealClaim(0)}
          disabled={isTestingReal}
          className='w-full bg-green-600 hover:bg-green-700'
        >
          Test Real Claim: First Steps (ID: 0)
        </Button>

        <Button
          onClick={() => testRealClaim(1)}
          disabled={isTestingReal}
          className='w-full bg-green-600 hover:bg-green-700'
        >
          Test Real Claim: Penny Saver (ID: 1)
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-lg font-semibold text-white mb-3'>
            Test Results:
          </h3>
          <div className='space-y-2'>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  result.status === "SUCCESS"
                    ? "bg-green-900/20 border-green-500"
                    : "bg-red-900/20 border-red-500"
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium text-white'>
                      Achievement {result.achievementId} - {result.step}
                    </p>
                    <p className='text-sm text-gray-300'>{result.message}</p>
                    {result.debug && (
                      <div className='mt-2 p-2 bg-black/20 rounded text-xs'>
                        <p className='text-yellow-300'>
                          Debug: {result.debug.totalAchievements} total
                          achievements in DB
                        </p>
                      </div>
                    )}
                    {result.txHash && (
                      <p className='text-xs font-mono text-blue-300 mt-1'>
                        TX: {result.txHash}
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        result.status === "SUCCESS"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
