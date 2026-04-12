import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setHydrated: (value: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.id === item.id);

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, quantity: entry.quantity + Math.max(1, item.quantity) }
                  : entry
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: Math.max(1, item.quantity) }],
          };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const normalized = Math.floor(quantity);
          if (normalized <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: Math.max(1, normalized) } : item
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "bike-hub-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
