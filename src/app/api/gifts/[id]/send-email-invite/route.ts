import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { createEmailTransporter } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      recipientEmail,
      senderAddress,
      senderName,
      circleId,
      circleName,
      amount,
      message,
      occasion,
    } = body;

    if (!recipientEmail || !senderAddress || !circleId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Generate secure claim token
    const claimToken = crypto.randomBytes(32).toString("hex");

    // Set expiration to 48 hours from now
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Create gift claim invite record
    const giftClaimInvite = await prisma.giftClaimInvite.create({
      data: {
        giftId: params.id,
        recipientEmail: recipientEmail.toLowerCase(),
        senderAddress: senderAddress.toLowerCase(),
        senderName:
          senderName ||
          `${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`,
        circleId,
        circleName,
        amount,
        message,
        occasion,
        claimToken,
        expiresAt,
      },
    });

    // Send email invitation
    const transporter = createEmailTransporter();
    if (!transporter) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const claimLink = `${
      process.env.NEXTAUTH_URL || "https://grove-wine.vercel.app"
    }/claim/${claimToken}`;

    const emailTemplate = giftClaimEmail({
      senderName:
        senderName ||
        `${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`,
      senderAddress,
      recipientEmail,
      amount,
      message,
      occasion: occasion || "special occasion",
      circleName,
      claimLink,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    // Update record to mark email as sent
    await prisma.giftClaimInvite.update({
      where: { id: giftClaimInvite.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      claimToken,
      expiresAt,
      message: `Gift claim email sent to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending gift claim email:", error);
    return NextResponse.json(
      { error: "Failed to send gift claim email" },
      { status: 500 }
    );
  }
}

// Email template for gift claims
function giftClaimEmail(data: {
  senderName: string;
  senderAddress: string;
  recipientEmail: string;
  amount: string;
  message?: string;
  occasion: string;
  circleName: string;
  claimLink: string;
}) {
  return {
    subject: `🎁 You have crypto waiting for your ${data.occasion}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Grove Gift Claim</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header .emoji { font-size: 48px; margin-bottom: 16px; }
            .content { padding: 40px 20px; }
            .gift-box { background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%); border: 2px solid #f59e0b; padding: 30px; margin: 20px 0; border-radius: 16px; text-align: center; }
            .amount { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 16px 0; }
            .message-box { background-color: #f8f9fa; border-left: 4px solid #ec4899; padding: 20px; margin: 20px 0; border-radius: 8px; font-style: italic; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; margin: 20px 0; font-size: 18px; }
            .cta-button:hover { opacity: 0.9; transform: translateY(-2px); transition: all 0.2s; }
            .info-box { background-color: #eff6ff; border: 1px solid #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
            .highlight { color: #ec4899; font-weight: bold; }
            .security-note { background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 16px; border-radius: 8px; font-size: 14px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎁</div>
              <h1>You Have Crypto Waiting!</h1>
              <p style="color: #fef3c7; margin: 8px 0 0 0;">Someone sent you Bitcoin through Grove</p>
            </div>
            
            <div class="content">
              <div class="gift-box">
                <h2 style="margin-top: 0; color: #1f2937;">🎉 Gift for Your ${
                  data.occasion
                }</h2>
                <p><strong>${
                  data.senderName
                }</strong> sent you a special gift!</p>
                <div class="amount">${data.amount} BTC</div>
                <p style="color: #6b7280; font-size: 14px;">From "${
                  data.circleName
                }" circle</p>
              </div>

              ${
                data.message
                  ? `
                <div class="message-box">
                  <h3 style="margin-top: 0; color: #1f2937;">💌 Personal Message</h3>
                  <p>"${data.message}"</p>
                  <p style="text-align: right; font-size: 14px; color: #6b7280; margin-bottom: 0;">— ${data.senderName}</p>
                </div>
              `
                  : ""
              }

              <div class="info-box">
                <h3 style="margin-top: 0; color: #1e40af;">🚀 How to Claim Your Gift</h3>
                <ol style="padding-left: 20px;">
                  <li>Click the "Claim Gift" button below</li>
                  <li>Login with <strong>this email account</strong> or connect via social media</li>
                  <li>Your gift will be transferred to your new Grove wallet</li>
                  <li>Start using Grove to save and collaborate with friends!</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <a href="${
                  data.claimLink
                }" class="cta-button">🎁 Claim My Gift</a>
              </div>

              <div class="security-note">
                <strong>⚡ Important:</strong> This claim link expires in 48 hours for your security. If you need help, reply to this email or contact Grove support.
              </div>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">🌳 What is Grove?</h3>
                <p>Grove empowers communities to grow their Bitcoin savings together. Create circles with family and friends, track shared goals, and build financial security on Bitcoin's most advanced Layer 2.</p>
                <p><strong>Your gift is just the beginning!</strong> Join Grove to start your own savings journey.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>🌳 Grove - Cultivate wealth through Bitcoin collaboration</p>
              <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">
                Sent from ${data.senderAddress.slice(
                  0,
                  6
                )}...${data.senderAddress.slice(-4)}<br>
                This gift is secured on Citrea - Bitcoin's most advanced Layer 2
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🎁 You Have Crypto Waiting!

${data.senderName} sent you a special gift for your ${data.occasion}!

Amount: ${data.amount} BTC
From: "${data.circleName}" circle

${data.message ? `Personal Message: "${data.message}"` : ""}

Claim your gift: ${data.claimLink}

How to claim:
1. Click the link above
2. Login with this email account or connect via social media  
3. Your gift will be transferred to your new Grove wallet
4. Start using Grove to save with friends!

⚡ Important: This link expires in 48 hours for security.

🌳 Grove - Cultivate wealth through Bitcoin collaboration
    `,
  };
}
