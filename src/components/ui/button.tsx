import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#E87722] text-white hover:bg-[#d06619] shadow",
      outline: "border-2 border-[#E87722] text-[#E87722] bg-transparent hover:bg-[#FFF3E0]",
      ghost: "hover:bg-[#FFF3E0] hover:text-[#E87722]",
      secondary: "bg-[#1A1A2E] text-white hover:bg-[#2a2a3e]",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      link: "text-[#E87722] underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes = {
      default: "h-10 px-5 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
