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
} from "lucide-react";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetOrders } from "@/hooks/useOrders";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchItem = {
  id: string;
  category: "Navigation" | "My Domains" | "Hosting Accounts" | "Orders";
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STATIC_ROUTES: SearchItem[] = [
  { id: "nav-overview", category: "Navigation", title: "Overview", subtitle: "Dashboard Home / Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "nav-hosting", category: "Navigation", title: "Hosting Services", subtitle: "Manage hosting accounts", href: "/dashboard/hosting", icon: Server },
  { id: "nav-domains", category: "Navigation", title: "Domains Manager", subtitle: "DNS & Nameserver management", href: "/dashboard/domains", icon: Globe },
  { id: "nav-domain-transfer", category: "Navigation", title: "Domain Transfer", subtitle: "Transfer domains in or request EPP out", href: "/dashboard/domain-transfer", icon: ArrowRightLeft },
  { id: "nav-orders", category: "Navigation", title: "Orders & Invoices", subtitle: "Payment history & invoices", href: "/dashboard/orders", icon: Receipt },
  { id: "nav-tickets", category: "Navigation", title: "Support Tickets", subtitle: "Open tickets & customer support", href: "/dashboard/tickets", icon: LifeBuoy },
  { id: "nav-settings", category: "Navigation", title: "Account Settings", subtitle: "Profile information & password changes", href: "/dashboard/settings", icon: Settings },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch active user data to search through
  const { data: domains } = useGetRegisteredDomains();
  const { data: hosting } = useGetHosting();
  const { data: orders } = useGetOrders();

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown listener for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compile search list
  const searchItems = useMemo((): SearchItem[] => {
    const items: SearchItem[] = [...STATIC_ROUTES];

    // Add registered domains
    if (Array.isArray(domains)) {
      domains.forEach((d) => {
        items.push({
          id: `domain-${d.id}`,
          category: "My Domains",
          title: d.domain,
          subtitle: `Status: ${d.status} • Expires: ${new Date(d.expiryDate).toLocaleDateString()}`,
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
          category: "Hosting Accounts",
          title: h.domain,
          subtitle: `${h.plan?.name ?? "Hosting"} Plan • Status: ${h.status}`,
          href: `/dashboard/hosting/${h.id}`,
          icon: Server,
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
          subtitle: `₦${o.amount.toLocaleString()} • Status: ${o.status} • ${itemNames}`,
          href: "/dashboard/orders",
          icon: Receipt,
        });
      });
    }

    return items;
  }, [domains, hosting, orders]);

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

  // Reset activeIndex when filtered results change
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems]);

  // Keyboard navigation inside the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = (prev + 1) % filteredItems.length;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = (prev - 1 + filteredItems.length) % filteredItems.length;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = filteredItems[activeIndex];
      if (targetItem) {
        router.push(targetItem.href);
        onClose();
      }
    }
  };

  const scrollIntoView = (index: number) => {
    const listElement = scrollContainerRef.current;
    if (!listElement) return;

    const itemElement = listElement.children[index] as HTMLElement;
    if (!itemElement) return;

    const listHeight = listElement.clientHeight;
    const itemTop = itemElement.offsetTop;
    const itemHeight = itemElement.clientHeight;

    if (itemTop + itemHeight > listElement.scrollTop + listHeight) {
      listElement.scrollTop = itemTop + itemHeight - listHeight;
    } else if (itemTop < listElement.scrollTop) {
      listElement.scrollTop = itemTop;
    }
  };

  const handleItemClick = (item: SearchItem) => {
    router.push(item.href);
    onClose();
  };

  if (!isOpen) return null;

  // Group by category
  const categories = ["Navigation", "My Domains", "Hosting Accounts", "Orders"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#031033]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative bg-white w-full max-w-xl shadow-2xl border border-[#e2eaff] flex flex-col max-h-[70vh] overflow-hidden animate-slideDown"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 border-b border-[#e2eaff] gap-3 shrink-0">
          <Search className="w-5 h-5 text-[#9ba8c0]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, domains, plans, orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-4 text-sm text-[#031033] placeholder-[#9ba8c0] outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-[#f2f5fc] border border-[#e2eaff] px-1.5 py-0.5 text-[9px] font-mono text-[#9ba8c0]">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-[#9ba8c0] hover:text-[#031033] hover:bg-[#f2f5fc] transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 px-4 text-center text-[#5a6a85] flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-8 h-8 text-[#9ba8c0]" />
              <p className="text-sm font-semibold">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#9ba8c0]">Try searching for other words or sections.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Category-based rendering or flattened render for highlighted index mapping */}
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === activeIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center text-left px-4 py-3 gap-3 transition-colors ${
                      isSelected
                        ? "bg-[#fff8ee] text-[#031033] border-l-4 border-[#e8900a]"
                        : "text-[#5a6a85] hover:bg-[#f2f5fc] border-l-4 border-transparent"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white border border-[#f5d38a] text-[#e8900a]" : "bg-[#f2f5fc] text-[#9ba8c0]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#9ba8c0] uppercase tracking-widest text-[9px] mb-0.5">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-[#031033] truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-[#5a6a85] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-[#e8900a] shrink-0 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#f6f9ff] border-t border-[#e2eaff] text-[10px] text-[#9ba8c0] flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            Use <kbd className="font-mono bg-white px-1 py-0.5 border border-[#e2eaff]">↑↓</kbd> to navigate,
            <kbd className="font-mono bg-white px-1 py-0.5 border border-[#e2eaff] ml-0.5">Enter</kbd> to select
          </span>
          <span>{filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Minimal dummy shield icon to prevent import crash if lucide icon not found
function ShieldAlert({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
