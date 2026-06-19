import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  domain: string;
  price: number;
  currency: string;
  isPremium: boolean;
  addSsl: boolean;
  years: number; // 1-5
};

const SSL_PRICE_USD = 9.99;

type CartStore = {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "addSsl" | "years">) => void;
  removeItem: (domain: string) => void;
  toggleSsl: (domain: string) => void;
  setYears: (domain: string, years: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Selectors
  hasItem: (domain: string) => boolean;
  itemCount: () => number;
  subtotal: () => number;
  sslTotal: () => number;
  grandTotal: () => number;
};

export const SSL_PRICE = SSL_PRICE_USD;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) =>
        set((state) => {
          // Don't add duplicates
          if (state.items.find((i) => i.domain === item.domain)) return state;
          return {
            items: [
              ...state.items,
              { ...item, addSsl: false, years: 1 },
            ],
            isDrawerOpen: true,
          };
        }),

      removeItem: (domain) =>
        set((state) => ({
          items: state.items.filter((i) => i.domain !== domain),
        })),

      toggleSsl: (domain) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.domain === domain ? { ...i, addSsl: !i.addSsl } : i
          ),
        })),

      setYears: (domain, years) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.domain === domain ? { ...i, years: Math.max(1, Math.min(5, years)) } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

      hasItem: (domain) => get().items.some((i) => i.domain === domain),

      itemCount: () => get().items.length,

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.years, 0),

      sslTotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.addSsl ? SSL_PRICE_USD * i.years : 0),
          0
        ),

      grandTotal: () => get().subtotal() + get().sslTotal(),
    }),
    {
      name: "nupat-cart",
      // Only persist items, not UI state (drawer open/closed)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
