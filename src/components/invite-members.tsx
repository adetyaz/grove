"use client";
// import { useAccount } from "wagmi";
import { useState } from "react";

export default function InviteMembers({ circleId }: { circleId: number }) {
  const [emails, setEmails] = useState<string[]>([]);

  const sendInvites = async () => {
    await fetch("/api/invites", {
      method: "POST",
      body: JSON.stringify({ circleId, emails }),
    });
  };

  return (
    <div>
      {emails.map((email, i) => (
        <input
          key={i}
          type='email'
          value={email}
          onChange={(e) => {
            const newEmails = [...emails];
            newEmails[i] = e.target.value;
            setEmails(newEmails);
          }}
          placeholder='member@email.com'
        />
      ))}
      <button onClick={() => setEmails([...emails, ""])}>+ Add Email</button>
      <button onClick={sendInvites}>Send Invites</button>
    </div>
  );
}
