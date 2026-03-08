import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Store } from '../types';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  store: Store | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setStore: (store: Store | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  fetchStore: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      store: null,
      loading: true,

      setUser: (user) => set({ user }),
      setStore: (store) => set({ store }),
      setLoading: (loading) => set({ loading }),

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, store: null });
      },

      fetchStore: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', userId)
            .single();
          if (!error && data) {
            set({ store: data as Store });
          } else {
             // Pastikan store null jika tidak ditemukan atau error
             set({ store: null });
          }
        } catch (err) {
          console.error("Gagal mengambil data toko:", err);
          set({ store: null });
        }
      },
    }),
    {
      name: 'openmenu-auth',
      partialize: (state) => ({ user: state.user, store: state.store }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, if we have a user cached,
        // set loading false optimistically
        // AuthInit will correct it if session is actually expired
        if (state?.user) {
          state.setLoading(false);
        }
      },
    }
  )
);
