import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Minus, Plus, X, MessageCircle, QrCode, Search, ChevronDown, Share, Info, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { formatRupiah, buildWhatsAppUrl, getOptimizedImage, cn } from '../lib/utils';
import type { Store, Product } from '../types';
import toast from 'react-hot-toast';

// ─── Analytics helper ───────────────────────────────────────────────────────
const trackEvent = async (storeId: string, eventType: string, extras: Record<string, unknown> = {}) => {
  const { error } = await supabase.from('analytics_events').insert({ store_id: storeId, event_type: eventType, ...extras });
  if (error) console.warn('[Analytics]', eventType, error.message);
};

// ─── Hex → RGB helper ───────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ─── Product Placeholder ────────────────────────────────────────────────────
function ProductPlaceholder({ name, themeColor, size = 'md' }: { name: string; themeColor: string; size?: 'sm' | 'md' }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ color: themeColor }}>
      <span className={size === 'sm' ? 'text-lg font-bold' : 'text-4xl font-bold'}>{name[0]}</span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  themeColor,
  themeRgb,
  cartItem,
  onAdd,
  onUpdateQty,
  storeId,
}: {
  product: Product;
  themeColor: string;
  themeRgb: string;
  cartItem?: { qty: number };
  onAdd: (p?: Product) => void;
  onUpdateQty: (qty: number) => void;
  storeId: string;
}) {
  const [pressed, setPressed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="relative flex flex-col rounded-[24px] overflow-hidden bg-white border border-black/[0.04]"
        style={{
          boxShadow: pressed
            ? `0 2px 8px rgba(${themeRgb}, 0.15), 0 1px 3px rgba(0,0,0,0.06)`
            : `0 8px 30px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)`,
          transition: 'box-shadow 0.2s ease',
        }}
        onTapStart={() => setPressed(true)}
        onTap={() => setPressed(false)}
        onTapCancel={() => setPressed(false)}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden cursor-pointer"
          style={{ aspectRatio: '4/3' }}
          onClick={() => {
            setShowDetail(true);
            trackEvent(storeId, 'product_view', { product_id: product.id });
          }}
        >
          {product.image_url ? (
            <>
              {!imgLoaded && (
                <div 
                  className="absolute inset-0 animate-pulse" 
                  style={{ background: `linear-gradient(135deg, rgba(${themeRgb}, 0.05), rgba(${themeRgb}, 0.12))` }}
                />
              )}
              <img
                src={getOptimizedImage(product.image_url, 400)}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  transform: 'scale(1.01)',
                }}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <ProductPlaceholder name={product.name} themeColor={themeColor} size="sm" />
          )}

          {/* Category pill */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-md uppercase tracking-wider"
              style={{
                background: 'rgba(255,255,255,0.85)',
                color: themeColor,
              }}
            >
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 gap-2">
          <div className="flex-1">
            <p
              className="font-bold text-gray-900 leading-tight line-clamp-2 cursor-pointer"
              style={{ fontSize: 13 }}
              onClick={() => setShowDetail(true)}
            >
              {product.name}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="font-black text-[13px]" style={{ color: themeColor }}>
              {formatRupiah(product.price)}
            </span>

            {cartItem ? (
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onUpdateQty(cartItem.qty - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: themeColor }}
                >
                  <Minus className="w-3 h-3" />
                </motion.button>
                <span className="w-5 text-center font-black text-sm text-gray-900">{cartItem.qty}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onAdd()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: themeColor }}
                >
                  <Plus className="w-3 h-3" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onAdd()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shadow-sm"
                style={{ background: themeColor }}
              >
                Tambah
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Product Detail Bottom Sheet */}
      <AnimatePresence>
        {showDetail && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setShowDetail(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 280 }}
              className="relative bg-white w-full max-w-lg rounded-t-[28px] overflow-hidden"
              style={{ maxHeight: '85vh' }}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-0" />

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({
                        title: product.name,
                        text: product.description || '',
                        url: window.location.href + '?p=' + product.id
                      });
                    }
                  }}
                  className="p-2 bg-black/10 backdrop-blur-md rounded-full text-[#1C1917] ios-press"
                >
                  <Share className="w-4 h-4" />
                </button>
                <button onClick={() => setShowDetail(false)} className="p-2 bg-black/10 backdrop-blur-md rounded-full text-[#1C1917] ios-press">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pb-24">
                {product.image_url && (
                  <div className="w-full" style={{ aspectRatio: '16/9' }}>
                    <img src={getOptimizedImage(product.image_url, 400)} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-xl font-black text-gray-900 leading-tight flex-1">{product.name}</h2>
                    <span className="text-xl font-black flex-shrink-0" style={{ color: themeColor }}>
                      {formatRupiah(product.price)}
                    </span>
                  </div>

                  <span
                    className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{ background: `rgba(${themeRgb}, 0.1)`, color: themeColor }}
                  >
                    {product.category}
                  </span>

                  {product.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">{product.description}</p>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 pb-safe">
                <div className="flex gap-3">
                  {cartItem ? (
                    <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => onUpdateQty(cartItem.qty - 1)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                        style={{ background: themeColor }}>
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="text-lg font-black text-gray-900">{cartItem.qty}</span>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => onAdd()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                        style={{ background: themeColor }}>
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { onAdd(); setShowDetail(false); }}
                      className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                      style={{ background: themeColor }}
                    >
                      <Plus className="w-4 h-4" /> Tambah ke Pesanan
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Catalog Page ────────────────────────────────────────────────────────
export default function Catalog() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [qrisOpen, setQrisOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 1.08]);

  const { items, addItem, updateQty, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const storeSlug = slug || '';

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`*, products (*)`)
        .eq('slug', slug)
        .single();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      setStore(data as Store);
      if (data.products) {
        const sorted = (data.products as Product[])
          .filter(p => p.is_available)
          .sort((a, b) => a.sort_order - b.sort_order);
        setProducts(sorted);
        setCategories(['Semua', ...new Set(sorted.map(p => p.category))]);
      }

      // Detect Source
      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get('utm_source') || searchParams.get('source');
      const isQR = utmSource === 'qr' || window.location.hash.includes('qr');
      
      trackEvent(data.id, 'page_view', { 
        referrer: isQR ? 'qr_code' : (utmSource || document.referrer || 'direct') 
      });
      
      setLoading(false);
    };
    fetch();
  }, [slug]);

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCheckout = () => {
    if (!store) return;
    const waItems = items.map(i => ({ name: i.product.name, qty: i.qty, price: i.product.price }));
    const url = buildWhatsAppUrl(store.wa_number, waItems, store.name, window.location.href);
    
    // Track event with total price for revenue estimation
    trackEvent(store.id, 'wa_checkout', { 
      total_price: totalPrice,
      item_count: totalItems
    });
    
    clearCart();
    window.open(url, '_blank');
  };

  const themeColor = store?.theme_color || '#6366f1';
  const themeRgb = hexToRgb(themeColor);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="w-12 h-12 rounded-[18px]" style={{ background: themeColor }} />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">🔍</div>
          <h1 className="text-xl font-black text-[#1C1917] mb-2">Toko tidak ditemukan</h1>
          <p className="text-sm text-[#78716C]">URL tidak valid atau toko sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen antialiased" style={{ background: '#F2F2F7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>

      {/* ── Sticky Header (Apple Style) ──────────────────────────────── */}
      <motion.div
        style={{ opacity: headerOpacity }}
        className="fixed top-4 left-4 right-4 z-40 max-w-lg mx-auto"
      >
        <div
          className="h-14 flex items-center gap-3 px-4 rounded-[24px] shadow-lg border border-white/20"
          style={{ background: 'rgba(247,247,245,0.85)', backdropFilter: 'blur(20px)' }}
        >
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="w-7 h-7 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: themeColor }}>{store.name[0]}</div>
          )}
          <span className="font-bold text-sm text-gray-900 flex-1 truncate">{store.name}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setInfoOpen(true)} className="p-2 rounded-xl bg-black/5 text-gray-600 ios-press"><Info className="w-4 h-4" /></button>
            {store.qris_url && (
              <button onClick={() => setQrisOpen(true)} className="p-2 rounded-xl" style={{ background: `rgba(${themeRgb}, 0.1)` }}>
                <QrCode className="w-4 h-4" style={{ color: themeColor }} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 origin-top">
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, rgba(${themeRgb},1) 0%, rgba(${themeRgb},0.75) 60%, rgba(${themeRgb},0.4) 100%)` }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        </motion.div>

        <div className="relative max-w-lg mx-auto px-5 pt-14 pb-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              {store.logo_url && (
                <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={store.logo_url} className="w-20 h-20 rounded-[28px] object-cover border-2 border-white/30 shadow-xl mb-4" />
              )}
              <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-[34px] font-black text-white leading-none tracking-tight mb-2">{store.name}</motion.h1>
              {store.description && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[15px] font-medium text-white/85 line-clamp-2 leading-snug">{store.description}</motion.p>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={() => setInfoOpen(true)} className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white ios-press"><Info className="w-5 h-5" /></motion.button>
              {store.qris_url && (
                <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={() => setQrisOpen(true)} className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white ios-press"><QrCode className="w-5 h-5" /></motion.button>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-bold text-white/80 bg-black/15 backdrop-blur-md uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {products.length} Menu
            </motion.div>
            {!store.is_active && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center px-3 py-2 rounded-full text-[11px] font-bold bg-red-500 text-white uppercase tracking-wider">Toko Tutup</motion.div>
            )}
          </div>
        </div>
        <div className="relative h-7" style={{ background: '#F2F2F7', borderRadius: '28px 28px 0 0', marginTop: -1 }} />
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#F2F2F7]/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 pt-1 pb-3 space-y-3">
          <div className="flex items-center gap-2 bg-white/50 rounded-2xl px-4 py-2.5 border border-black/[0.03] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari menu..." className="flex-1 text-sm outline-none bg-transparent text-[#1C1917] placeholder-gray-400" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("flex-shrink-0 px-4 py-2 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap", activeCategory === cat ? "text-white shadow-lg" : "bg-white text-[#8E8E93] border border-black/[0.03]")} style={activeCategory === cat ? { background: themeColor } : {}}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products Grid ────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pb-40">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 opacity-30"><div className="text-5xl mb-4">🍽</div><p className="text-sm font-bold">Menu tidak ditemukan</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => {
                const cartItem = items.find(i => i.product.id === product.id);
                return (
                  <ProductCard key={product.id} product={product} themeColor={themeColor} themeRgb={themeRgb} cartItem={cartItem} storeId={store.id} 
                    onAdd={() => {
                      if (!store.is_active) return toast.error('Toko sedang tutup.');
                      addItem(product, storeSlug);
                      trackEvent(store.id, 'add_to_cart', { product_id: product.id });
                    }}
                    onUpdateQty={(qty) => updateQty(product.id, qty)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Floating Cart Bar ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {totalItems > 0 && store.is_active && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-8 left-4 right-4 z-40 max-w-lg mx-auto">
            <button onClick={() => setCartOpen(true)} className="w-full flex items-center gap-3 px-5 py-4 rounded-[24px] text-white shadow-2xl relative overflow-hidden active:scale-95 transition-transform" style={{ background: themeColor }}>
              <div className="relative flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                <ShoppingCart className="w-4 h-4 text-white" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black">{totalItems}</span>
              </div>
              <span className="flex-1 text-left text-sm font-bold">Lihat Pesanan</span>
              <span className="text-sm font-black">{formatRupiah(totalPrice)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals (QRIS, Info, Cart) ── */}
      <AnimatePresence>
        {qrisOpen && store.qris_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQrisOpen(false)} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-xs rounded-[32px] overflow-hidden shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4"><div><h3 className="font-black text-[#1C1917]">Bayar QRIS</h3><p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Scan Sekarang</p></div><button onClick={() => setQrisOpen(false)} className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <img src={store.qris_url} className="w-full rounded-2xl border border-black/[0.03]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#FAFAF8] w-full max-w-xs rounded-[32px] shadow-2xl p-6">
              <button onClick={() => setInfoOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-400"><X className="w-4 h-4" /></button>
              <div className="text-center mb-6">
                {store.logo_url ? <img src={store.logo_url} className="w-20 h-20 rounded-[24px] mx-auto object-cover mb-3 shadow-ios-md" /> : <div className="w-20 h-20 rounded-[24px] bg-white mx-auto flex items-center justify-center text-3xl font-black mb-3 shadow-ios-sm" style={{ color: themeColor }}>{store.name[0]}</div>}
                <h2 className="text-xl font-black text-[#1C1917] leading-tight">{store.name}</h2>
                <p className="text-xs text-[#8E8E93] mt-1 font-bold uppercase tracking-widest">Informasi Toko</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><MapPin className="w-4 h-4 text-[#8E8E93]" /></div><div><p className="text-[10px] font-black text-[#8E8E93] uppercase">Lokasi</p><p className="text-sm font-medium text-[#1C1917]">{store.address || 'Alamat belum diatur'}</p></div></div>
                <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><Clock className="w-4 h-4 text-[#8E8E93]" /></div><div><p className="text-[10px] font-black text-[#8E8E93] uppercase">Jam Operasional</p><p className="text-sm font-medium text-[#1C1917]">{store.operating_hours || 'Buka setiap hari'}</p></div></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 280 }} className="relative bg-white w-full max-w-lg rounded-t-[28px] overflow-hidden" style={{ maxHeight: '80vh' }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />
              <div className="px-5 pt-3 pb-3 flex items-center justify-between"><div><h2 className="text-lg font-black text-gray-900">Pesanan Kamu</h2><p className="text-xs text-gray-400">{totalItems} item dari {store.name}</p></div><button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button></div>
              <div className="overflow-y-auto px-5 pb-2 space-y-3" style={{ maxHeight: '45vh' }}>
                {items.map((item, i) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">{item.product.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽</div>}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{item.product.name}</p><p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>{formatRupiah(item.product.price)}</p></div>
                    <div className="flex items-center gap-2 flex-shrink-0"><button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-7 h-7 rounded-xl border border-gray-200 flex items-center justify-center bg-white"><Minus className="w-3 h-3 text-gray-600" /></button><span className="w-5 text-center text-sm font-black text-gray-900">{item.qty}</span><button onClick={() => addItem(item.product, storeSlug)} className="w-7 h-7 rounded-xl flex items-center justify-center text-white" style={{ background: themeColor }}><Plus className="w-3 h-3" /></button></div>
                  </div>
                ))}
              </div>
              <div className="px-5 pt-4 pb-8 border-t border-gray-50 space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500 font-medium">Subtotal</span><span className="text-lg font-black text-gray-900">{formatRupiah(totalPrice)}</span></div>
                <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}><MessageCircle className="w-5 h-5" /> Pesan via WhatsApp</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}