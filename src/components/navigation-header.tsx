"use client";

import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationHeader() {
  const { primaryWallet } = useDynamicConnection();
  const pathname = usePathname();
  const userAddress = primaryWallet?.address;

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Circles", href: "/circles" },
    { name: "Profile", href: "/profile" },
    { name: "Analytics", href: "/analytics" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className='bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 sticky top-0 z-50'>
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Logo */}
        <div className='flex items-center space-x-8'>
          <Link href='/dashboard' className='flex items-center space-x-3'>
            <div className='w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white font-bold'>G</span>
            </div>
            <span className='font-bold text-xl text-slate-800'>Grove</span>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-1'>
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size='sm'
                  className={
                    isActive(item.href)
                      ? "bg-slate-900 hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900"
                  }
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' className='relative'>
            <Bell className='w-4 h-4' />
            <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full'></span>
          </Button>
          <Link href="/profile" className='flex items-center space-x-3 hover:bg-slate-100 rounded-lg p-2 transition-colors'>
            <Avatar className='w-8 h-8'>
              <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm'>
                {userAddress ? userAddress.slice(2, 4).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div className='hidden md:block'>
              <p className='text-sm font-semibold text-slate-800'>
                {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Anonymous"}
              </p>
              <p className='text-xs text-slate-500'>View Profile</p>
            </div>
            <ChevronDown className='w-4 h-4 text-slate-400' />
          </Link>
        </div>
      </div>
    </header>
  );
}
