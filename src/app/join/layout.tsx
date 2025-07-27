import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Circle | Grove - Bitcoin Savings Circles",
  description:
    "Join a Grove savings circle and grow your Bitcoin together. Connect your wallet and start your collaborative savings journey with friends and family.",
  keywords: [
    "Bitcoin",
    "savings circles",
    "Grove",
    "collaborative savings",
    "cryptocurrency",
    "financial wellness",
    "Bitcoin L2",
    "Citrea",
  ],
  openGraph: {
    title: "Join Circle | Grove",
    description: "Join a Grove savings circle and grow your Bitcoin together",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Circle | Grove",
    description: "Join a Grove savings circle and grow your Bitcoin together",
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
