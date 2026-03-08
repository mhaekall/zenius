import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Regex untuk mendeteksi bot social media (WhatsApp, Facebook, Twitter, Telegram, dll)
const BOT_REGEX = /bot|facebook|whatsapp|telegram|twitter|linkedin|slack|discord|pinterest|skype|line/i;

console.log("Edge Function 'og-proxy' is running!");

serve(async (req) => {
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isBot = BOT_REGEX.test(userAgent);

  // Ambil URL SPA utama Anda (Bisa diset di Environment Variables Supabase)
  const APP_URL = Deno.env.get("APP_URL") || "https://katalog.umkm.id";
  
  // Ambil path setelah hostname (misal: /c/kopi-senja)
  // Menghapus '/functions/v1/og-proxy' jika dipanggil langsung via URL function default
  let path = url.pathname.replace('/functions/v1/og-proxy', '');
  if (path === '') path = '/';

  // Ekstrak slug toko dari pola /c/:slug
  const match = path.match(/^\/c\/([^\/]+)/);
  let storeSlug = null;
  if (match) {
    storeSlug = match[1];
  }

  // Fallback HTML default jika bukan halaman toko
  const defaultHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Zenius - Katalog Digital QR</title>
        <meta property="og:title" content="Zenius - Katalog Digital QR" />
        <meta property="og:description" content="Platform Katalog Digital QR Code Terbaik untuk UMKM" />
        <!-- Jika bukan bot, redirect ke aplikasi SPA utama Anda -->
        <meta http-equiv="refresh" content="0;url=${APP_URL}${path}" />
      </head>
      <body>Mengalihkan...</body>
    </html>
  `;

  if (!isBot || !storeSlug) {
    // Jika bukan bot, kita gunakan HTML dengan meta refresh untuk me-redirect browser pengguna ke SPA Vite Anda
    // Atau jika edge function ini dikonfigurasi sebagai Proxy/Rewrite di Vercel/Netlify, logika ini bisa disesuaikan.
    return new Response(defaultHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Inisialisasi Supabase Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env variables");
    return new Response(defaultHtml, { headers: { "Content-Type": "text/html" } });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Ambil data toko dari database
  const { data: store, error } = await supabase
    .from("stores")
    .select("name, description, logo_url")
    .eq("slug", storeSlug)
    .single();

  if (error || !store) {
    return new Response(defaultHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Buat HTML khusus untuk Bot WhatsApp/FB dengan Meta Tags Dinamis
  const botHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>${store.name} | Katalog Menu</title>
        
        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${APP_URL}${path}" />
        <meta property="og:title" content="${store.name} | Katalog Digital" />
        <meta property="og:description" content="${store.description || `Lihat menu dan pesan langsung dari ${store.name}.`}" />
        <meta property="og:image" content="${store.logo_url || 'https://via.placeholder.com/1200x630.png?text=Tidak+Ada+Logo'}" />
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="${APP_URL}${path}" />
        <meta property="twitter:title" content="${store.name} | Katalog Digital" />
        <meta property="twitter:description" content="${store.description || `Lihat menu dan pesan langsung dari ${store.name}.`}" />
        <meta property="twitter:image" content="${store.logo_url || 'https://via.placeholder.com/1200x630.png?text=Tidak+Ada+Logo'}" />
      </head>
      <body>
        <h1>${store.name}</h1>
        <p>${store.description}</p>
      </body>
    </html>
  `;

  return new Response(botHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
