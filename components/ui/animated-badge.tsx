"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "orange" | "blue" | "white";
}

export function AnimatedBadge({
  children,
  icon,
  variant = "default",
  className,
  ...props
}: AnimatedBadgeProps) {
  const variantStyles = {
    default:
      "bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white/15",
    orange:
      "bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]/60 hover:bg-[#FFEDD5]",
    blue:
      "bg-[#EFF6FF] text-[#1370B5] border-[#BFDBFE] hover:bg-[#DBEAFE]",
    white:
      "bg-white text-[#031033] border-white/80 shadow-sm hover:bg-white/90",
  };

  return (
    <div
      data-slot="animated-badge"
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 select-none shadow-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

export default AnimatedBadge;
