import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className='relative inline-block text-left'>{children}</div>;
};

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

const DropdownMenuTrigger = ({ children }: DropdownMenuTriggerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return <div onClick={() => setIsOpen(!isOpen)}>{children}</div>;
};

interface DropdownMenuContentProps {
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}

const DropdownMenuContent = ({
  align = "center",
  className,
  children,
}: DropdownMenuContentProps) => {
  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
        align === "start" && "left-0 right-auto",
        align === "center" && "left-1/2 transform -translate-x-1/2",
        className
      )}
    >
      <div className='py-1'>{children}</div>
    </div>
  );
};

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const DropdownMenuItem = ({
  className,
  children,
  ...props
}: DropdownMenuItemProps) => {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = () => {
  return <div className='border-t border-gray-100 my-1' />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
