/**
 * Mobile-optimized Input Component
 * Requirement 6.2: Touch-friendly interactions
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  touchOptimized?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, touchOptimized = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          // Mobile-optimized sizing
          touchOptimized ? "h-12 text-base md:h-10 md:text-sm" : "h-10 text-sm",
          // Prevent zoom on iOS
          touchOptimized && "text-[16px] md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }