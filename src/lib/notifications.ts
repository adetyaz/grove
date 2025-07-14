import TelegramBot from "node-telegram-bot-api";
import { Twilio } from "twilio";

// Telegram Bot Configuration
const telegramBot = process.env.TELEGRAM_BOT_TOKEN
  ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  : null;

// Twilio Configuration for WhatsApp
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Notification types
export type NotificationType =
  | "invite"
  | "contribution"
  | "member_joined"
  | "goal_reached"
  | "reminder";

// Telegram service
export const telegramService = {
  // Send message to Telegram chat
  sendMessage: async (chatId: string, message: string, options?: any) => {
    if (!telegramBot) {
      console.warn("⚠️ Telegram bot not configured");
      return { success: false, error: "Telegram bot not configured" };
    }

    try {
      const result = await telegramBot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...options,
      });

      console.log("✅ Telegram message sent successfully");
      return { success: true, messageId: result.message_id };
    } catch (error) {
      console.error("❌ Telegram sending failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  // Format invitation message for Telegram
  formatInviteMessage: (data: {
    inviterName: string;
    circleName: string;
    inviteLink: string;
  }) => `
🌳 <b>Grove Circle Invitation</b>

<b>${data.inviterName}</b> has invited you to join "<b>${data.circleName}</b>" on Grove!

🚀 <b>What is Grove?</b>
Grove empowers communities to grow their Bitcoin savings together. Create circles with family and friends, track shared goals, and build financial security.

🔗 <a href="${data.inviteLink}">Join Circle Now</a>

💰 Platform: Bitcoin Layer 2 (Citrea Testnet)
🛡️ Security: Smart contract protected
👥 Community: Collaborative savings
  `,

  // Format update message for Telegram
  formatUpdateMessage: (data: {
    circleName: string;
    updateType: NotificationType;
    details: string;
    circleLink: string;
  }) => {
    const emojis = {
      contribution: "💰",
      member_joined: "👥",
      goal_reached: "🎯",
      reminder: "⏰",
      invite: "📨",
    };

    return `
🌳 <b>Grove Circle Update</b>

${emojis[data.updateType]} <b>${data.circleName}</b>

${data.details}

<a href="${data.circleLink}">View Circle Dashboard</a>
    `;
  },
};

// WhatsApp service using Twilio
export const whatsappService = {
  // Send WhatsApp message
  sendMessage: async (to: string, message: string) => {
    if (!twilioClient) {
      console.warn("⚠️ Twilio/WhatsApp not configured");
      return { success: false, error: "WhatsApp service not configured" };
    }

    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`,
      });

      console.log("✅ WhatsApp message sent successfully");
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error("❌ WhatsApp sending failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  // Format invitation message for WhatsApp
  formatInviteMessage: (data: {
    inviterName: string;
    circleName: string;
    inviteLink: string;
  }) => `
🌳 *Grove Circle Invitation*

*${data.inviterName}* has invited you to join "*${data.circleName}*" on Grove!

🚀 *What is Grove?*
Grove empowers communities to grow their Bitcoin savings together. Create circles with family and friends, track shared goals, and build financial security.

Join now: ${data.inviteLink}

💰 Platform: Bitcoin Layer 2
🛡️ Security: Smart contract protected
👥 Community: Collaborative savings
  `,

  // Format update message for WhatsApp
  formatUpdateMessage: (data: {
    circleName: string;
    updateType: NotificationType;
    details: string;
    circleLink: string;
  }) => {
    const emojis = {
      contribution: "💰",
      member_joined: "👥",
      goal_reached: "🎯",
      reminder: "⏰",
      invite: "📨",
    };

    return `
🌳 *Grove Circle Update*

${emojis[data.updateType]} *${data.circleName}*

${data.details}

View circle: ${data.circleLink}
    `;
  },
};

// Multi-channel notification service
export const notificationService = {
  // Send invitation across all configured channels
  sendInvitation: async (invitation: {
    recipientEmail: string;
    recipientTelegram?: string;
    recipientWhatsApp?: string;
    inviterName: string;
    inviterAddress: string;
    inviterEmail: string; // Add sender email
    circleName: string;
    inviteLink: string;
    circleDescription?: string;
  }) => {
    const results = {
      email: {
        success: false,
        error: null as string | null,
        messageId: null as string | null,
      },
      telegram: {
        success: false,
        error: null as string | null,
        messageId: null as string | null,
      },
      whatsapp: {
        success: false,
        error: null as string | null,
        messageId: null as string | null,
      },
    };

    // Send email (primary method)
    try {
      const { sendEmail, emailTemplates } = await import("./email");
      const emailTemplate = emailTemplates.circleInvitation(invitation);
      const emailResult = await sendEmail(
        invitation.recipientEmail,
        emailTemplate
      );
      results.email = {
        success: emailResult.success,
        error: emailResult.error || null,
        messageId: emailResult.messageId || null,
      };
    } catch (error) {
      results.email = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        messageId: null,
      };
    }

    // Send Telegram notification (if chat ID provided)
    if (invitation.recipientTelegram) {
      const telegramMessage = telegramService.formatInviteMessage(invitation);
      const telegramResult = await telegramService.sendMessage(
        invitation.recipientTelegram,
        telegramMessage
      );
      results.telegram = {
        success: telegramResult.success,
        error: telegramResult.error || null,
        messageId: telegramResult.messageId?.toString() || null,
      };
    }

    // Send WhatsApp notification (if phone number provided)
    if (invitation.recipientWhatsApp) {
      const whatsappMessage = whatsappService.formatInviteMessage(invitation);
      const whatsappResult = await whatsappService.sendMessage(
        invitation.recipientWhatsApp,
        whatsappMessage
      );
      results.whatsapp = {
        success: whatsappResult.success,
        error: whatsappResult.error || null,
        messageId: whatsappResult.messageId || null,
      };
    }

    return results;
  },

  // Send circle updates across all channels
  sendCircleUpdate: async (update: {
    recipients: Array<{
      email: string;
      telegram?: string;
      whatsapp?: string;
    }>;
    senderEmail: string; // Add sender email for updates
    circleName: string;
    updateType: NotificationType;
    details: string;
    circleLink: string;
  }) => {
    const results = [];

    for (const recipient of update.recipients) {
      const recipientResults = {
        email: {
          success: false,
          error: null as string | null,
          messageId: null as string | null,
        },
        telegram: {
          success: false,
          error: null as string | null,
          messageId: null as string | null,
        },
        whatsapp: {
          success: false,
          error: null as string | null,
          messageId: null as string | null,
        },
      };

      // Send email (need to create a proper template for updates)
      try {
        const { sendEmail } = await import("./email");
        // For now, use a simple text email for updates until we create a proper template
        const emailTemplate = {
          subject: `🌳 Grove Circle Update - ${update.circleName}`,
          html: `<p>${update.details}</p><p><a href="${update.circleLink}">View Circle</a></p>`,
          text: `${update.details}\n\nView Circle: ${update.circleLink}`,
        };
        const emailResult = await sendEmail(recipient.email, emailTemplate);
        recipientResults.email = {
          success: emailResult.success,
          error: emailResult.error || null,
          messageId: emailResult.messageId || null,
        };
      } catch (error) {
        recipientResults.email = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          messageId: null,
        };
      }

      // Send Telegram
      if (recipient.telegram) {
        const telegramMessage = telegramService.formatUpdateMessage(update);
        const telegramResult = await telegramService.sendMessage(
          recipient.telegram,
          telegramMessage
        );
        recipientResults.telegram = {
          success: telegramResult.success,
          error: telegramResult.error || null,
          messageId: telegramResult.messageId?.toString() || null,
        };
      }

      // Send WhatsApp
      if (recipient.whatsapp) {
        const whatsappMessage = whatsappService.formatUpdateMessage(update);
        const whatsappResult = await whatsappService.sendMessage(
          recipient.whatsapp,
          whatsappMessage
        );
        recipientResults.whatsapp = {
          success: whatsappResult.success,
          error: whatsappResult.error || null,
          messageId: whatsappResult.messageId || null,
        };
      }

      results.push({ recipient: recipient.email, results: recipientResults });
    }

    return results;
  },

  // Test all notification services
  testServices: async (testEmail?: string) => {
    const results = {
      email: false,
      telegram: !!telegramBot,
      whatsapp: !!twilioClient,
    };

    // Test email with a test email if provided
    if (testEmail) {
      try {
        const { verifyEmailConnection } = await import("./email");
        results.email = await verifyEmailConnection();
      } catch (error) {
        console.error("Email test failed:", error);
      }
    }

    return results;
  },
};

// Helper functions for circle-specific notifications
export const circleNotifications = {
  // Send circle creation success notification
  sendCircleCreated: async (circle: {
    id: string; // UUID
    name: string;
    onChainId: number | null;
    owner: {
      email: string;
      name?: string;
      wallet: string;
    };
    members: Array<{
      email: string;
      name?: string;
      wallet: string;
    }>;
  }) => {
    const circleLink = `${process.env.NEXT_PUBLIC_APP_URL}/circles/${circle.id}`;
    const details = circle.onChainId
      ? `Circle "${circle.name}" has been created successfully! 🎉\n\nContract ID: ${circle.onChainId}\nMembers can now join and contribute.`
      : `Circle "${circle.name}" has been created! ⏳\n\nContract deployment in progress. You'll be notified when it's ready for contributions.`;

    return await notificationService.sendCircleUpdate({
      recipients: [circle.owner, ...circle.members].map((member) => ({
        email: member.email,
        // TODO: Add telegram/whatsapp from user preferences
      })),
      senderEmail: circle.owner.email,
      circleName: circle.name,
      updateType: "member_joined",
      details,
      circleLink,
    });
  },

  // Send circle sync success notification
  sendCircleSynced: async (circle: {
    id: string; // UUID
    name: string;
    onChainId: number;
    owner: {
      email: string;
      name?: string;
    };
    members: Array<{
      email: string;
      name?: string;
    }>;
  }) => {
    const circleLink = `${process.env.NEXT_PUBLIC_APP_URL}/circles/${circle.id}`;
    const details = `🎉 Great news! Circle "${circle.name}" is now live on the blockchain!\n\nContract ID: ${circle.onChainId}\nMembers can now make contributions and join the circle.`;

    return await notificationService.sendCircleUpdate({
      recipients: [circle.owner, ...circle.members].map((member) => ({
        email: member.email,
      })),
      senderEmail: circle.owner.email,
      circleName: circle.name,
      updateType: "goal_reached", // Using this for sync success
      details,
      circleLink,
    });
  },

  // Send member joined notification
  sendMemberJoined: async (
    circle: {
      id: string; // UUID
      name: string;
      onChainId: number | null;
    },
    newMember: {
      email: string;
      name?: string;
      wallet: string;
    },
    existingMembers: Array<{
      email: string;
      name?: string;
    }>
  ) => {
    const circleLink = `${process.env.NEXT_PUBLIC_APP_URL}/circles/${circle.id}`;
    const memberName = newMember.name || newMember.wallet.slice(0, 8) + "...";
    const details = `👥 ${memberName} has joined the circle!`;

    return await notificationService.sendCircleUpdate({
      recipients: existingMembers.map((member) => ({
        email: member.email,
      })),
      senderEmail: newMember.email,
      circleName: circle.name,
      updateType: "member_joined",
      details,
      circleLink,
    });
  },

  // Send contribution notification
  sendContribution: async (
    circle: {
      id: string; // UUID
      name: string;
      onChainId: number | null;
    },
    contributor: {
      email: string;
      name?: string;
      wallet: string;
    },
    amount: string,
    recipients: Array<{
      email: string;
      name?: string;
    }>
  ) => {
    const circleLink = `${process.env.NEXT_PUBLIC_APP_URL}/circles/${circle.id}`;
    const contributorName =
      contributor.name || contributor.wallet.slice(0, 8) + "...";
    const details = `💰 ${contributorName} contributed ${amount} BTC to the circle!`;

    return await notificationService.sendCircleUpdate({
      recipients: recipients.map((member) => ({
        email: member.email,
      })),
      senderEmail: contributor.email,
      circleName: circle.name,
      updateType: "contribution",
      details,
      circleLink,
    });
  },

  // Send invitation with UUID-based links
  sendInvitation: async (invitation: {
    circleId: string; // UUID
    circleName: string;
    inviterName: string;
    inviterEmail: string;
    inviterAddress: string;
    recipientEmail: string;
    recipientTelegram?: string;
    recipientWhatsApp?: string;
    circleDescription?: string;
    inviteLink?: string; // Accept invite link from frontend
  }) => {
    // Use provided invite link or fallback to generated one
    const inviteLink =
      invitation.inviteLink ||
      `${process.env.NEXT_PUBLIC_APP_URL}/circles/${invitation.circleId}/join`;

    return await notificationService.sendInvitation({
      recipientEmail: invitation.recipientEmail,
      recipientTelegram: invitation.recipientTelegram,
      recipientWhatsApp: invitation.recipientWhatsApp,
      inviterName: invitation.inviterName,
      inviterAddress: invitation.inviterAddress,
      inviterEmail: invitation.inviterEmail,
      circleName: invitation.circleName,
      inviteLink,
      circleDescription: invitation.circleDescription,
    });
  },
};

export default notificationService;
