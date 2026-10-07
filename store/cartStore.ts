import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Discriminated union matching the backend CartItem type ────────────────────

export type CartHostingItem = {
  type: "HOSTING";
  planId: string;
  planName: string;
  price: number; // NGN retail price
  billingCycle: "monthly" | "quarterly" | "yearly";
};

export type CartDomainItem = {
  type: "DOMAIN";
  domainName: string; // e.g. "example"
  extension: string;  // e.g. "com.ng"
  price: number;      // NGN retail price (from backend search)
  currency: string;   // wholesale source currency (informational)
  isPremium: boolean;
};

export type CartSslItem = {
  type: "SSL";
  domainName: string;    // full domain: "example.com.ng"
  price: number;         // NGN retail price
  productId?: number;    // OpenProvider product ID (e.g. 41 for Positive SSL)
  period?: number;       // duration in years
  productName?: string;
  csr?: string;          // optional: backend auto-generates if omitted
  approverEmail?: string; // optional: backend auto-selects if omitted
};

export type CartDomainTransferItem = {
  type: "DOMAIN_TRANSFER";
  domainName: string; // e.g. "example"
  extension: string;  // e.g. "com.ng"
  price: number;      // NGN retail price
  authCode: string;   // the EPP/auth code
};

export type CartItem = CartHostingItem | CartDomainItem | CartSslItem | CartDomainTransferItem;

// Unique key for each item in the cart
function itemKey(item: CartItem): string {
  if (item.type === "HOSTING") return `hosting:${item.planId}:${item.billingCycle}`;
  if (item.type === "DOMAIN")  return `domain:${item.domainName}.${item.extension}`;
  if (item.type === "DOMAIN_TRANSFER") return `domain-transfer:${item.domainName}.${item.extension}`;
  if (item.type === "SSL")     return `ssl:${item.domainName}`;
  return "";
}

type CartStore = {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addHostingItem: (item: CartHostingItem) => void;
  addDomainItem: (item: CartDomainItem) => void;
  addDomainTransferItem: (item: CartDomainTransferItem) => void;
  addSslItem: (item: CartSslItem) => void;
  /** Remove any item by its unique key (planId for HOSTING, full domain for DOMAIN/SSL) */
  removeItem: (key: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Selectors
  hasItem: (key: string) => boolean;
  itemCount: () => number;
  grandTotal: () => number;
  toBackendItems: () => Array<
    | { type: "HOSTING"; planId: string }
    | { type: "DOMAIN"; domainName: string; extension: string }
    | { type: "DOMAIN_TRANSFER"; domainName: string; extension: string; authCode: string }
    | { type: "SSL"; domainName: string; productId?: number; period?: number }
  >;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addHostingItem: (item) =>
        set((state) => {
          // Only one of each plan in the cart
          if (state.items.find((i) => itemKey(i) === itemKey(item))) return state;
          return { items: [...state.items, item], isDrawerOpen: false };
        }),

      addDomainItem: (item) =>
        set((state) => {
          if (state.items.find((i) => itemKey(i) === itemKey(item))) return state;
          return { items: [...state.items, item], isDrawerOpen: false };
        }),

      addDomainTransferItem: (item) =>
        set((state) => {
          if (state.items.find((i) => itemKey(i) === itemKey(item))) return state;
          return { items: [...state.items, item], isDrawerOpen: false };
        }),

      addSslItem: (item) =>
        set((state) => {
          const key = itemKey(item);
          const existingIndex = state.items.findIndex((i) => itemKey(i) === key);
          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = item;
            return { items: updated, isDrawerOpen: false };
          }
          return { items: [...state.items, item], isDrawerOpen: false };
        }),

      removeItem: (key) =>
        set((state) => {
          let filtered = state.items.filter((i) => itemKey(i) !== key);
          if (key.startsWith("domain:")) {
            const domainName = key.substring("domain:".length);
            filtered = filtered.filter(
              (i) => !(i.type === "SSL" && i.domainName === domainName)
            );
          }
          return { items: filtered };
        }),

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

      hasItem: (key) => get().items.some((i) => itemKey(i) === key),

      itemCount: () => get().items.length,

      grandTotal: () => get().items.reduce((sum, i) => sum + i.price, 0),

      toBackendItems: () =>
        get().items.map((item) => {
          if (item.type === "HOSTING")
            return { type: "HOSTING" as const, planId: item.planId, billingCycle: item.billingCycle };
          if (item.type === "DOMAIN")
            return {
              type: "DOMAIN" as const,
              domainName: item.domainName,
              extension: item.extension,
            };
          if (item.type === "DOMAIN_TRANSFER")
            return {
              type: "DOMAIN_TRANSFER" as const,
              domainName: item.domainName,
              extension: item.extension,
              authCode: item.authCode,
            };
          // SSL
          return {
            type: "SSL" as const,
            domainName: item.domainName,
            productId: item.productId || 41,
            period: item.period || 1,
            ...(item.csr ? { csr: item.csr } : {}),
            ...(item.approverEmail ? { approverEmail: item.approverEmail } : {}),
          };
        }),
    }),
    {
      name: "nupat-cart",
      // Sanitize sensitive values: never persist raw transfer authorization codes (EPP keys) in plaintext in localStorage
      partialize: (state) => ({
        items: state.items.map((item) => {
          if (item.type === "DOMAIN_TRANSFER") {
            const { authCode: _authCode, ...rest } = item;
            return { ...rest, authCode: "" };
          }
          return item;
        }),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Keep valid SSL items with a domain name
        state.items = state.items.filter((item) => {
          if (item.type === "SSL") {
            return Boolean(item.domainName);
          }
          return true;
        });
      },
    },
  ),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the display label for a cart item */
export function cartItemLabel(item: CartItem): string {
  if (item.type === "HOSTING") return `${item.planName} Hosting`;
  if (item.type === "DOMAIN")  return `${item.domainName}.${item.extension}`;
  if (item.type === "DOMAIN_TRANSFER") return `${item.domainName}.${item.extension} (Transfer)`;
  if (item.type === "SSL")     return `SSL — ${item.domainName}`;
  return "";
}

/** Unique key helper — exported so other modules can build keys */
export { itemKey as getCartItemKey };
