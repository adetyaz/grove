"use client";

import { useSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({
  children,
  className,
}: DashboardLayoutProps) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "transition-all duration-300 min-h-screen",
        // Desktop responsive margin based on sidebar state
        "lg:ml-64",
        collapsed && "lg:ml-16",
        // Mobile padding for menu button
        "pt-16 lg:pt-0",
        className
      )}
    >
      {children}
    </main>
  );
}
