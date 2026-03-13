import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Minus, Plus, X, MessageCircle, QrCode, Search, ChevronDown, Share, Info, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { formatRupiah, buildWhatsAppUrl } from '../lib/utils';
import type { Store, Product } from '../types';

// ─── Analytics helper (Fix #6 dari analisis bug) ─────────────────────────────
const trackEvent = async (storeId: string, eventType: string, extras: Record<string, unknown> = {}) => {
  const { error } = await supabase.from('analytics_events').insert({ store_id: storeId, event_type: eventType, ...extras });
  if (error) console.warn('[Analytics]', eventType, error.message);
};

// ─── Hex → RGB helper untuk dynamic color ────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

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
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              <img
                src={product.image_url}
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
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `rgba(${themeRgb}, 0.06)` }}
            >
              <span style={{ fontSize: 40, opacity: 0.25 }}>🍽</span>
            </div>
          )}

          {/* Category pill */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.85)',
                color: themeColor,
                letterSpacing: '0.04em',
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
            {product.description && (
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="font-black text-sm" style={{ color: themeColor }}>
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
                  onClick={onAdd}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: themeColor }}
                >
                  <Plus className="w-3 h-3" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onAdd}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shadow-sm"
                style={{ background: themeColor }}
              >
                <Plus className="w-3 h-3" /> Tambah
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
                  className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white ios-press"
                >
                  <Share className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowDetail(false)} 
                  className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white ios-press"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar pb-24">
                {product.image_url && (
                  <div className="w-full" style={{ aspectRatio: '16/9' }}>
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
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

                  {/* CUSTOM OPTIONS (HACKER STYLE) */}
                  {product.options && Array.isArray(product.options) && product.options.length > 0 && (
                    <div className="mt-8 space-y-6">
                      {product.options.map((opt: any) => (
                        <div key={opt.name}>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            {opt.name} {opt.required && <span className="text-red-400 text-[9px] bg-red-50 px-1.5 py-0.5 rounded-full uppercase">Wajib</span>}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {opt.values.map((val: string) => (
                              <button
                                key={val}
                                onClick={() => {/* TODO: Implement option selection state */}}
                                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <motion.button whileTap={{ scale: 0.85 }} onClick={onAdd}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                        style={{ background: themeColor }}>
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                                            onClick={() => { 
                        // Encode options into the item name or a new field if useCartStore supports it
                        // For now, let's append to name for simplicity in WA checkout
                        const optionSummary = Object.values(selectedOptions).join(', ');
                        const modifiedProduct = optionSummary 
                          ? { ...product, name: `${product.name} (${optionSummary})` }
                          : product;
                        
                        onAdd(modifiedProduct); 
                        setShowDetail(false); 
                        setSelectedOptions({});
                      }}
                      className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
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

  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 1.08]);

  const { items, addItem, removeItem, updateQty, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const storeSlug = slug || '';

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`*, products (*)`)
        .eq('slug', slug)
        .eq('is_active', true)
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
      trackEvent(data.id, 'page_view', { referrer: document.referrer || null });
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
    trackEvent(store.id, 'wa_checkout');
    clearCart();
    window.open(url, '_blank');
  };

  const themeColor = store?.theme_color || '#6366f1';
  const themeRgb = hexToRgb(themeColor);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f8f6' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-3xl"
          style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}
        />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (notFound || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-black text-gray-900 mb-2">Toko tidak ditemukan</h1>
          <p className="text-sm text-gray-500">URL tidak valid atau toko sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen antialiased selection:bg-black/10" style={{ background: '#F2F2F7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

      {/* ── Sticky Header (muncul saat scroll) ──────────────────────────────── */}
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
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: themeColor }}>
              {store.name[0]}
            </div>
          )}
          <span className="font-black text-sm text-gray-900 flex-1 truncate">{store.name}</span>
          {store.qris_url && (
            <button onClick={() => setQrisOpen(true)}
              className="p-2 rounded-xl"
              style={{ background: `rgba(${themeRgb}, 0.1)` }}>
              <QrCode className="w-4 h-4" style={{ color: themeColor }} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ paddingTop: 0 }}>
        {/* Background layer */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 origin-top"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, rgba(${themeRgb},1) 0%, rgba(${themeRgb},0.75) 60%, rgba(${themeRgb},0.4) 100%)`,
            }}
          />
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
        </motion.div>

        {/* Hero content */}
        <div className="relative max-w-lg mx-auto px-5 pt-14 pb-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              {store.logo_url && (
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  src={store.logo_url}
                  alt={store.name}
                  className="w-24 h-24 rounded-[32px] object-cover border-4 border-white/30 shadow-2xl relative -mt-8 mb-2"
                />
              )}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-3xl font-black text-white leading-none mb-2 tracking-tight"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              >
                {store.name}
              </motion.h1>
              {store.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-white/75 line-clamp-2"
                >
                  {store.description}
                </motion.p>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {store.qris_url && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, type: 'spring' }}
                  onClick={() => setQrisOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <QrCode className="w-3.5 h-3.5" /> QRIS
                </motion.button>
              )}
            </div>
          </div>

          {/* Stats pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs text-white/80"
            style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {products.length} menu tersedia
          </motion.div>
        </div>

        {/* Bottom curve */}
        <div className="relative h-7" style={{ background: '#f7f7f5', borderRadius: '28px 28px 0 0', marginTop: -1 }} />
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#f7f7f5]">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-4 space-y-3">

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari menu..."
                    className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories + search toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileTap={{ scale: 0.94 }}
                  className="flex-shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all"
                  style={activeCategory === cat
                    ? { background: themeColor, color: 'white', boxShadow: `0 4px 12px rgba(${themeRgb},0.35)` }
                    : { background: 'white', color: '#6b7280', border: '1px solid #f0f0f0' }
                  }
                >
                  {cat}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery(''); }}
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: searchOpen ? themeColor : 'white', border: searchOpen ? 'none' : '1px solid #f0f0f0' }}
            >
              <Search className="w-4 h-4" style={{ color: searchOpen ? 'white' : '#6b7280' }} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Products Grid ────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pb-40">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">{searchQuery ? '🔍' : '🥺'}</div>
            <p className="text-sm font-bold text-gray-500">
              {searchQuery ? `Tidak ada menu "${searchQuery}"` : 'Belum ada menu tersedia'}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {activeCategory === 'Semua' ? 'Semua Menu' : activeCategory}
              </p>
              <p className="text-xs text-gray-400">{filteredProducts.length} item</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => {
                  const cartItem = items.find(i => i.product.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      themeColor={themeColor}
                      themeRgb={themeRgb}
                      cartItem={cartItem}
                      storeId={store.id}
                      onAdd={(p) => {
                        addItem(p || product, storeSlug);
                        trackEvent(store.id, 'add_to_cart', { product_id: product.id });
                      }}
                      onUpdateQty={(qty) => updateQty(product.id, qty)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

            {/* ── Bottom Navigation Bar (Cart + Categories) ────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-safe">
        <div className="max-w-lg mx-auto px-4 pb-6 pt-10 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7]/80 to-transparent flex flex-col gap-3">
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="self-end pointer-events-auto">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(true)} className="h-[52px] pl-4 pr-5 rounded-full flex items-center gap-3 shadow-2xl border border-white/20 relative" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}>
                  <div className="relative flex items-center justify-center w-[34px] h-[34px] bg-white/20 rounded-full">
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <motion.div key={totalItems} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm">{totalItems}</motion.div>
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total</span>
                    <span className="text-[14px] font-black text-white tracking-tight">{formatRupiah(totalPrice)}</span>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="pointer-events-auto overflow-hidden rounded-[24px] bg-white/90 backdrop-blur-2xl border border-black/[0.04] shadow-ios-lg p-1.5 flex gap-1">
            <div className="flex overflow-x-auto scrollbar-hide gap-1 w-full relative">
              {categories.map((cat) => (
                <motion.button key={cat} onClick={() => setActiveCategory(cat)} whileTap={{ scale: 0.95 }} className={cn("flex-1 whitespace-nowrap px-4 py-2.5 rounded-[20px] text-[13px] font-bold transition-all duration-300 relative", activeCategory === cat ? "text-white" : "text-gray-500")}>
                  {activeCategory === cat && ( <motion.div layoutId="bottom-nav-indicator" className="absolute inset-0 rounded-[20px] shadow-sm z-0" style={{ background: themeColor }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} /> )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cart Sheet ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 280 }}
              className="relative bg-white w-full max-w-lg rounded-t-[28px] overflow-hidden"
              style={{ maxHeight: '80vh' }}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

              {/* Cart header */}
              <div className="px-5 pt-3 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Pesanan Kamu</h2>
                  <p className="text-xs text-gray-400">{totalItems} item dari {store.name}</p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Items */}
              <div className="overflow-y-auto px-5 pb-2 space-y-3" style={{ maxHeight: '45vh' }}>
                {items.map((item, i) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.product.image_url
                        ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🍽</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-7 h-7 rounded-xl border border-gray-200 flex items-center justify-center bg-white"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </motion.button>
                      <span className="w-5 text-center text-sm font-black text-gray-900">{item.qty}</span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => addItem(item.product, storeSlug)}
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                        style={{ background: themeColor }}
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 pt-4 pb-8 border-t border-gray-50 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                  <span className="text-lg font-black text-gray-900">{formatRupiah(totalPrice)}</span>
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    boxShadow: '0 8px 24px rgba(37,211,102,0.35)',
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Pesan via WhatsApp
                </motion.button>

                <p className="text-center text-xs text-gray-400">
                  Pesanan dikirim ke nomor WA {store.name}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── QRIS Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {qrisOpen && store.qris_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setQrisOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900">Bayar via QRIS</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Scan dengan GoPay, OVO, Dana, atau m-banking</p>
                </div>
                <button onClick={() => setQrisOpen(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              <div className="px-5 pb-5">
                <img src={store.qris_url} alt="QRIS" className="w-full rounded-2xl" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}