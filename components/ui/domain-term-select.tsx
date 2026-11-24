"use client";

import { cn } from "@/lib/utils";
import type { DomainPeriodPrice } from "@/lib/api";

interface DomainTermSelectProps {
  domain: string;
  periods: DomainPeriodPrice[];
  value: number;
  onChange: (years: number) => void;
  /** Locked once the domain is in the cart — remove it to pick another term. */
  disabled?: boolean;
  className?: string;
}

/** Compact registration-term picker for search rows that offer multi-year terms (.ng / .com.ng). */
export function DomainTermSelect({
  domain,
  periods,
  value,
  onChange,
  disabled,
  className,
}: DomainTermSelectProps) {
  const terms = [...periods].sort((a, b) => a.years - b.years);
  return (
    <select
      id={`domain-term-${domain.replace(/\./g, "-")}`}
      aria-label={`Registration term for ${domain}`}
      title={disabled ? "Remove from cart to change the term" : undefined}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "h-7 pl-2 pr-1 text-[11px] font-semibold text-[#031033] bg-white border border-[#e2eaff] rounded-md outline-none focus:border-[#1787D4] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      {terms.map((p) => (
        <option key={p.years} value={p.years}>
          {p.years} {p.years === 1 ? "year" : "years"}
        </option>
      ))}
    </select>
  );
}

/** Suffix for a price: "1st yr" for one year, "N years" for longer terms. */
export const domainTermSuffix = (years: number) =>
  years === 1 ? "1st yr" : `${years} years`;
