import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Regex untuk mendeteksi bot social media (WhatsApp, Facebook, Twitter, Telegram, dll)
const BOT_REGEX = /bot|facebook|whatsapp|telegram|twitter|linkedin|slack|discord|pinterest|skype|line/i;

console.log("Edge Function 'og-proxy' is running with Product Support!");

serve(async (req) => {
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";
  const isBot = BOT_REGEX.test(userAgent);

  // Ambil URL SPA utama Anda
  const APP_URL = Deno.env.get("APP_URL") || "https://openmenu.app";
  
  // Ambil path setelah hostname
  let path = url.pathname.replace('/functions/v1/og-proxy', '');
  if (path === '') path = '/';

  // Ekstrak slug toko dari pola /c/:slug
  const match = path.match(/^\/c\/([^\/]+)/);
  let storeSlug = null;
  if (match) {
    storeSlug = match[1];
  }

  // Cek parameter produk (p atau product_id)
  const productId = url.searchParams.get('p') || url.searchParams.get('product_id');

  // Fallback HTML default jika bukan halaman toko
  const defaultHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>OpenMenu - Katalog Digital QR</title>
        <meta property="og:title" content="OpenMenu - Katalog Digital QR" />
        <meta property="og:description" content="Platform Katalog Digital QR Code Terbaik untuk UMKM" />
        <meta http-equiv="refresh" content="0;url=${APP_URL}${path}${url.search}" />
      </head>
      <body>Mengalihkan...</body>
    </html>
  `;

  if (!isBot || !storeSlug) {
    return new Response(defaultHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Inisialisasi Supabase Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(defaultHtml, { headers: { "Content-Type": "text/html" } });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Ambil data toko dari database
  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, description, logo_url")
    .eq('slug', storeSlug)
    .single();

  if (error || !store) {
    return new Response(defaultHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  let ogTitle = `${store.name} | Katalog Digital`;
  let ogDesc = store.description || `Lihat menu kami dan pesan langsung via WhatsApp!`;
  let ogImg = store.logo_url;

  // Jika ada ID produk, ambil data produk spesifik
  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("name, description, price, image_url")
      .eq("id", productId)
      .eq("store_id", store.id)
      .single();

    if (product) {
      ogTitle = `${product.name} - ${store.name}`;
      ogDesc = product.description || `Harga: Rp ${product.price.toLocaleString('id-ID')}. Pesan sekarang di OpenMenu!`;
      if (product.image_url) ogImg = product.image_url;
    }
  }

  // Jika tidak ada produk spesifik, coba ambil produk pertama sebagai gambar default
  if (!ogImg) {
    const { data: firstProduct } = await supabase
      .from("products")
      .select("image_url")
      .eq("store_id", store.id)
      .eq("is_available", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    
    ogImg = firstProduct?.image_url || 'https://openmenu.app/og-default.jpg';
  }

  // Buat HTML khusus untuk Bot dengan Meta Tags Dinamis
  const botHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>${ogTitle}</title>
        
        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${APP_URL}${path}${url.search}" />
        <meta property="og:title" content="${ogTitle}" />
        <meta property="og:description" content="${ogDesc}" />
        <meta property="og:image" content="${ogImg}" />
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="${APP_URL}${path}${url.search}" />
        <meta property="twitter:title" content="${ogTitle}" />
        <meta property="twitter:description" content="${ogDesc}" />
        <meta property="twitter:image" content="${ogImg}" />

        <meta http-equiv="refresh" content="0;url=${APP_URL}${path}${url.search}" />
      </head>
      <body>
        <h1>${ogTitle}</h1>
        <p>${ogDesc}</p>
        <img src="${ogImg}" />
      </body>
    </html>
  `;

  return new Response(botHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
