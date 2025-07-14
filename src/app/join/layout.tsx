import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Circle | Grove",
  description:
    "Join a Grove savings circle and start your financial journey together.",
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
