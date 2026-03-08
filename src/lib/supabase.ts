import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Konfigurasi khusus untuk mem-bypass Web Locks API
// Ini mencegah error: "Lock broken by another request with the 'steal' option"
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    lock: async (...args) => {
      // Supabase memiliki signature lock yang bervariasi tergantung versinya.
      // Versi baru: (name: string, acquire: () => Promise<void>)
      // Versi lama: (acquire: () => Promise<void>)
      // Kita cari argumen mana yang bertipe function dan mengeksekusinya.
      const acquire = args.find(arg => typeof arg === 'function');
      if (acquire) {
        return await acquire();
      }
    }
  }
});

export default supabase;
