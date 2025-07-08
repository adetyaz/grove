"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, TestTube, CheckCircle, XCircle, Settings } from "lucide-react";
import { groveToast } from "@/lib/toast";

export default function EmailTestComponent() {
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<boolean | null>(null);

  const testEmailService = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/test/notifications", {
        method: "POST",
      });
      const result = await response.json();

      setEmailStatus(result.email);

      if (result.email) {
        groveToast.success("✅ Email service is configured and ready!");
      } else {
        groveToast.warning(
          "⚠️ Email service needs configuration. Check your .env.local file."
        );
      }
    } catch (error) {
      console.error("Email test error:", error);
      groveToast.error("❌ Failed to test email service");
      setEmailStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestInvitation = async () => {
    if (!testEmail) {
      groveToast.error("Please enter an email address");
      return;
    }

    if (!emailStatus) {
      groveToast.error(
        "Email service is not configured. Please test service first."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          inviterName: "Grove Test User",
          inviterAddress: "0x1234567890123456789012345678901234567890",
          circleName: "Test Bitcoin Circle",
          inviteLink: `${window.location.origin}/join?test=true`,
          circleDescription:
            "This is a test invitation to verify email functionality is working correctly.",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        groveToast.success(`🎉 Test invitation sent to ${testEmail}!`);
        setTestEmail("");
      } else {
        groveToast.error(result.error || "Failed to send test invitation");
      }
    } catch (error) {
      console.error("Test invitation error:", error);
      groveToast.error("Failed to send test invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIndicator = ({ status }: { status: boolean | null }) => {
    if (status === null) {
      return <div className='w-4 h-4 bg-gray-400 rounded-full animate-pulse' />;
    }
    return status ? (
      <CheckCircle className='w-4 h-4 text-green-500' />
    ) : (
      <XCircle className='w-4 h-4 text-red-500' />
    );
  };

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 text-white max-w-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Mail className='w-5 h-5 text-blue-400' />
          Email Service Test
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Service Status */}
        <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
          <div className='flex items-center gap-3'>
            <Settings className='w-4 h-4 text-gray-400' />
            <span className='text-sm'>Email Service Status</span>
          </div>
          <div className='flex items-center gap-2'>
            <StatusIndicator status={emailStatus} />
            <span className='text-xs'>
              {emailStatus === null
                ? "Not tested"
                : emailStatus
                  ? "Ready"
                  : "Not configured"}
            </span>
          </div>
        </div>

        {/* Test Service Button */}
        <Button
          onClick={testEmailService}
          disabled={isLoading}
          variant='outline'
          className='w-full border-white/20 text-white hover:bg-white/10'
        >
          {isLoading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Testing...
            </>
          ) : (
            <>
              <TestTube className='w-4 h-4 mr-2' />
              Test Email Service
            </>
          )}
        </Button>

        {/* Test Invitation Section */}
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Send Test Invitation To:
            </label>
            <Input
              type='email'
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className='bg-white/10 border-white/20 text-white placeholder-gray-400'
              placeholder='your-email@gmail.com'
            />
          </div>

          <Button
            onClick={sendTestInvitation}
            disabled={isLoading || !testEmail || emailStatus === false}
            className='w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Sending...
              </>
            ) : (
              <>
                <Mail className='w-4 h-4 mr-2' />
                Send Test Invitation
              </>
            )}
          </Button>
        </div>

        {/* Configuration Help */}
        <div className='text-xs text-gray-400 bg-white/5 p-3 rounded-lg'>
          <p className='font-medium mb-2'>📧 Email Configuration:</p>
          <ul className='space-y-1 text-xs'>
            <li>• Add Gmail credentials to .env.local</li>
            <li>• Use App Password (not regular password)</li>
            <li>• Check spam folder for test emails</li>
            <li>• SMTP_HOST=smtp.gmail.com</li>
            <li>• SMTP_PORT=587</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
