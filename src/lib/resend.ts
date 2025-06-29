import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates and configurations
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || "Grove <noreply@grove.finance>",
  replyTo: process.env.RESEND_REPLY_TO || "support@grove.finance",
} as const;

export interface CircleInviteEmailData {
  recipientEmail: string;
  recipientName?: string;
  inviterName: string;
  circleName: string;
  circleDescription?: string;
  targetAmount: string;
  deadline: string;
  inviteLink: string;
}

export interface WelcomeEmailData {
  recipientEmail: string;
  recipientName?: string;
  circleName: string;
}

// Email template functions
export const createCircleInviteEmail = (data: CircleInviteEmailData) => ({
  from: EMAIL_CONFIG.from,
  to: data.recipientEmail,
  replyTo: EMAIL_CONFIG.replyTo,
  subject: `🌳 You're invited to join "${data.circleName}" on Grove`,
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grove Circle Invitation</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #ea580c, #f59e0b); 
            color: white; 
            padding: 30px 20px; 
            border-radius: 12px 12px 0 0; 
            text-align: center;
          }
          .content { 
            background: white; 
            padding: 30px 20px; 
            border: 1px solid #e5e7eb; 
            border-top: none;
          }
          .circle-info { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
          }
          .cta-button { 
            display: inline-block; 
            background: #ea580c; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600; 
            margin: 20px 0;
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px; 
            border: 1px solid #e5e7eb; 
            border-top: none; 
            border-radius: 0 0 12px 12px; 
            text-align: center; 
            font-size: 14px; 
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌳 Grove</h1>
          <p>Growing wealth together on Bitcoin</p>
        </div>
        
        <div class="content">
          <h2>You're invited to join a savings circle!</h2>
          
          <p>Hi ${data.recipientName || "there"},</p>
          
          <p><strong>${data.inviterName}</strong> has invited you to join their savings circle on Grove, the Bitcoin-native collaborative savings platform.</p>
          
          <div class="circle-info">
            <h3>📊 Circle Details</h3>
            <ul>
              <li><strong>Circle Name:</strong> ${data.circleName}</li>
              ${data.circleDescription ? `<li><strong>Description:</strong> ${data.circleDescription}</li>` : ""}
              <li><strong>Target Amount:</strong> ${data.targetAmount} BTC</li>
              <li><strong>Deadline:</strong> ${data.deadline}</li>
            </ul>
          </div>
          
          <p>Grove allows groups to pool funds toward shared goals using Bitcoin. All transactions are secured and settled on Bitcoin via Citrea's ZK-Rollup technology.</p>
          
          <div style="text-align: center;">
            <a href="${data.inviteLink}" class="cta-button">
              Join Circle
            </a>
          </div>
          
          <h3>🚀 What's Next?</h3>
          <ol>
            <li>Click the "Join Circle" button above</li>
            <li>Connect your wallet (we'll help you set one up if needed)</li>
            <li>Start contributing to the shared goal</li>
            <li>Track progress and celebrate milestones together</li>
          </ol>
          
          <p><strong>Why Grove?</strong></p>
          <ul>
            <li>✅ Bitcoin-native security</li>
            <li>✅ Collaborative goal achievement</li>
            <li>✅ Gamified saving experience</li>
            <li>✅ Transparent and trustless</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${data.inviterName} through Grove.</p>
          <p>Grove is powered by Citrea (Bitcoin ZK-Rollup) and Dynamic.xyz</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `,
  text: `
Grove Circle Invitation

Hi ${data.recipientName || "there"},

${data.inviterName} has invited you to join their savings circle "${data.circleName}" on Grove.

Circle Details:
- Name: ${data.circleName}
${data.circleDescription ? `- Description: ${data.circleDescription}` : ""}
- Target Amount: ${data.targetAmount} BTC
- Deadline: ${data.deadline}

Join the circle: ${data.inviteLink}

Grove is a Bitcoin-native collaborative savings platform where groups can pool funds toward shared goals.

What's Next?
1. Click the join link above
2. Connect your wallet
3. Start contributing to the shared goal
4. Track progress together

This invitation was sent by ${data.inviterName} through Grove.
  `,
});

export const createWelcomeEmail = (data: WelcomeEmailData) => ({
  from: EMAIL_CONFIG.from,
  to: data.recipientEmail,
  replyTo: EMAIL_CONFIG.replyTo,
  subject: `🎉 Welcome to "${data.circleName}" on Grove!`,
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Grove Circle</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 30px 20px; 
            border-radius: 12px 12px 0 0; 
            text-align: center;
          }
          .content { 
            background: white; 
            padding: 30px 20px; 
            border: 1px solid #e5e7eb; 
            border-top: none;
          }
          .success-box { 
            background: #d1fae5; 
            border: 1px solid #10b981; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
            text-align: center;
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px; 
            border: 1px solid #e5e7eb; 
            border-top: none; 
            border-radius: 0 0 12px 12px; 
            text-align: center; 
            font-size: 14px; 
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to Grove!</h1>
          <p>You're now part of the circle</p>
        </div>
        
        <div class="content">
          <h2>Successfully joined "${data.circleName}"</h2>
          
          <p>Hi ${data.recipientName || "there"},</p>
          
          <div class="success-box">
            <h3>✅ You're In!</h3>
            <p>You've successfully joined the savings circle and can now start contributing toward your shared goal.</p>
          </div>
          
          <h3>🎯 Next Steps:</h3>
          <ol>
            <li><strong>Make your first contribution</strong> - Help kick off the savings journey</li>
            <li><strong>Invite others</strong> - The more members, the faster you reach your goal</li>
            <li><strong>Track progress</strong> - Watch your collective savings grow</li>
            <li><strong>Earn achievements</strong> - Build streaks and unlock badges</li>
          </ol>
          
          <h3>💡 Pro Tips:</h3>
          <ul>
            <li>Set up notifications to never miss a contribution</li>
            <li>Share updates with your circle members</li>
            <li>Celebrate milestones together</li>
          </ul>
          
          <p>Remember: All transactions are secured on Bitcoin via Citrea's ZK-Rollup, ensuring your funds are safe and transparent.</p>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you joined a Grove savings circle.</p>
          <p>Grove - Growing wealth together on Bitcoin</p>
        </div>
      </body>
    </html>
  `,
  text: `
Welcome to Grove!

Hi ${data.recipientName || "there"},

You've successfully joined the savings circle "${data.circleName}"!

Next Steps:
1. Make your first contribution
2. Invite others to join
3. Track progress together
4. Earn achievements

Grove - Growing wealth together on Bitcoin
  `,
});
