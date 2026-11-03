"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export default function VpsModal({
  title,
  description,
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
  busy = false,
}: {
  title: string;
  description?: ReactNode;
  /** Accepted for compatibility; modal headers no longer render an icon chip. */
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
        className="absolute inset-0 bg-[#031033]/40"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div
        className={`relative w-full ${maxWidth} max-h-[92vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
          <div className="min-w-0">
              <h2
                id={titleId}
                className="text-lg font-semibold text-[#031033] leading-tight"
              >
                {title}
              </h2>
              {description && (
                <div className="text-sm text-[#5A6A85] mt-1 leading-snug">
                  {description}
                </div>
              )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[#EEF2F7] flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
