import { useState } from "react";
import { groveToast } from "@/lib/toast";

export interface InvitationData {
  circleId: string; // Changed to string for UUID
  recipientEmail?: string;
  recipientTelegram?: string;
  recipientWhatsApp?: string;
  circleName: string;
  circleDescription?: string;
}

export function useInvitations() {
  const [isLoading, setIsLoading] = useState(false);

  const sendInvitation = async (
    invitationData: InvitationData,
    inviterName: string,
    inviterAddress: string,
    inviterEmail: string // Add sender email parameter
  ) => {
    setIsLoading(true);

    try {
      // Generate invite link (now using circleId for uniqueness)
      const inviteLink = `${window.location.origin}/join?circleId=${invitationData.circleId}&inviter=${inviterAddress}`;

      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...invitationData,
          inviterName,
          inviterAddress,
          inviterEmail, // Pass sender email to API
          inviteLink,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      // Handle successful invitation
      if (result.success) {
        groveToast.success(`Invitation sent successfully! 📧`, {
          autoClose: 5000,
        });
      }

      return {
        success: true,
        results: result.results,
        inviteLink,
      };
    } catch (error) {
      console.error("Failed to send invitation:", error);

      groveToast.error(
        `Failed to send invitation: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          autoClose: 8000,
        }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Only returns status, does not show toasts (UI can show if needed)
  const testNotificationServices = async () => {
    try {
      const response = await fetch("/api/invitations/send");
      const result = await response.json();
      return result;
    } catch {
      return null;
    }
  };

  return {
    sendInvitation,
    testNotificationServices,
    isLoading,
  };
}
