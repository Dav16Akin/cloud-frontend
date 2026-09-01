"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  glowColor?: string;
}

export function BentoCard({
  icon,
  title,
  description,
  badge,
  glowColor = "rgba(23, 135, 212, 0.12)",
  className,
  children,
  ...props
}: BentoCardProps) {
  return (
    <div
      data-slot="bento-card"
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#e2eaff] bg-white p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Background glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Header with Icon & Badge */}
          <div className="flex items-center justify-between mb-4">
            {icon && (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1787D4] border border-[#dbeafe] group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                {icon}
              </div>
            )}
            {badge && (
              <span className="inline-flex items-center rounded-full bg-[#f2f5fc] px-2.5 py-1 text-[11px] font-semibold text-[#5a6a85] border border-[#e2eaff]">
                {badge}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-[#031033] tracking-tight group-hover:text-[#1787D4] transition-colors mb-2">
            {title}
          </h3>
          <p className="text-sm text-[#5a6a85] leading-relaxed">
            {description}
          </p>
        </div>

        {children && <div className="mt-4 pt-4 border-t border-[#e2eaff]">{children}</div>}
      </div>
    </div>
  );
}

export default BentoCard;
