import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Minus, Plus, X, MessageCircle, QrCode, Search, ChevronDown, Share, Info, MapPin, Clock, Instagram, Megaphone, History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
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
  onZoom,
  storeId,
}: {
  product: Product;
  themeColor: string;
  themeRgb: string;
  cartItem?: { qty: number };
  onAdd: (p?: Product) => void;
  onUpdateQty: (qty: number) => void;
  onZoom: (url: string) => void;
  storeId: string;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareData = {
      title: product.name,
      text: product.description || `Cek ${product.name} di OpenMenu!`,
      url: window.location.href.split('?')[0] + `?p=${product.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Tautan produk disalin');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          setShowDetail(true);
          trackEvent(storeId, 'product_view', { product_id: product.id });
        }}
        className="group relative flex flex-col rounded-[24px] overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-black/[0.01] cursor-pointer"
      >
        <div className="relative overflow-hidden aspect-square">
          {product.image_url ? (
            <>
              {!imgLoaded && (
                <div 
                  className="absolute inset-0 animate-pulse" 
                  style={{ background: `linear-gradient(135deg, rgba(${themeRgb}, 0.03), rgba(${themeRgb}, 0.08))` }}
                />
              )}
              <img
                src={getOptimizedImage(product.image_url, 400)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <ProductPlaceholder name={product.name} themeColor={themeColor} size="sm" />
          )}

          <div className="absolute top-2.5 left-2.5">
            <span className="text-[9px] font-black px-2 py-1 rounded-lg backdrop-blur-md bg-white/80 text-gray-500 uppercase tracking-widest border border-white/20">
              {product.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col p-3 gap-1.5">
          <h3 className="font-bold text-[13px] text-gray-900 leading-tight line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <span className="font-black text-[13px] text-gray-900">{formatRupiah(product.price)}</span>
            {cartItem ? (
              <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-black/[0.01]">
                <button onClick={() => onUpdateQty(cartItem.qty - 1)} className="w-6 h-6 rounded-md flex items-center justify-center bg-white shadow-sm active:scale-90 transition-transform"><Minus className="w-3 h-3 text-gray-600" /></button>
                <span className="w-4 text-center font-bold text-[11px] text-gray-900">{cartItem.qty}</span>
                <button onClick={() => onAdd()} className="w-6 h-6 rounded-md flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform" style={{ background: themeColor }}><Plus className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => onAdd()} className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform" style={{ background: themeColor }}><Plus className="w-3.5 h-3.5" /></button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Product Detail Bottom Sheet (iOS Style) ────────────────────────── */}
      <AnimatePresence>
        {showDetail && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setShowDetail(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="relative bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>
              <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center pointer-events-none">
                <button onClick={() => setShowDetail(false)} className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-transform pointer-events-auto shadow-lg"><X className="w-5 h-5" /></button>
                <button onClick={() => handleShare()} className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-transform pointer-events-auto shadow-lg"><Share className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto flex-1 pb-32">
                <div 
                  className={cn("w-full aspect-square bg-gray-100 relative", product.image_url && "cursor-zoom-in")}
                  onClick={() => {
                    if (product.image_url) onZoom(product.image_url);
                  }}
                >
                  {product.image_url ? <img src={getOptimizedImage(product.image_url, 600)} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: themeColor }}>🍽</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40" />
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2" style={{ background: `rgba(${themeRgb}, 0.1)`, color: themeColor }}>{product.category}</span>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">{product.name}</h2>
                    <p className="text-xl font-black" style={{ color: themeColor }}>{formatRupiah(product.price)}</p>
                  </div>
                  {product.description && (
                    <div className="space-y-1.5"><h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tentang Menu</h4><p className="text-[15px] text-gray-600 leading-relaxed font-medium">{product.description}</p></div>
                  )}
                  <div className="bg-gray-50 rounded-2xl p-4 flex gap-4 items-center border border-black/[0.02]"><div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Clock className="w-5 h-5 text-gray-400" /></div><div><p className="text-[13px] font-bold text-gray-900">Estimasi Penyajian</p><p className="text-[11px] font-medium text-gray-500">Produk ini disiapkan dalam 5-10 menit.</p></div></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe">
                <div className="flex gap-3">
                  {cartItem ? (
                    <div className="flex-1 flex items-center justify-between bg-gray-100 rounded-[20px] px-2 py-2">
                      <button onClick={() => onUpdateQty(cartItem.qty - 1)} className="w-12 h-12 rounded-[16px] flex items-center justify-center bg-white shadow-sm active:scale-95 transition-transform"><Minus className="w-5 h-5 text-gray-600" /></button>
                      <span className="text-xl font-black text-gray-900">{cartItem.qty}</span>
                      <button onClick={() => onAdd()} className="w-12 h-12 rounded-[16px] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" style={{ background: themeColor }}><Plus className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => onAdd()} className="flex-1 h-14 rounded-[20px] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl" style={{ background: themeColor, boxShadow: `0 12px 24px rgba(${themeRgb}, 0.3)` }}>Tambah ke Pesanan</motion.button>
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 1.08]);

  const { items, addItem, updateQty, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { addOrder, orders: orderHistory } = useOrderStore();
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

      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get('utm_source') || searchParams.get('source');
      const isQR = utmSource === 'qr' || window.location.hash.includes('qr');
      trackEvent(data.id, 'page_view', { referrer: isQR ? 'qr_code' : (utmSource || document.referrer || 'direct') });
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
    
    // Save to local history
    addOrder({
      storeName: store.name,
      storeSlug: store.slug,
      items: waItems,
      totalAmount: totalPrice
    });

    trackEvent(store.id, 'wa_checkout', { total_price: totalPrice, item_count: totalItems });
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
        <div className="text-center"><div className="text-6xl mb-4 opacity-20">🔍</div><h1 className="text-xl font-black text-[#1C1917] mb-2">Toko tidak ditemukan</h1><p className="text-sm text-[#78716C]">URL tidak valid atau toko sudah tidak aktif.</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen antialiased text-[#1C1C1E]" style={{ background: '#F2F2F7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif' }}>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
        <motion.nav initial={{ y: 100 }} animate={{ y: 0 }} className="pointer-events-auto flex items-center gap-2 p-2 rounded-[28px] bg-white/80 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white/40">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={cn("flex items-center justify-center w-14 h-14 rounded-[22px] transition-all active:scale-90", activeCategory === 'Semua' ? "bg-black text-white" : "text-gray-400 hover:bg-black/5")}><QrCode className="w-5 h-5" /></button>
          <button onClick={() => { const searchInput = document.querySelector('input[placeholder*="Search"]'); searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' }); (searchInput as HTMLInputElement)?.focus(); }} className="flex items-center justify-center w-14 h-14 rounded-[22px] text-gray-400 hover:bg-black/5 active:scale-90 transition-all"><Search className="w-5 h-5" /></button>
          <button onClick={() => setCartOpen(true)} className={cn("relative flex items-center justify-center w-14 h-14 rounded-[22px] transition-all active:scale-90", totalItems > 0 ? "text-gray-900" : "text-gray-400")} style={totalItems > 0 ? { background: `rgba(${themeRgb}, 0.1)` } : {}}><ShoppingCart className="w-5 h-5" style={totalItems > 0 ? { color: themeColor } : {}} />{totalItems > 0 && <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="absolute top-2.5 right-2.5 min-w-[18px] h-4.5 bg-[#FF3B30] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5">{totalItems}</motion.span>}</button>
          <button onClick={() => setQrisOpen(true)} className="flex items-center justify-center w-14 h-14 rounded-[22px] text-gray-400 hover:bg-black/5 active:scale-90 transition-all"><QrCode className="w-5 h-5" /></button>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setHistoryOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:bg-black/5 active:scale-90 transition-all"
            >
              <History className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setInfoOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:bg-black/5 active:scale-90 transition-all"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </motion.nav>
      </div>

      <div className="relative pt-6 pb-4 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden"><div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] blur-[120px] rounded-full opacity-40" style={{ background: themeColor }} /><div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[50%] blur-[100px] rounded-full opacity-30" style={{ background: `rgba(${themeRgb}, 0.5)` }} /></div>
        <div className="relative z-10 max-w-lg mx-auto px-6 text-center">
          {store.logo_url && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ scale: heroScale }}><img src={store.logo_url} className="w-24 h-24 rounded-[30px] mx-auto object-cover shadow-[0_20px_40px_rgba(0,0,0,0.12)] border-[3px] border-white mb-5" /></motion.div>}
          <motion.h1 initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[32px] font-black tracking-tight leading-none mb-2">{store.name}</motion.h1>
          {store.description && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[15px] font-medium text-gray-500/80 max-w-[280px] mx-auto leading-snug mb-4">{store.description}</motion.p>}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center gap-1.5"><span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-gray-400 border border-black/[0.03]"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />{products.length} Items</span>{!store.is_active && <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-100">Closed</span>}</motion.div>
        </div>
      </div>

      <div className="sticky top-0 z-30 pt-4 pb-3 bg-[#F2F2F7]/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-5 space-y-4">
          <div className="flex items-center gap-3 bg-black/[0.04] rounded-[18px] px-4 h-12 transition-all border border-black/[0.01]"><Search className="w-4 h-4 text-gray-400" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search our menu..." className="flex-1 text-[14px] font-medium outline-none bg-transparent text-gray-900 placeholder-gray-400" /></div>
          <div className="flex gap-1 p-1 bg-black/[0.04] rounded-[14px] overflow-x-auto scrollbar-hide">
            {categories.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={cn("relative px-4 py-2 rounded-[11px] text-[13px] font-bold transition-all whitespace-nowrap z-10", activeCategory === cat ? "text-gray-900" : "text-gray-400")}>{activeCategory === cat && <motion.div layoutId="active-pill" className="absolute inset-0 bg-white rounded-[11px] shadow-[0_3px_8px_rgba(0,0,0,0.08)] z-[-1]" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />}{cat}</button>))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pb-40">
        {filteredProducts.length === 0 ? (<div className="text-center py-20 opacity-30"><div className="text-5xl mb-4">🍽</div><p className="text-[15px] font-black uppercase tracking-widest">No matching menus</p></div>) : (<div className="grid grid-cols-2 gap-4 mt-4"><AnimatePresence mode="popLayout">{filteredProducts.map(product => { const cartItem = items.find(i => i.product.id === product.id); return (<ProductCard key={product.id} product={product} themeColor={themeColor} themeRgb={themeRgb} cartItem={cartItem} storeId={store.id} onZoom={(url) => setZoomedImage(url)} onAdd={() => { if (!store.is_active) return toast.error('Store is closed.'); addItem(product, storeSlug); trackEvent(store.id, 'add_to_cart', { product_id: product.id }); }} onUpdateQty={(qty) => updateQty(product.id, qty)} />); })}</AnimatePresence></div>)}
      </div>

      <AnimatePresence>{qrisOpen && store?.qris_url && (<div className="fixed inset-0 z-[70] flex items-center justify-center p-6"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQrisOpen(false)} /><motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-xs rounded-[32px] overflow-hidden shadow-2xl p-6"><div className="flex justify-between items-center mb-4"><div><h3 className="font-black text-[#1C1917]">Bayar QRIS</h3><p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Scan Sekarang</p></div><button onClick={() => setQrisOpen(false)} className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center"><X className="w-4 h-4" /></button></div><img src={store.qris_url} className="w-full rounded-2xl border border-black/[0.03]" /></motion.div></div>)}</AnimatePresence>
      <AnimatePresence>{infoOpen && store && (<div className="fixed inset-0 z-[70] flex items-center justify-center p-6"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)} /><motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#FAFAF8] w-full max-w-xs rounded-[32px] shadow-2xl p-6"><button onClick={() => setInfoOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-400"><X className="w-4 h-4" /></button><div className="text-center mb-6">{store.logo_url ? <img src={store.logo_url} className="w-20 h-20 rounded-[24px] mx-auto object-cover mb-3 shadow-ios-md" /> : <div className="w-20 h-20 rounded-[24px] bg-white mx-auto flex items-center justify-center text-3xl font-black mb-3 shadow-ios-sm" style={{ color: themeColor }}>{store.name[0]}</div>}<h2 className="text-xl font-black text-[#1C1917] leading-tight">{store.name}</h2><p className="text-xs text-[#8E8E93] mt-1 font-bold uppercase tracking-widest">Informasi Toko</p></div>              <div className="space-y-4">
                <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><MapPin className="w-4 h-4 text-[#8E8E93]" /></div><div><p className="text-[10px] font-black text-[#8E8E93] uppercase">Lokasi</p><p className="text-sm font-medium text-[#1C1917]">{store.address || 'Alamat belum diatur'}</p></div></div>
                <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><Clock className="w-4 h-4 text-[#8E8E93]" /></div><div><p className="text-[10px] font-black text-[#8E8E93] uppercase">Jam Operasional</p><p className="text-sm font-medium text-[#1C1917]">{store.operating_hours || 'Buka setiap hari'}</p></div></div>
                
                {/* Social Links */}
                {(store.instagram_username || store.tiktok_username) && (
                  <div className="pt-4 mt-4 border-t border-black/[0.03] flex justify-center gap-4">
                    {store.instagram_username && (
                      <a 
                        href={`https://instagram.com/${store.instagram_username}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1C1917] active:scale-90 transition-all"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {store.tiktok_username && (
                      <a 
                        href={`https://tiktok.com/@${store.tiktok_username}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1C1917] active:scale-90 transition-all"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div></motion.div></div>)}</AnimatePresence>

      {/* Cart Sheet */}
      <AnimatePresence>
        {cartOpen && store && (<div className="fixed inset-0 z-[70] flex items-end justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} /><motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 280 }} className="relative bg-white w-full max-w-lg rounded-t-[28px] overflow-hidden" style={{ maxHeight: '80vh' }}><div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" /><div className="px-5 pt-3 pb-3 flex items-center justify-between"><div><h2 className="text-lg font-black text-gray-900">Pesanan Kamu</h2><p className="text-xs text-gray-400">{totalItems} item dari {store.name}</p></div><button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button></div><div className="overflow-y-auto px-5 pb-2 space-y-3" style={{ maxHeight: '45vh' }}>{items.map((item) => (<div key={item.product.id} className="flex items-center gap-3"><div className="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">{item.product.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽</div>}</div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{item.product.name}</p><p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>{formatRupiah(item.product.price)}</p></div><div className="flex items-center gap-2 flex-shrink-0"><button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-7 h-7 rounded-xl border border-gray-200 flex items-center justify-center bg-white"><Minus className="w-3 h-3 text-gray-600" /></button><span className="w-5 text-center text-sm font-black text-gray-900">{item.qty}</span><button onClick={() => addItem(item.product, storeSlug)} className="w-7 h-7 rounded-xl flex items-center justify-center text-white" style={{ background: themeColor }}><Plus className="w-3 h-3" /></button></div></div>))}</div><div className="px-5 pt-4 pb-8 border-t border-gray-50 space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-gray-500 font-medium">Subtotal</span><span className="text-lg font-black text-gray-900">{formatRupiah(totalPrice)}</span></div><button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}><MessageCircle className="w-5 h-5" /> Pesan via WhatsApp</button></div></motion.div></div>)}
      </AnimatePresence>

      {/* ── Order History Modal ── */}
      <AnimatePresence>
        {historyOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHistoryOpen(false)} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="relative bg-[#FAFAF8] w-full max-w-sm rounded-[32px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-black/[0.03] flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h3 className="text-lg font-black text-[#1C1917] tracking-tight">Riwayat Pesanan</h3>
                  <p className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-widest">Tersimpan di perangkat Anda</p>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-400 active:scale-90 transition-transform"><X className="w-4 h-4" /></button>
              </div>

              <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                {orderHistory.length === 0 ? (
                  <div className="py-12 text-center opacity-30">
                    <History className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-bold">Belum ada pesanan</p>
                  </div>
                ) : (
                  orderHistory.map((order) => (
                    <div key={order.id} className="bg-white rounded-[20px] p-4 border border-black/[0.03] shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-full">{order.storeName}</span>
                        <span className="text-[10px] font-medium text-[#A8A29E]">{new Date(order.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600">{item.qty}x {item.name}</span>
                            <span className="text-gray-400">{formatRupiah(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-black/[0.02] flex justify-between items-center">
                        <span className="text-[11px] font-bold text-gray-900">Total Pembayaran</span>
                        <span className="text-sm font-black text-[#1C1917]">{formatRupiah(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Image Zoom Modal ── */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setZoomedImage(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative max-w-full max-h-full overflow-hidden rounded-[24px] shadow-2xl">
              <img src={zoomedImage} className="max-w-full max-h-[85vh] object-contain" />
              <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all">
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
