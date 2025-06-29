import * as React from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
        {...props}
      >
        <div
          className='h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 ease-in-out'
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
