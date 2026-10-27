"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export default function VpsModal({
  title,
  description,
  icon: Icon,
  iconClassName = "bg-[#eff6fc] text-[#1787D4] border-[#d6eaf8]",
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
  busy = false,
}: {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  busy?: boolean;
}) {
  const titleId = useId();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKey);
    };
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div
        className={`relative w-full ${maxWidth} max-h-[92vh] flex flex-col bg-white rounded-xl border border-[#e8e8ed] shadow-2xl overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#eef2f8]">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${iconClassName}`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>
            )}
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[15.5px] font-bold text-[#1d1d1f] leading-tight"
              >
                {title}
              </h2>
              {description && (
                <div className="text-[12.5px] text-[#6e6e73] mt-0.5 leading-snug">
                  {description}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#8a9bb2] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-[#eef2f8] bg-[#fbfcfe] flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
