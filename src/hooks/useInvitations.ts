"use client";
import { useState } from "react";
import { groveToast } from "@/lib/toast";

export interface InvitationData {
  recipientEmail: string;
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
      // Generate invite link (you can customize this based on your routing)
      const inviteLink = `${window.location.origin}/join?circle=${encodeURIComponent(invitationData.circleName)}&inviter=${inviterAddress}`;

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

      // Show success toast with details
      const successChannels: string[] = [];
      if (result.channels.email) successChannels.push("Email");
      if (result.channels.telegram) successChannels.push("Telegram");
      if (result.channels.whatsapp) successChannels.push("WhatsApp");

      groveToast.success(
        `Invitation sent successfully via ${successChannels.join(", ")}! 📧`,
        { autoClose: 5000 }
      );

      // Show additional info if some channels failed
      if (successChannels.length < 3) {
        const failedChannels = ["Email", "Telegram", "WhatsApp"].filter(
          (channel) => !successChannels.includes(channel)
        );
        if (failedChannels.length > 0) {
          groveToast.warning(
            `Note: ${failedChannels.join(", ")} delivery failed, but invitation was sent via ${successChannels.join(", ")}`,
            { autoClose: 8000 }
          );
        }
      }

      return {
        success: true,
        channels: result.channels,
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

  const testNotificationServices = async () => {
    try {
      const response = await fetch("/api/invitations/send");
      const result = await response.json();

      console.log("Notification services status:", result);

      // Show toast with service status
      const workingServices = Object.entries(result.services)
        .filter(([, status]) => status)
        .map(([service]) => service.charAt(0).toUpperCase() + service.slice(1));

      if (workingServices.length > 0) {
        groveToast.success(
          `Notification services ready: ${workingServices.join(", ")} ✅`,
          { autoClose: 5000 }
        );
      } else {
        groveToast.warning(
          "No notification services are currently configured ⚠️",
          { autoClose: 5000 }
        );
      }

      return result;
    } catch (error) {
      groveToast.error(
        `Failed to test services: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return null;
    }
  };

  return {
    sendInvitation,
    testNotificationServices,
    isLoading,
  };
}
