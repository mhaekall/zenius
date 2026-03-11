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
        set({ user: null, store: null, loading: false });
      },

      fetchStore: async (userId: string) => {
        try {
          console.log('[fetchStore] Fetching store for user:', userId);
          
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();
          
          console.log('[fetchStore] Result:', { data, error });
          
          if (error) {
            console.error('[fetchStore] Error:', error.message);
            // Handle 406 error - usually RLS related
            if (error.code === '406') {
              console.error('[fetchStore] 406 Error - Check RLS policies');
            }
            set({ store: null });
            return;
          }
          
          if (data) {
            set({ store: data as Store });
          } else {
            // No store found for this user
            console.log('[fetchStore] No store found for user');
            set({ store: null });
          }
        } catch (err) {
          console.error('[fetchStore] Exception:', err);
          set({ store: null });
        }
      },
    }),
    {
      name: 'openmenu-auth',
      partialize: (state) => ({ user: state.user, store: state.store }),
      onRehydrateStorage: () => (state) => {
        // Jangan set loading=false di sini - biarkan AuthInit yang handle
        // untuk menghindari race condition antara rehydration dan onAuthStateChange
      },
    }
  )
);
