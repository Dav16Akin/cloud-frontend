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
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#e2eaff] shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#f2f5fc] border border-[#dce5f5] flex items-center justify-center text-[#1787D4] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[17px] font-bold text-[#031033] mb-1.5">{title}</h3>
      <p className="text-[13.5px] text-[#5a6a85] max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
