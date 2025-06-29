import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  const { circleId, emails } = await req.json();

  await Promise.all(
    emails.map((email: string) =>
      sgMail.send({
        to: email,
        from: "circles@grove.com",
        templateId: "d-123abc",
        dynamicTemplateData: {
          circleId,
          joinLink: `https://app.grove.com/join?circle=${circleId}&email=${email}`,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
