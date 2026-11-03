import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-6 py-10 text-center sm:py-12 ${className}`}
    >
      <Icon className="mb-3 h-5 w-5 text-[#5A6A85]" aria-hidden="true" />
      <h3 className="text-base font-semibold text-[#031033]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#5A6A85]">
        {description}
      </p>
      {action && <div className="mt-5 flex items-center gap-3">{action}</div>}
    </div>
  );
}
