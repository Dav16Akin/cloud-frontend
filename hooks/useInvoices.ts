import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInvoices,
  payOrder,
  getOrderInvoice,
  type Invoice,
  type PayOrderResponse,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── List user invoices ─────────────────────────────────────────────────────────

export const useGetInvoices = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await getInvoices();
      if (Array.isArray(res?.data)) return res.data as Invoice[];
      if (Array.isArray(res)) return res as Invoice[];
      return [] as Invoice[];
    },
    enabled: !!token,
    staleTime: 30 * 1000,
  });
};

// ── Pay now for PENDING or FAILED invoice ──────────────────────────────────────

export const usePayInvoice = () => {
  return useMutation({
    mutationFn: (orderId: string) => payOrder(orderId),
    onSuccess: (res) => {
      const paymentUrl = res?.data?.paymentUrl;
      if (paymentUrl) {
        toast.success("Redirecting to Paystack payment gateway...");
        window.location.href = paymentUrl;
      } else {
        toast.error("Payment initialization succeeded but no gateway URL was returned.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to initialize payment. Please try again.");
    },
  });
};

// ── View invoice for PAID orders ──────────────────────────────────────────────

export const useViewInvoice = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await getOrderInvoice(orderId);
      const url =
        res?.data?.url ||
        res?.data?.redirectUrl ||
        (res as any)?.url ||
        (res as any)?.redirectUrl;

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Invoice document URL not available.");
      }
      return url;
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to retrieve invoice document.");
    },
  });
};

// ── Invalidate invoices cache ──────────────────────────────────────────────────

export const useInvalidateInvoices = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["invoices"] });
};

// ── Service categorization helpers ─────────────────────────────────────────────

export function isHostingInvoice(invoice: Invoice): boolean {
  const explicitType = (invoice as any).type || (invoice as any).itemType;
  if (explicitType) {
    const t = String(explicitType).toUpperCase();
    if (t === "HOSTING" || t === "PLAN" || t === "SERVER") return true;
    if (t === "DOMAIN" || t === "DOMAIN_REGISTRATION" || t === "DOMAIN_TRANSFER") return false;
  }

  if (Array.isArray((invoice as any).items) && (invoice as any).items.length > 0) {
    if ((invoice as any).items.some((i: any) => i.type === "HOSTING")) return true;
  }

  const desc = (invoice.description || "").toLowerCase();
  if (
    desc.includes("hosting") ||
    desc.includes("cpanel") ||
    desc.includes("vps") ||
    desc.includes("server") ||
    desc.includes("cloud hosting") ||
    desc.includes("shared plan") ||
    desc.includes("wordpress") ||
    desc.includes("plan renewal")
  ) {
    return true;
  }

  return false;
}

export function isDomainInvoice(invoice: Invoice): boolean {
  if (isHostingInvoice(invoice)) return false;

  const explicitType = (invoice as any).type || (invoice as any).itemType;
  if (explicitType) {
    const t = String(explicitType).toUpperCase();
    if (t === "DOMAIN" || t === "DOMAIN_REGISTRATION" || t === "DOMAIN_TRANSFER") return true;
  }

  if (Array.isArray((invoice as any).items) && (invoice as any).items.length > 0) {
    if ((invoice as any).items.some((i: any) => i.type === "DOMAIN" || i.type === "DOMAIN_TRANSFER")) return true;
  }

  const desc = (invoice.description || "").toLowerCase();
  if (
    desc.includes("domain") ||
    desc.includes("registration") ||
    desc.includes("transfer") ||
    /\b[a-z0-9-]+(\.[a-z]{2,})+\b/i.test(desc)
  ) {
    return true;
  }

  return false;
}

export function extractDomainFromInvoice(invoice: Invoice): string | null {
  if ((invoice as any).domainName) return String((invoice as any).domainName).trim().toLowerCase();
  if ((invoice as any).domain) return String((invoice as any).domain).trim().toLowerCase();

  if (Array.isArray((invoice as any).items)) {
    const domainItem = (invoice as any).items.find(
      (i: any) => (i.type === "DOMAIN" || i.type === "DOMAIN_TRANSFER" || i.domainName || i.domain)
    );
    if (domainItem) {
      const name = domainItem.domainName || domainItem.domain;
      if (name) return String(name).trim().toLowerCase();
    }
  }

  const desc = invoice.description || "";
  const words = desc.split(/\s+/);
  for (const word of words) {
    const cleaned = word.replace(/^[("']+|[)"',;:]+$/g, "");
    if (!cleaned.includes("@") && /\b([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/i.test(cleaned)) {
      return cleaned.toLowerCase();
    }
  }

  const match = desc.match(/\b([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/i);
  if (match) return match[0].toLowerCase();

  return null;
}
