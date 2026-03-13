import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderRecord {
  id: string;
  storeName: string;
  storeSlug: string;
  items: Array<{ name: string; qty: number; price: number }>;
  totalAmount: number;
  timestamp: string;
}

interface OrderState {
  orders: OrderRecord[];
  addOrder: (order: Omit<OrderRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => {
        const newOrder: OrderRecord = {
          ...order,
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          orders: [newOrder, ...state.orders].slice(0, 50), // Keep last 50 orders
        }));
      },
      clearHistory: () => set({ orders: [] }),
    }),
    {
      name: 'openmenu-orders-history',
    }
  )
);
