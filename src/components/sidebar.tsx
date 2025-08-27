"use client";

import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Compass,
  Trophy,
  Settings,
  Vote,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "My Circles", href: "/dashboard/circles", icon: Users },
  { name: "Discover Circles", href: "/dashboard/discover", icon: Compass },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Voting", href: "/dashboard/voting", icon: Vote },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className='fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white p-2 rounded-lg border border-slate-700 shadow-lg'
      >
        <Menu className='w-5 h-5' />
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 transition-all duration-300 z-50",
          // Desktop behavior
          "hidden lg:flex lg:flex-col",
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile behavior
          "lg:translate-x-0",
          mobileOpen ? "flex flex-col w-64 translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          {!collapsed && (
            <Link
              href='/'
              className='flex items-center space-x-2 hover:opacity-80 transition-opacity'
            >
              <span className='text-2xl'>🌳</span>
              <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                Grove
              </h1>
            </Link>
          )}

          {collapsed && (
            <Link
              href='/'
              className='flex items-center justify-center hover:opacity-80 transition-opacity'
            >
              <span className='text-2xl'>🌳</span>
            </Link>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className='hidden lg:flex text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded'
          >
            {collapsed ? (
              <ChevronRight className='w-4 h-4' />
            ) : (
              <ChevronLeft className='w-4 h-4' />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className='lg:hidden text-slate-400 hover:text-white transition-colors p-1'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                )}
              >
                <item.icon className='w-5 h-5 flex-shrink-0' />
                {!collapsed && (
                  <span className='font-medium truncate transition-opacity duration-200'>
                    {item.name}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className='absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-600 shadow-lg'>
                    {item.name}
                    <div className='absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-600'></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className='p-4 border-t border-slate-700'>
          {!collapsed ? (
            <div className='text-xs text-slate-400 text-center'>Grove v1.0</div>
          ) : (
            <div className='w-2 h-2 bg-slate-600 rounded-full mx-auto'></div>
          )}
        </div>
      </div>
    </>
  );
}
