import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      circleId,
      circleName,
      senderAddress,
      recipientEmail,
      recipientName,
      giftAmount,
      message,
      giftToken,
    } = await request.json();

    if (
      !circleId ||
      !senderAddress ||
      !recipientEmail ||
      !giftAmount ||
      !giftToken
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Store gift invitation in database
    // For now, we'll simulate the email sending

    // Create gift invitation record
    const giftInvitation = {
      giftToken,
      circleId,
      circleName,
      senderAddress,
      recipientEmail,
      recipientName: recipientName || recipientEmail,
      giftAmount,
      message,
      status: "PENDING",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    console.log("Gift invitation created:", giftInvitation);

   
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f97316); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎁 You've Received a Gift!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
            Hello ${recipientName || recipientEmail}!
          </p>
          
          <p style="color: #6b7280; margin-bottom: 30px;">
            Someone has sent you the savings from their Bitcoin circle "${circleName}" as a gift!
          </p>
          
          <div style="background: white; border: 2px solid #ec4899; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h2 style="color: #ec4899; margin: 0; font-size: 24px;">Gift Amount</h2>
            <p style="font-size: 32px; font-weight: bold; color: #111827; margin: 10px 0;">
              ${parseFloat(giftAmount).toFixed(8)} BTC
            </p>
          </div>
          
          ${
            message
              ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-style: italic;">"${message}"</p>
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/claim?token=${giftToken}" 
               style="background: linear-gradient(135deg, #ec4899, #f97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              🎁 Claim Your Gift
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This gift will expire in 7 days. Click the button above to claim it to your wallet.
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
            Sent via Grove - Bitcoin Savings Circles
          </p>
        </div>
      </div>
    `;

    // TODO: Send actual email using Resend
    // For now, just log the email content
    console.log("Gift invitation email would be sent to:", recipientEmail);
    console.log("Email content:", emailContent);

    return NextResponse.json({
      success: true,
      giftToken,
      message: "Gift invitation sent successfully",
    });
  } catch (error) {
    console.error("Error sending gift invitation:", error);
    return NextResponse.json(
      { error: "Failed to send gift invitation" },
      { status: 500 }
    );
  }
}
