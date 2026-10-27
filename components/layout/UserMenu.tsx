"use client";

import * as React from "react";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import {
  BadgeCheck,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/hooks/useUser";

export type AccountSummary = Partial<UserProfile> | null | undefined;

const ACCOUNT_LINKS: {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { id: "nav-go-to-dashboard", label: "Client area", href: "/dashboard", icon: LayoutDashboard },
  { id: "nav-account-billing", label: "Billing & invoices", href: "/dashboard/invoices", icon: CreditCard },
  { id: "nav-account-support", label: "Support", href: "/dashboard/tickets", icon: LifeBuoy },
  { id: "nav-account-settings", label: "Account settings", href: "/dashboard/settings", icon: Settings },
];

function getDisplayName(account: AccountSummary) {
  const name = [account?.firstName, account?.lastName]
    .filter((part) => !!part)
    .join(" ")
    .trim();
  return name || account?.email?.split("@")[0] || "Your account";
}

function getInitials(account: AccountSummary) {
  const initials = `${account?.firstName?.[0] ?? ""}${account?.lastName?.[0] ?? ""}`.toUpperCase();
  return initials || account?.email?.[0]?.toUpperCase() || "U";
}

/* ─── Avatar ────────────────────────────────────────────────── */
export function AccountAvatar({
  account,
  size = 30,
  className,
}: {
  account: AccountSummary;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center rounded-full text-white",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        letterSpacing: "0.01em",
        background:
          "linear-gradient(135deg, #4aa9ea 0%, #1787D4 48%, #0b5ea6 100%)",
      }}
    >
      {getInitials(account)}
    </span>
  );
}

/* ─── Identity block (shared) ───────────────────────────────── */
function AccountIdentity({
  account,
  avatarSize,
  nameClassName,
  emailClassName,
}: {
  account: AccountSummary;
  avatarSize: number;
  nameClassName?: string;
  emailClassName?: string;
}) {
  return (
    <>
      <AccountAvatar account={account} size={avatarSize} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn("truncate font-semibold text-[#031033]", nameClassName)}>
            {getDisplayName(account)}
          </p>
          {account?.verified && (
            <span title="Verified account" className="shrink-0">
              <BadgeCheck
                className="h-3.5 w-3.5 text-[#1787D4]"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </span>
          )}
        </div>
        {account?.email && (
          <p className={cn("truncate text-[#5a6a85]", emailClassName)}>
            {account.email}
          </p>
        )}
      </div>
    </>
  );
}

/* ─── Desktop: trigger + dropdown ───────────────────────────── */
export function UserMenu({
  account,
  isLoggingOut,
  onLogout,
}: {
  account: AccountSummary;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="nav-profile-btn"
          type="button"
          aria-label="Open account menu"
          className={cn(
            "group inline-flex h-9 items-center gap-1.5 rounded-full pl-0.5 pr-2",
            "text-[#5a6a85] transition-colors hover:bg-[#f2f5fc] data-[state=open]:bg-[#f2f5fc]",
            "outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/40 focus-visible:ring-offset-2",
            "cursor-pointer border-none bg-transparent",
          )}
        >
          <AccountAvatar account={account} size={30} />
          <ChevronDown
            className="h-3.5 w-3.5 text-[#9ba8c0] transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className={cn(
            "z-50 w-[296px] origin-top-right rounded-2xl border border-[#e2eaff] bg-white p-1.5",
            "shadow-[0_20px_48px_-12px_rgba(15,23,42,0.24),0_2px_8px_rgba(15,23,42,0.06)]",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150",
          )}
        >
          <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
            <AccountIdentity
              account={account}
              avatarSize={38}
              nameClassName="text-[13.5px]"
              emailClassName="mt-0.5 text-[11.5px]"
            />
          </div>

          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-[#edf1fa]" />

          <DropdownMenu.Group className="flex flex-col gap-0.5">
            {ACCOUNT_LINKS.map(({ id, label, href, icon: Icon }) => (
              <DropdownMenu.Item key={id} asChild>
                <Link
                  href={href}
                  id={id}
                  className={cn(
                    "group/item flex select-none items-center gap-2.5 rounded-lg px-2.5 py-2",
                    "text-[13px] font-medium text-[#031033] outline-none transition-colors",
                    "data-[highlighted]:bg-[#f2f5fc] data-[highlighted]:text-[#1787D4]",
                    "cursor-pointer",
                  )}
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-[#8a96ab] transition-colors group-data-[highlighted]/item:text-[#1787D4]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>

          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-[#edf1fa]" />

          <DropdownMenu.Item
            id="nav-logout"
            disabled={isLoggingOut}
            onSelect={(event) => {
              event.preventDefault();
              onLogout();
            }}
            className={cn(
              "group/item flex select-none items-center gap-2.5 rounded-lg px-2.5 py-2",
              "text-[13px] font-medium text-[#031033] outline-none transition-colors cursor-pointer",
              "data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600",
              "data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
            )}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut
                className="h-4 w-4 shrink-0 text-[#8a96ab] transition-colors group-data-[highlighted]/item:text-red-500"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/* ─── Mobile: account panel ─────────────────────────────────── */
export function MobileAccountPanel({
  account,
  isLoggingOut,
  onLogout,
}: {
  account: AccountSummary;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e2eaff] bg-white p-1.5 shadow-[0_6px_20px_rgba(23,135,212,0.06)]">
      <div className="flex items-center gap-3 px-2.5 py-2.5">
        <AccountIdentity
          account={account}
          avatarSize={40}
          nameClassName="text-[14px]"
          emailClassName="mt-0.5 text-[12px]"
        />
      </div>

      <div className="mx-1 my-1 h-px bg-[#edf1fa]" />

      <div className="grid grid-cols-2 gap-1 p-1">
        {ACCOUNT_LINKS.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            className="flex flex-col gap-2 rounded-xl px-3 py-3 transition-colors hover:bg-[#f2f5fc] active:bg-[#eaf2fc]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1787D4]/10 text-[#1787D4]">
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span className="text-[12.5px] font-semibold leading-tight text-[#031033]">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mx-1 my-1 h-px bg-[#edf1fa]" />

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-none bg-transparent px-3 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
        {isLoggingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
