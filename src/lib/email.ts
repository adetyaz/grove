import nodemailer from "nodemailer";

// Create email transporter with dynamic user configuration
export const createEmailTransporter = (userEmail: string) => {
  const emailConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: userEmail, // Use the sender's email from Dynamic
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail app password
    },
    // Additional configuration for better reliability
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
  };

  if (!userEmail || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      "⚠️ Email configuration missing. User email or Gmail app password not available"
    );
    return null;
  }

  try {
    return nodemailer.createTransport(emailConfig);
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error);
    return null;
  }
};

// Verify connection configuration
export const verifyEmailConnection = async (userEmail: string) => {
  try {
    const transporter = createEmailTransporter(userEmail);
    if (!transporter) {
      return false;
    }
    await transporter.verify();
    console.log("✅ Email server is ready to send messages for:", userEmail);
    return true;
  } catch (error) {
    console.error("❌ Email server configuration error:", error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  circleInvitation: (data: {
    inviterName: string;
    inviterAddress: string;
    circleName: string;
    inviteLink: string;
    circleDescription?: string;
  }) => ({
    subject: `🌳 You've been invited to join "${data.circleName}" on Grove`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Grove Circle Invitation</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #f97316 0%, #22c55e 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header .emoji { font-size: 48px; margin-bottom: 16px; }
            .content { padding: 40px 20px; }
            .invitation-box { background-color: #f8f9fa; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .circle-info { background-color: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #22c55e 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .cta-button:hover { opacity: 0.9; }
            .footer { background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
            .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
            .highlight { color: #22c55e; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🌳</div>
              <h1>Grove Invitation</h1>
              <p style="color: #f3f4f6; margin: 8px 0 0 0;">Cultivate wealth through Bitcoin collaboration</p>
            </div>
            
            <div class="content">
              <div class="invitation-box">
                <h2 style="margin-top: 0; color: #1f2937;">You've been invited!</h2>
                <p><strong>${data.inviterName}</strong> has invited you to join their Bitcoin savings circle on Grove.</p>
                <p style="font-size: 14px; color: #6b7280;">Inviter wallet: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${data.inviterAddress.slice(0, 6)}...${data.inviterAddress.slice(-4)}</code></p>
              </div>

              <div class="circle-info">
                <h3 style="margin-top: 0; color: #ea580c;">📊 Circle Details</h3>
                <p><strong>Circle Name:</strong> <span class="highlight">${data.circleName}</span></p>
                ${data.circleDescription ? `<p><strong>Description:</strong> ${data.circleDescription}</p>` : ""}
                <p><strong>Platform:</strong> Grove (Bitcoin Layer 2 - Citrea Testnet)</p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${data.inviteLink}" class="cta-button">Join Circle 🚀</a>
              </div>

              <div class="divider"></div>

              <h3>🤔 What is Grove?</h3>
              <p>Grove empowers communities to grow their Bitcoin savings together. Create circles with family and friends, track shared goals, and build financial security on Bitcoin's most advanced Layer 2.</p>
              
              <h3>🔒 How it works:</h3>
              <ul>
                <li><strong>Connect your wallet</strong> - MetaMask or social login</li>
                <li><strong>Join the circle</strong> - Accept the invitation</li>
                <li><strong>Start contributing</strong> - Add Bitcoin to the shared goal</li>
                <li><strong>Track progress</strong> - See how the circle grows together</li>
              </ul>

              <div style="background-color: #ecfdf5; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;"><strong>🛡️ Security:</strong> Your Bitcoin is secured by smart contracts on Citrea testnet. Only you control your funds.</p>
              </div>
            </div>

            <div class="footer">
              <p>This invitation was sent from Grove - Bitcoin Collaboration Platform</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
              <p style="margin-top: 20px;">
                <a href="https://grove.app" style="color: #22c55e;">grove.app</a> | 
                <a href="https://twitter.com/groveapp" style="color: #22c55e;">@groveapp</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🌳 Grove Circle Invitation

${data.inviterName} has invited you to join "${data.circleName}" on Grove!

What is Grove?
Grove empowers communities to grow their Bitcoin savings together. Create circles with family and friends, track shared goals, and build financial security on Bitcoin's most advanced Layer 2.

Join the circle: ${data.inviteLink}

Grove - Cultivate wealth through Bitcoin collaboration
    `,
  }),

  testEmail: (data: { senderEmail: string; testRecipient: string }) => ({
    subject: "🌳 Grove Email Test - Configuration Successful!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🌳 Grove Email Test</h1>
          <p style="color: #f3f4f6; margin: 10px 0 0 0;">Email configuration is working perfectly!</p>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa; margin: 20px 0; border-radius: 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">✅ Configuration Success</h2>
          <p>Your Grove email service is properly configured and ready to send invitations!</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Sender Email:</strong> ${data.senderEmail}</p>
            <p><strong>Test Recipient:</strong> ${data.testRecipient}</p>
            <p><strong>SMTP Service:</strong> Gmail (smtp.gmail.com)</p>
            <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">✅ ACTIVE</span></p>
          </div>
          
          <h3>🚀 Next Steps:</h3>
          <ul>
            <li>✅ Email service is configured</li>
            <li>✅ Gmail app password is working</li>
            <li>✅ Ready to send circle invitations</li>
            <li>🔄 You can now invite users to your Bitcoin circles</li>
          </ul>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>This is a test email from Grove - Bitcoin Collaboration Platform</p>
        </div>
      </div>
    `,
    text: `
🌳 Grove Email Test - Configuration Successful!

Your Grove email service is properly configured and ready to send invitations!

Sender Email: ${data.senderEmail}
Test Recipient: ${data.testRecipient}
SMTP Service: Gmail (smtp.gmail.com)
Status: ✅ ACTIVE

Next Steps:
✅ Email service is configured
✅ Gmail app password is working
✅ Ready to send circle invitations
🔄 You can now invite users to your Bitcoin circles

This is a test email from Grove - Bitcoin Collaboration Platform
    `,
  }),
};

// Send email function
export const sendEmail = async (
  senderEmail: string,
  to: string,
  template: { subject: string; html: string; text: string }
) => {
  try {
    const transporter = createEmailTransporter(senderEmail);
    if (!transporter) {
      return { success: false, error: "Email transporter not available" };
    }

    const info = await transporter.sendMail({
      from: `"Grove 🌳" <${senderEmail}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
