"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  MessageCircle,
  Phone,
  Send,
  TestTube,
  Copy,
  Check,
} from "lucide-react";
import { useInvitations, InvitationData } from "@/hooks/useInvitations";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

interface InviteFormProps {
  circleId: number;
  circleName: string;
  circleDescription?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function InviteForm({
  circleId,
  circleName,
  circleDescription,
  onSuccess,
  onClose,
}: InviteFormProps) {
  const { user, primaryWallet } = useDynamicConnection();
  const { sendInvitation, isLoading, testNotificationServices } =
    useInvitations();

  // Form state
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [activeTab, setActiveTab] = useState("email");

  // Service availability
  const [serviceStatus, setServiceStatus] = useState({
    email: false,
    telegram: false,
    whatsapp: false,
  });

  // Test notification services on component mount
  useState(() => {
    testNotificationServices().then(setServiceStatus);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !telegram && !whatsapp) {
      groveToast.error("Please provide at least one contact method");
      return;
    }

    if (!user || !primaryWallet) {
      groveToast.error("Please connect your wallet first");
      return;
    }

    // Check if user has an email from Dynamic
    const userEmail = user.email;
    if (!userEmail) {
      groveToast.error(
        "Please ensure your Dynamic account has an email address for sending invitations"
      );
      return;
    }

    try {
      const invitationData: InvitationData = {
        recipientEmail: email,
        recipientTelegram: telegram || undefined,
        recipientWhatsApp: whatsapp || undefined,
        circleName,
        circleDescription: circleDescription || personalMessage || undefined,
      };

      await sendInvitation(
        invitationData,
        user.email || user.username || "Grove User",
        primaryWallet.address,
        userEmail // Pass user's email from Dynamic
      );

      // Reset form
      setEmail("");
      setTelegram("");
      setWhatsapp("");
      setPersonalMessage("");

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Invitation error:", error);
      groveToast.error("Failed to send invitation. Please try again.");
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <Card className='bg-white/10 backdrop-blur-sm border-white/20 max-w-lg w-full text-white'>
        <CardHeader className='text-center'>
          <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Send className='w-8 h-8 text-white' />
          </div>
          <CardTitle className='text-2xl'>Invite to Circle</CardTitle>
          <CardDescription className='text-gray-300'>
            Invite someone to join &ldquo;{circleName}&rdquo; and start growing
            Bitcoin together
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-3 bg-white/10'>
                <TabsTrigger
                  value='email'
                  className='data-[state=active]:bg-green-500 data-[state=active]:text-white'
                >
                  <Mail className='w-4 h-4 mr-2' />
                  Email
                  {serviceStatus.email && (
                    <div className='w-2 h-2 bg-green-400 rounded-full ml-2' />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value='telegram'
                  className='data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                >
                  <MessageCircle className='w-4 h-4 mr-2' />
                  Telegram
                  {serviceStatus.telegram && (
                    <div className='w-2 h-2 bg-green-400 rounded-full ml-2' />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value='whatsapp'
                  className='data-[state=active]:bg-green-600 data-[state=active]:text-white'
                >
                  <Phone className='w-4 h-4 mr-2' />
                  WhatsApp
                  {serviceStatus.whatsapp && (
                    <div className='w-2 h-2 bg-green-400 rounded-full ml-2' />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value='email' className='space-y-4'>
                <div>
                  <Label htmlFor='email' className='text-gray-300'>
                    Email Address *
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='bg-white/10 border-white/20 text-white placeholder-gray-400'
                    placeholder='friend@example.com'
                    required={activeTab === "email"}
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    {serviceStatus.email
                      ? "✅ Email service ready"
                      : "⚠️ Email service not configured"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value='telegram' className='space-y-4'>
                <div>
                  <Label htmlFor='telegram' className='text-gray-300'>
                    Telegram Chat ID
                  </Label>
                  <Input
                    id='telegram'
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className='bg-white/10 border-white/20 text-white placeholder-gray-400'
                    placeholder='@username or chat ID'
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    {serviceStatus.telegram
                      ? "✅ Telegram bot ready"
                      : "⚠️ Telegram bot not configured"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value='whatsapp' className='space-y-4'>
                <div>
                  <Label htmlFor='whatsapp' className='text-gray-300'>
                    WhatsApp Number
                  </Label>
                  <Input
                    id='whatsapp'
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className='bg-white/10 border-white/20 text-white placeholder-gray-400'
                    placeholder='+1234567890'
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    {serviceStatus.whatsapp
                      ? "✅ WhatsApp service ready"
                      : "⚠️ WhatsApp service not configured"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Personal Message */}
            <div>
              <Label htmlFor='message' className='text-gray-300'>
                Personal Message (Optional)
              </Label>
              <Textarea
                id='message'
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className='bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[80px]'
                placeholder='Add a personal note to your invitation...'
              />
            </div>

            {/* Multi-channel selector */}
            <div className='bg-white/5 p-4 rounded-lg border border-white/10'>
              <h4 className='font-medium mb-3 text-gray-200'>
                Send via multiple channels:
              </h4>
              <div className='space-y-2'>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!email}
                    onChange={(e) => e.target.checked || setEmail("")}
                    className='rounded border-gray-300'
                  />
                  <Mail className='w-4 h-4' />
                  <span>Email {serviceStatus.email && "✅"}</span>
                </label>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!telegram}
                    onChange={(e) => e.target.checked || setTelegram("")}
                    className='rounded border-gray-300'
                  />
                  <MessageCircle className='w-4 h-4' />
                  <span>Telegram {serviceStatus.telegram && "✅"}</span>
                </label>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!whatsapp}
                    onChange={(e) => e.target.checked || setWhatsapp("")}
                    className='rounded border-gray-300'
                  />
                  <Phone className='w-4 h-4' />
                  <span>WhatsApp {serviceStatus.whatsapp && "✅"}</span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='flex-1 border-white/20 text-white hover:bg-white/10'
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading || (!email && !telegram && !whatsapp)}
                className='flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4 mr-2' />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
