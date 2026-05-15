"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white hover:bg-[#d12c3b] active:bg-[#b9202e]",
        secondary:
          "border border-gray-300 dark:border-border bg-white dark:bg-surface text-[#111] dark:text-text-primary hover:bg-gray-50 dark:hover:bg-[#1a1b1f]",
        ghost:
          "text-[#111] dark:text-text-primary hover:bg-gray-100 dark:hover:bg-[#1a1b1f]",
        danger:
          "bg-red-600 text-white hover:bg-red-700",
        chip:
          "border border-gray-300 dark:border-border bg-white dark:bg-surface rounded-full text-[#111] dark:text-text-primary hover:border-accent hover:bg-accent-soft dark:hover:bg-[#2a1518]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
