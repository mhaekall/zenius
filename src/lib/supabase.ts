import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Konfigurasi khusus untuk mem-bypass Web Locks API
// Ini mencegah error: "Lock broken by another request with the 'steal' option"
// yang sering terjadi di SPA saat komponen mount/unmount dengan cepat
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    lock: async (name, acquire) => {
      // Langsung eksekusi callback tanpa Web Locks API bawaan browser
      // yang bermasalah jika ada remount komponen beruntun
      return await acquire();
    }
  }
});

export default supabase;
