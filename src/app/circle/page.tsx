import { notFound } from "next/navigation";

// This page is deprecated. Use /circles/[id] for dynamic circle details.
export default function DeprecatedCirclePage() {
  return notFound();
}
