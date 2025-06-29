"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Wallet, Plus, X, Check } from "lucide-react";
import { groveToast } from "@/lib/toast";

interface InviteMemberFormProps {
  circleId: number;
  circleName: string;
  userEmail: string;
  onInviteSent?: () => void;
}

interface InviteEntry {
  id: string;
  type: "email" | "wallet";
  value: string;
  status: "pending" | "sending" | "sent" | "error";
  error?: string;
}

export default function InviteMemberForm({
  circleId,
  circleName,
  userEmail,
  onInviteSent,
}: InviteMemberFormProps) {
  const [invites, setInvites] = useState<InviteEntry[]>([]);
  const [newInviteValue, setNewInviteValue] = useState("");
  const [newInviteType, setNewInviteType] = useState<"email" | "wallet">(
    "email"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidWalletAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const addInvite = () => {
    if (!newInviteValue.trim()) return;

    const isValid =
      newInviteType === "email"
        ? isValidEmail(newInviteValue)
        : isValidWalletAddress(newInviteValue);

    if (!isValid) {
      groveToast.error(
        `Please enter a valid ${newInviteType === "email" ? "email address" : "wallet address"}`
      );
      return;
    }

    // Check for duplicates
    const isDuplicate = invites.some(
      (invite) => invite.value.toLowerCase() === newInviteValue.toLowerCase()
    );

    if (isDuplicate) {
      groveToast.warning("This invitation has already been added");
      return;
    }

    const newInvite: InviteEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type: newInviteType,
      value: newInviteValue.trim(),
      status: "pending",
    };

    setInvites((prev) => [...prev, newInvite]);
    setNewInviteValue("");
    groveToast.success(
      `${newInviteType === "email" ? "Email" : "Wallet address"} added to invitation list`
    );
  };

  const removeInvite = (id: string) => {
    setInvites((prev) => prev.filter((invite) => invite.id !== id));
  };

  const sendInvitations = async () => {
    if (invites.length === 0) return;

    setIsSubmitting(true);

    // Process each invitation
    for (const invite of invites) {
      if (invite.status !== "pending") continue;

      // Update status to sending
      setInvites((prev) =>
        prev.map((inv) =>
          inv.id === invite.id ? { ...inv, status: "sending" } : inv
        )
      );

      try {
        const payload = {
          circleId,
          inviterEmail: userEmail,
          inviteType: invite.type,
          ...(invite.type === "email"
            ? { inviteeEmail: invite.value }
            : { inviteeWalletAddress: invite.value }),
        };

        const response = await fetch("/api/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setInvites((prev) =>
            prev.map((inv) =>
              inv.id === invite.id ? { ...inv, status: "sent" } : inv
            )
          );

          // Show success toast for each invite
          if (invite.type === "email") {
            groveToast.invitationSent(invite.value);
          } else {
            groveToast.success(
              `Invitation sent to ${invite.value.slice(0, 6)}...${invite.value.slice(-4)}`
            );
          }
        } else {
          const errorData = await response.json();
          setInvites((prev) =>
            prev.map((inv) =>
              inv.id === invite.id
                ? {
                    ...inv,
                    status: "error",
                    error: errorData.error || "Failed to send",
                  }
                : inv
            )
          );
          groveToast.error(
            `Failed to send invitation to ${invite.value}: ${errorData.error || "Unknown error"}`
          );
        }
      } catch (err) {
        console.error("Network error sending invitation:", err);
        setInvites((prev) =>
          prev.map((inv) =>
            inv.id === invite.id
              ? { ...inv, status: "error", error: "Network error" }
              : inv
          )
        );
        groveToast.error(`Network error sending invitation to ${invite.value}`);
      }
    }

    setIsSubmitting(false);

    // Show summary toast
    const successCount = invites.filter((inv) => inv.status === "sent").length;
    const errorCount = invites.filter((inv) => inv.status === "error").length;

    if (successCount > 0 && errorCount === 0) {
      groveToast.success(
        `All ${successCount} invitations sent successfully! 🎉`
      );
    } else if (successCount > 0 && errorCount > 0) {
      groveToast.warning(
        `${successCount} invitations sent, ${errorCount} failed`
      );
    } else if (errorCount > 0) {
      groveToast.error(`All ${errorCount} invitations failed to send`);
    }

    onInviteSent?.();
  };

  const resetForm = () => {
    setInvites([]);
    setNewInviteValue("");
    setNewInviteType("email");
  };

  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending"
  );
  const sentInvites = invites.filter((invite) => invite.status === "sent");
  const errorInvites = invites.filter((invite) => invite.status === "error");

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Plus className='h-5 w-5' />
          Invite Members to &ldquo;{circleName}&rdquo;
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Add New Invite */}
        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant={newInviteType === "email" ? "default" : "outline"}
              size='sm'
              onClick={() => setNewInviteType("email")}
              className='flex items-center gap-1'
            >
              <Mail className='h-4 w-4' />
              Email
            </Button>
            <Button
              type='button'
              variant={newInviteType === "wallet" ? "default" : "outline"}
              size='sm'
              onClick={() => setNewInviteType("wallet")}
              className='flex items-center gap-1'
            >
              <Wallet className='h-4 w-4' />
              Wallet
            </Button>
          </div>

          <div className='flex gap-2'>
            <div className='flex-1'>
              <Label htmlFor='inviteValue' className='sr-only'>
                {newInviteType === "email" ? "Email Address" : "Wallet Address"}
              </Label>
              <Input
                id='inviteValue'
                value={newInviteValue}
                onChange={(e) => setNewInviteValue(e.target.value)}
                placeholder={
                  newInviteType === "email" ? "friend@example.com" : "0x1234..."
                }
                onKeyPress={(e) => e.key === "Enter" && addInvite()}
              />
            </div>
            <Button
              type='button'
              onClick={addInvite}
              disabled={!newInviteValue.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Pending Invites List */}
        {invites.length > 0 && (
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-700'>
              Invitations to Send ({pendingInvites.length})
            </h4>
            <div className='space-y-2'>
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    {invite.type === "email" ? (
                      <Mail className='h-4 w-4 text-gray-500' />
                    ) : (
                      <Wallet className='h-4 w-4 text-gray-500' />
                    )}
                    <span className='font-mono text-sm'>{invite.value}</span>
                    {invite.status === "sending" && (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600'></div>
                    )}
                    {invite.status === "sent" && (
                      <Check className='h-4 w-4 text-green-600' />
                    )}
                    {invite.status === "error" && (
                      <span className='text-xs text-red-600'>
                        {invite.error}
                      </span>
                    )}
                  </div>
                  {invite.status === "pending" && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeInvite(invite.id)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex gap-3 pt-4 border-t'>
          <Button
            onClick={sendInvitations}
            disabled={pendingInvites.length === 0 || isSubmitting}
            className='flex-1'
          >
            {isSubmitting
              ? "Sending..."
              : `Send ${pendingInvites.length} Invitation${pendingInvites.length !== 1 ? "s" : ""}`}
          </Button>
          {invites.length > 0 && (
            <Button
              type='button'
              variant='outline'
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Results Summary */}
        {(sentInvites.length > 0 || errorInvites.length > 0) && (
          <div className='space-y-2 p-4 bg-gray-50 rounded-lg'>
            {sentInvites.length > 0 && (
              <p className='text-sm text-green-700'>
                ✅ {sentInvites.length} invitation
                {sentInvites.length !== 1 ? "s" : ""} sent successfully
              </p>
            )}
            {errorInvites.length > 0 && (
              <p className='text-sm text-red-700'>
                ❌ {errorInvites.length} invitation
                {errorInvites.length !== 1 ? "s" : ""} failed to send
              </p>
            )}
          </div>
        )}

        {/* Information */}
        <div className='text-sm text-gray-600 space-y-1'>
          <p>
            💡 <strong>Email invites:</strong> Recipients will receive an email
            with a join link
          </p>
          <p>
            💡 <strong>Wallet invites:</strong> Direct blockchain invitation
            (they&apos;ll need to check their wallet)
          </p>
          <p>
            💡 <strong>Note:</strong> Invitations expire after 7 days
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
