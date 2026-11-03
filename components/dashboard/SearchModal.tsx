"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Settings,
  Server,
  Globe,
  ArrowRightLeft,
  Receipt,
  LifeBuoy,
  X,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetOrders } from "@/hooks/useOrders";
import { useGetVpsServers } from "@/hooks/useVps";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchItem = {
  id: string;
  category: "Navigation" | "My domains" | "Hosting accounts" | "VPS servers" | "Orders";
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STATIC_ROUTES: SearchItem[] = [
  { id: "nav-overview", category: "Navigation", title: "Overview", subtitle: "Client area / Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "nav-hosting", category: "Navigation", title: "Hosting services", subtitle: "Manage hosting accounts", href: "/dashboard/hosting", icon: Server },
  { id: "nav-vps", category: "Navigation", title: "VPS servers", subtitle: "Deploy & manage virtual servers", href: "/dashboard/vps", icon: Cpu },
  { id: "nav-domains", category: "Navigation", title: "Domains manager", subtitle: "DNS & nameserver management", href: "/dashboard/domains", icon: Globe },
  { id: "nav-domain-transfer", category: "Navigation", title: "Domain transfer", subtitle: "Transfer domains in or request EPP out", href: "/dashboard/domain-transfer", icon: ArrowRightLeft },
  { id: "nav-orders", category: "Navigation", title: "Orders & invoices", subtitle: "Payment history & invoices", href: "/dashboard/orders", icon: Receipt },
  { id: "nav-tickets", category: "Navigation", title: "Support tickets", subtitle: "Open tickets & customer support", href: "/dashboard/tickets", icon: LifeBuoy },
  { id: "nav-settings", category: "Navigation", title: "Account settings", subtitle: "Profile information & password changes", href: "/dashboard/settings", icon: Settings },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  if (!isOpen) return null;
  return <SearchDialog onClose={onClose} />;
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch active user data to search through
  const { data: domains } = useGetRegisteredDomains();
  const { data: hosting } = useGetHosting();
  const { data: orders } = useGetOrders();
  const { data: vpsServers } = useGetVpsServers();

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  // Global keydown listener for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Compile search list
  const searchItems = useMemo((): SearchItem[] => {
    const items: SearchItem[] = [...STATIC_ROUTES];

    // Add registered domains
    if (Array.isArray(domains)) {
      domains.forEach((d) => {
        items.push({
          id: `domain-${d.id}`,
          category: "My domains",
          title: d.domain,
          subtitle: `Status: ${d.status} · Expires: ${new Date(d.expiryDate).toLocaleDateString()}`,
          href: `/dashboard/domains/${d.id}`,
          icon: Globe,
        });
      });
    }

    // Add hosting accounts
    if (Array.isArray(hosting)) {
      hosting.forEach((h) => {
        items.push({
          id: `hosting-${h.id}`,
          category: "Hosting accounts",
          title: h.domain,
          subtitle: `${h.plan?.name ?? "Hosting"} plan · Status: ${h.status}`,
          href: `/dashboard/hosting/${h.id}`,
          icon: Server,
        });
      });
    }

    // Add VPS servers
    if (Array.isArray(vpsServers)) {
      vpsServers.forEach((server) => {
        items.push({
          id: `vps-${server.id}`,
          category: "VPS servers",
          title: server.name,
          subtitle: `${server.plan?.name ?? "VPS"} · ${server.status} · ${server.ipv4 ?? "IP pending"}`,
          href: `/dashboard/vps/${server.id}`,
          icon: Cpu,
        });
      });
    }

    // Add orders
    if (Array.isArray(orders)) {
      orders.forEach((o) => {
        const itemNames = o.items.map((i) => i.domainName || i.plan?.name || "Service").join(", ");
        items.push({
          id: `order-${o.id}`,
          category: "Orders",
          title: o.paystackRef,
          subtitle: `₦${o.amount.toLocaleString()} · Status: ${o.status} · ${itemNames}`,
          href: "/dashboard/orders",
          icon: Receipt,
        });
      });
    }

    return items;
  }, [domains, hosting, orders, vpsServers]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return STATIC_ROUTES;
    const lowerQuery = query.toLowerCase().trim();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
  }, [query, searchItems]);

  // Query changes can shrink the list, so clamp instead of resetting in an effect.
  const currentIndex =
    filteredItems.length === 0
      ? -1
      : Math.min(activeIndex, filteredItems.length - 1);

  // Keyboard navigation inside the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIndex + 1) % filteredItems.length;
      setActiveIndex(next);
      scrollIntoView(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
      setActiveIndex(next);
      scrollIntoView(next);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = filteredItems[currentIndex];
      if (targetItem) {
        router.push(targetItem.href);
        onClose();
      }
    }
  };

  const scrollIntoView = (index: number) => {
    const listElement = scrollContainerRef.current;
    if (!listElement) return;

    // Results sit inside a wrapper div, so look the row up by its index
    // rather than relying on the container's direct children.
    const itemElement = listElement.querySelector<HTMLElement>(
      `[data-index="${index}"]`
    );
    itemElement?.scrollIntoView({ block: "nearest" });
  };

  const handleItemClick = (item: SearchItem) => {
    router.push(item.href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#031033]/40 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in fade-in duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search input area */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#E2E8F0] px-4">
          <Search className="w-4 h-4 shrink-0 text-[#5A6A85]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, domains, plans, orders…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="flex-1 bg-transparent py-4 text-base text-[#031033] outline-none placeholder:text-[#5A6A85]/70 sm:text-sm"
          />
          <kbd className="hidden items-center rounded border border-[#E2E8F0] bg-[#F2F5FC] px-1.5 py-px font-sans text-xs text-[#5A6A85] sm:inline-flex">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#5A6A85] transition-colors hover:bg-[#F2F5FC] hover:text-[#031033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-[#031033]">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-[#5A6A85]">
                Try a domain name, a server name or a page such as Invoices.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === currentIndex;

                return (
                  <button
                    type="button"
                    key={item.id}
                    data-index={idx}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-[#F2F5FC]" : "hover:bg-[#F2F5FC]/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-[#1787D4]" : "text-[#5A6A85]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-xs text-[#5A6A85]">
                        {item.category}
                      </p>
                      <p className="truncate text-sm font-medium text-[#031033]">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="mt-0.5 truncate text-xs text-[#5A6A85]">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 shrink-0 text-[#5A6A85]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#EEF2F7] px-4 py-2.5 text-xs text-[#5A6A85]">
          <span className="flex items-center gap-1">
            Use
            <kbd className="rounded border border-[#E2E8F0] bg-[#F2F5FC] px-1 py-px font-sans">
              ↑↓
            </kbd>
            to navigate,
            <kbd className="rounded border border-[#E2E8F0] bg-[#F2F5FC] px-1 py-px font-sans">
              Enter
            </kbd>
            to select
          </span>
          <span className="tabular-nums">
            {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
