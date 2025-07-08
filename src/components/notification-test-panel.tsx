"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageCircle,
  Phone,
  TestTube,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { groveToast } from "@/lib/toast";

export default function NotificationTestPanel() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    email: boolean | null;
    telegram: boolean | null;
    whatsapp: boolean | null;
  }>({
    email: null,
    telegram: null,
    whatsapp: null,
  });

  const testNotificationServices = async () => {
    setTesting(true);
    setTestResults({ email: null, telegram: null, whatsapp: null });

    try {
      const response = await fetch("/api/test/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const results = await response.json();

      if (response.ok) {
        setTestResults(results);

        const successCount = Object.values(results).filter(Boolean).length;
        if (successCount > 0) {
          groveToast.success(
            `${successCount} notification service(s) working properly`
          );
        } else {
          groveToast.warning("No notification services are configured");
        }
      } else {
        groveToast.error("Failed to test notification services");
      }
    } catch (error) {
      console.error("Test error:", error);
      groveToast.error("Error testing notification services");
    } finally {
      setTesting(false);
    }
  };

  const sendTestInvitation = async () => {
    try {
      const response = await fetch("/api/test/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEmail: "test@example.com",
          testTelegram: "@testuser",
          testWhatsApp: "+1234567890",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        groveToast.success("Test invitation sent successfully!");
      } else {
        groveToast.error(result.error || "Failed to send test invitation");
      }
    } catch (error) {
      console.error("Test invitation error:", error);
      groveToast.error("Error sending test invitation");
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null)
      return <div className='w-4 h-4 bg-gray-400 rounded-full animate-pulse' />;
    return status ? (
      <CheckCircle className='w-4 h-4 text-green-500' />
    ) : (
      <XCircle className='w-4 h-4 text-red-500' />
    );
  };

  const StatusBadge = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Badge variant='secondary'>Testing...</Badge>;
    return status ? (
      <Badge className='bg-green-600'>Ready</Badge>
    ) : (
      <Badge variant='destructive'>Not Configured</Badge>
    );
  };

  return (
    <Card className='bg-white/10 backdrop-blur-sm border-white/20 text-white'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TestTube className='w-5 h-5' />
          Notification Services Test
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Service Status */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
            <div className='flex items-center gap-3'>
              <Mail className='w-5 h-5 text-blue-400' />
              <span>Email (NodeMailer)</span>
            </div>
            <div className='flex items-center gap-2'>
              <StatusIcon status={testResults.email} />
              <StatusBadge status={testResults.email} />
            </div>
          </div>

          <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
            <div className='flex items-center gap-3'>
              <MessageCircle className='w-5 h-5 text-blue-500' />
              <span>Telegram Bot</span>
            </div>
            <div className='flex items-center gap-2'>
              <StatusIcon status={testResults.telegram} />
              <StatusBadge status={testResults.telegram} />
            </div>
          </div>

          <div className='flex items-center justify-between p-3 bg-white/5 rounded-lg'>
            <div className='flex items-center gap-3'>
              <Phone className='w-5 h-5 text-green-500' />
              <span>WhatsApp (Twilio)</span>
            </div>
            <div className='flex items-center gap-2'>
              <StatusIcon status={testResults.whatsapp} />
              <StatusBadge status={testResults.whatsapp} />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className='flex gap-3'>
          <Button
            onClick={testNotificationServices}
            disabled={testing}
            variant='outline'
            className='flex-1 border-white/20 text-white hover:bg-white/10'
          >
            {testing ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Testing...
              </>
            ) : (
              <>
                <TestTube className='w-4 h-4 mr-2' />
                Test Services
              </>
            )}
          </Button>

          <Button
            onClick={sendTestInvitation}
            disabled={testing}
            className='flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
          >
            <Mail className='w-4 h-4 mr-2' />
            Test Invitation
          </Button>
        </div>

        {/* Configuration Help */}
        <div className='text-xs text-gray-400 bg-white/5 p-3 rounded-lg'>
          <p className='font-medium mb-2'>Configuration Help:</p>
          <ul className='space-y-1'>
            <li>• Email: Configure SMTP_* variables in .env.local</li>
            <li>• Telegram: Get bot token from @BotFather</li>
            <li>• WhatsApp: Set up Twilio account and get credentials</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
