// ==========================================
// Core Types for OpenMenu - QR Catalog SaaS
// ==========================================

export interface Store {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  qris_url: string | null;
  wa_number: string;
  is_active: boolean;
  theme_color: string;
  // New extended fields
  address: string | null;
  city: string | null;
  operating_hours: string | null;
  instagram_username: string | null;
  tiktok_username: string | null;
  announcement: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
  sort_order: number;
  options?: any; // JSONB for variants
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  store_id: string;
  event_type: 'page_view' | 'product_view' | 'add_to_cart' | 'wa_checkout' | 'qris_view';
  product_id: string | null;
  referrer: string | null;
  created_at: string;
}

// Cart types (client-side only)
export interface CartItem {
  product: Product;
  qty: number;
}

// Form types
export interface StoreFormData {
  name: string;
  description: string;
  slug: string;
  wa_number: string;
  theme_color: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
}

// Analytics summary
export interface AnalyticsSummary {
  total_views: number;
  total_wa_clicks: number;
  total_products_viewed: number;
  views_today: number;
}

export interface Order {
  id: string;
  store_id: string;
  customer_name: string | null;
  customer_whatsapp: string | null;
  items_snapshot: any; // JSON representation of items
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  utm_source: string | null;
  created_at: string;
  confirmed_at: string | null;
}
