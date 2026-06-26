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
  domainName: string; // full domain: "example.com.ng"
  price: number;      // NGN retail price
};

export type CartItem = CartHostingItem | CartDomainItem | CartSslItem;

// Unique key for each item in the cart
function itemKey(item: CartItem): string {
  if (item.type === "HOSTING") return `hosting:${item.planId}:${item.billingCycle}`;
  if (item.type === "DOMAIN")  return `domain:${item.domainName}.${item.extension}`;
  if (item.type === "SSL")     return `ssl:${item.domainName}`;
  return "";
}

type CartStore = {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addHostingItem: (item: CartHostingItem) => void;
  addDomainItem: (item: CartDomainItem) => void;
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
  /** Returns the payload shape the backend expects for POST /orders/initialize */
  toBackendItems: () => Array<
    | { type: "HOSTING"; planId: string }
    | { type: "DOMAIN"; domainName: string; extension: string }
    | { type: "SSL"; domainName: string }
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
          return { items: [...state.items, item], isDrawerOpen: true };
        }),

      addDomainItem: (item) =>
        set((state) => {
          if (state.items.find((i) => itemKey(i) === itemKey(item))) return state;
          return { items: [...state.items, item], isDrawerOpen: true };
        }),

      addSslItem: (item) =>
        set((state) => {
          if (state.items.find((i) => itemKey(i) === itemKey(item))) return state;
          return { items: [...state.items, item], isDrawerOpen: true };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => itemKey(i) !== key),
        })),

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
          // SSL
          return { type: "SSL" as const, domainName: item.domainName };
        }),
    }),
    {
      name: "nupat-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the display label for a cart item */
export function cartItemLabel(item: CartItem): string {
  if (item.type === "HOSTING") return `${item.planName} Hosting`;
  if (item.type === "DOMAIN")  return `${item.domainName}.${item.extension}`;
  if (item.type === "SSL")     return `SSL — ${item.domainName}`;
  return "";
}

/** Unique key helper — exported so other modules can build keys */
export { itemKey as getCartItemKey };
