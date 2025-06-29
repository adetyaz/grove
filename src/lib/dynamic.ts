import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

// Type definitions for Dynamic user
export interface DynamicUser {
  id: string;
  email?: string;
  name?: string;
  address?: string;
  walletAddress?: string;
}

// Hook for checking if SDK has loaded and user authentication state
export function useDynamicAuth() {
  const { sdkHasLoaded, user, userWithMissingInfo, primaryWallet } =
    useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  return {
    sdkHasLoaded,
    isLoggedIn,
    user,
    userWithMissingInfo,
    primaryWallet,
    isAuthenticated: !!user,
    needsOnboarding: !!userWithMissingInfo,
  };
}

// Function to get user details (for server-side usage)
export async function getDynamicUser(
  email: string
): Promise<DynamicUser | null> {
  try {
    // Note: This is a placeholder implementation
    // In a real app, you'd need to implement server-side user lookup
    // or use Dynamic's server-side APIs if available

    // For now, we'll return a mock user structure
    // You should replace this with actual Dynamic API calls or database lookups
    const mockUser: DynamicUser = {
      id: `user_${email.replace("@", "_").replace(".", "_")}`,
      email,
      name: email.split("@")[0],
      address: "0x1234567890123456789012345678901234567890", // This should come from Dynamic
      walletAddress: "0x1234567890123456789012345678901234567890",
    };

    return mockUser;
  } catch (error) {
    console.error("Error getting Dynamic user:", error);
    return null;
  }
}

// Helper function to get user from Dynamic context (client-side)
export function getCurrentDynamicUser(): DynamicUser | null {
  // This should only be used on the client side
  if (typeof window === "undefined") {
    return null;
  }

  // You would access the Dynamic context here
  // This is a simplified version - implement based on your needs
  return null;
}
