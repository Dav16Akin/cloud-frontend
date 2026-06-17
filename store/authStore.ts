import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  token: string | null;
  _hasHydrated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      _hasHydrated: false,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth", // only token is saved to localStorage
      onRehydrateStorage: () => (state) => {
        // Called once localStorage has been read and the store populated.
        state?.setHasHydrated(true);
      },
    }
  )
);
