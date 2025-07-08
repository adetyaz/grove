"use client";
import { useDynamicContext, useAuthenticateConnectedUser } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";

export default function DebugDynamic() {
  const dynamicContext = useDynamicContext();
  const { setShowAuthFlow, user, primaryWallet, handleLogOut } = dynamicContext;
  const { authenticateUser, isAuthenticating } = useAuthenticateConnectedUser();

  const handleAuthenticate = async () => {
    console.log("🔐 Authenticating connected wallet...");
    try {
      await authenticateUser();
      console.log("✅ Authentication successful!");
    } catch (error) {
      console.error("❌ Authentication failed:", error);
    }
  };

  const handleDirectConnect = () => {
    console.log("Direct connect clicked");
    console.log("Dynamic context:", dynamicContext);
    console.log("user:", user);
    console.log("primaryWallet:", primaryWallet);

    try {
      console.log("Calling setShowAuthFlow(true) directly...");
      setShowAuthFlow(true);
      console.log("✅ setShowAuthFlow called successfully");
    } catch (error) {
      console.error("❌ Error calling setShowAuthFlow:", error);
    }
  };

  const handleReset = async () => {
    console.log("🔄 Resetting Dynamic state...");
    try {
      // First close any existing auth flow
      setShowAuthFlow(false);

      // If there's a user or wallet, log them out first
      if (user || primaryWallet) {
        console.log("Logging out existing session...");
        await handleLogOut();
      }

      // Wait a bit for cleanup
      setTimeout(() => {
        console.log("🔄 Attempting fresh connection...");
        setShowAuthFlow(true);
      }, 1000);
    } catch (error) {
      console.error("❌ Error resetting:", error);
    }
  };

  const handleHardReset = () => {
    console.log("💥 HARD RESET - Refreshing page...");
    window.location.reload();
  };

  const handleForceClose = () => {
    console.log("🚫 Forcing auth flow close...");
    setShowAuthFlow(false);
  };

  // Check if we have an inconsistent state (wallet but no user)
  const hasInconsistentState = primaryWallet && !user;

  return (
    <div className='p-4 border border-gray-300 rounded'>
      <h3 className='font-bold mb-2'>Dynamic Debug</h3>
      <div className='space-y-2 text-sm'>
        <div>Dynamic Context: {dynamicContext ? "✅" : "❌"}</div>
        <div>User: {user ? "✅" : "❌"}</div>
        <div>Wallet: {primaryWallet ? "✅" : "❌"}</div>
        <div>Connected: {user && primaryWallet ? "✅" : "❌"}</div>
        <div>
          Environment ID:{" "}
          {process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ? "✅" : "❌"}
        </div>
        {primaryWallet && (
          <div>Wallet Address: {primaryWallet.address?.slice(0, 10)}...</div>
        )}
        {hasInconsistentState && (
          <div className='text-red-500 font-bold'>
            ⚠️ INCONSISTENT STATE: Wallet exists but no user!
          </div>
        )}
      </div>
      <div className='flex gap-2 mt-2 flex-wrap'>
        <Button onClick={handleDirectConnect} size='sm'>
          Direct Connect
        </Button>
        {primaryWallet && !user && (
          <Button onClick={handleAuthenticate} size='sm' variant='default'>
            {isAuthenticating ? 'Authenticating...' : 'Authenticate Wallet'}
          </Button>
        )}
        <Button onClick={handleReset} variant='outline' size='sm'>
          Reset & Connect
        </Button>
        <Button onClick={handleForceClose} variant='destructive' size='sm'>
          Force Close
        </Button>
        <Button
          onClick={handleHardReset}
          variant='outline'
          size='sm'
          className='text-xs'
        >
          Hard Reset (Refresh)
        </Button>
      </div>
    </div>
  );
}
