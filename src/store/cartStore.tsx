import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  storeSlug: string | null;
  addItem: (product: Product, storeSlug: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeSlug: null,

      addItem: (product: Product, storeSlug: string) => {
        const { items, storeSlug: currentSlug } = get();

        // Reset cart if switching store
        if (currentSlug && currentSlug !== storeSlug) {
          set({ items: [{ product, qty: 1 }], storeSlug });
          return;
        }

        const existing = items.find((item) => item.product.id === product.id);
        if (existing) {
          set({
            items: items.map((item) =>
              item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ),
            storeSlug,
          });
        } else {
          set({ items: [...items, { product, qty: 1 }], storeSlug });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, qty } : item
          ),
        });
      },

      clearCart: () => set({ items: [], storeSlug: null }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.qty, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    }),
    {
      name: 'zenius-cart',
    }
  )
);
