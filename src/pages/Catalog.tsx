import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, X, MessageCircle, QrCode, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { formatRupiah, buildWhatsAppUrl, cn } from '../lib/utils';
import { CatalogSkeleton } from '../components/ui/Skeleton';
import { ProductPlaceholder } from '../components/ui/ProductPlaceholder';
import { ShareButton } from '../components/ui/ShareButton';
import { PoweredBy } from '../components/ui/PoweredBy';
import type { Store, Product } from '../types';

export default function Catalog() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [qrisOpen, setQrisOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { items, addItem, removeItem, updateQty, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const storeSlug = slug || '';

  useEffect(() => {
    if (!slug) return;

    const fetchStoreAndProducts = async () => {
      try {
        const { data: storeData, error } = await supabase
          .from('stores')
          .select(`
            *,
            products (*)
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error || !storeData) {
          setNotFound(true);
          return;
        }

        setStore(storeData as Store);
        
        if (storeData.products) {
          const sortedProducts = (storeData.products as Product[]).filter(p => p.is_available).sort((a, b) => a.sort_order - b.sort_order);
          setProducts(sortedProducts);
          const cats = ['Semua', ...new Set(sortedProducts.map((p) => p.category))];
          setCategories(cats);
        }

        supabase.from('analytics_events').insert({
          store_id: storeData.id,
          event_type: 'page_view',
          referrer: document.referrer || null,
        });
      } catch (err) {
        console.error("Error fetching catalog:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [slug]);

  const filteredProducts =
    activeCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleCheckout = () => {
    if (!store) return;
    const waItems = items.map((item) => ({
      name: item.product.name,
      qty: item.qty,
      price: item.product.price,
    }));
    const url = buildWhatsAppUrl(
      store.wa_number,
      waItems,
      store.name,
      window.location.href
    );

    supabase.from('analytics_events').insert({
      store_id: store.id,
      event_type: 'wa_checkout',
    });

    clearCart();
    window.open(url, '_blank');
  };

  const themeColor = store?.theme_color || '#F59E0B';
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (loading) return <CatalogSkeleton />;

  if (notFound || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center px-4">
          <div className="text-5xl mb-4">🥺</div>
          <h1 className="text-ios-title2 font-bold text-[#1C1917] mb-1">Toko tidak ditemukan</h1>
          <p className="text-ios-callout text-[#78716C]">URL yang kamu akses tidak valid atau toko sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative pb-32"
      style={{
        background: `linear-gradient(135deg, ${themeColor}10 0%, ${themeColor}05 50%, #FAFAF8 100%)`,
      }}
    >
      {/* 1. HEADER — compact, frosted, sticky */}
      <div
        className="sticky top-0 z-30 glass-regular border-b border-black/[0.04]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-lg mx-auto px-4 h-[52px] flex items-center gap-2.5">
          {/* Logo */}
          <div className="flex-shrink-0">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-[34px] h-[34px] rounded-full object-cover ring-2"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
            ) : (
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center 
                           justify-center text-white text-sm font-bold shadow-ios-sm"
                style={{ background: themeColor }}
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Store name */}
          <div className="flex-1 min-w-0">
            <h1 className="text-ios-headline font-bold text-[#1C1917] truncate leading-none">
              {store.name}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ShareButton
              url={window.location.href}
              title={`${store.name} — Katalog Digital`}
              text={`Cek katalog ${store.name}! 🛍️`}
              themeColor={themeColor}
              variant="icon"
            />
            {store.qris_url && (
              <motion.button
                onClick={() => setQrisOpen(true)}
                whileTap={{ scale: 0.92 }}
                transition={{ type:'spring', stiffness:400, damping:30 }}
                className="flex items-center gap-1 text-[11px] font-bold 
                           px-2.5 py-1.5 rounded-full text-white shadow-ios-sm"
                style={{ background: themeColor }}
              >
                <QrCode className="w-3 h-3" />
                QRIS
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS — iOS tab feel */}
      {categories.length > 1 && (
        <div
          className="sticky z-20 bg-[#FAFAF8]/90 backdrop-blur-sm"
          style={{ top: '52px' }}
        >
          <div
            className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)'
            }}
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.94 }}
                transition={{ type:'spring', stiffness:400, damping:30 }}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] 
                           font-semibold transition-colors duration-200 whitespace-nowrap relative"
                style={{
                   color: activeCategory === cat ? 'white' : '#78716C'
                }}
              >
                 {activeCategory === cat && (
                    <motion.div
                      layoutId="active-category"
                      className="absolute inset-0 rounded-full -z-10 shadow-ios-sm"
                      style={{ background: themeColor }}
                      transition={{ type:'spring', stiffness:400, damping:30 }}
                    />
                 )}
                 {!activeCategory || activeCategory !== cat ? (
                     <div className="absolute inset-0 rounded-full -z-10 bg-[#EEECEA]" />
                 ) : null}
                <span className="relative z-10">{cat}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRODUCT GRID — image-first, efficient */}
      <div className="max-w-lg mx-auto px-4 py-3 pb-36">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-2">🥺</p>
            <p className="text-ios-caption text-[#A8A29E]">
              Belum ada produk tersedia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => {
              const cartItem = items.find(i => i.product.id === product.id);
              const delay = Math.min(index * 0.04, 0.3); // Cap delay at 0.3s
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    delay: delay
                  }}
                  className="rounded-[18px] overflow-hidden bg-[#F5F4F0] 
                             border border-black/[0.06] shadow-ios-sm flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-square bg-[#EEECEA] relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ProductPlaceholder
                        name={product.name}
                        themeColor={themeColor}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 flex-1 flex flex-col">
                    <p className="text-[13px] font-semibold text-[#1C1917] 
                                 line-clamp-1 leading-snug flex-1">
                      {product.name}
                    </p>
                    <p className="text-[12px] font-bold mt-0.5 mb-2"
                       style={{ color: themeColor }}>
                      {formatRupiah(product.price)}
                    </p>

                    {/* Cart controls */}
                    <AnimatePresence mode="wait" initial={false}>
                      {cartItem ? (
                        <motion.div
                          key="controls"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type:'spring', stiffness:500, damping:25 }}
                          className="flex items-center justify-between 
                                     bg-[#EEECEA] rounded-full px-1 py-0.5"
                        >
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQty(product.id, cartItem.qty - 1)}
                            className="w-7 h-7 rounded-full flex items-center 
                                       justify-center text-white text-sm font-bold shadow-sm"
                            style={{ background: themeColor }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </motion.button>
                          <span className="text-[13px] font-bold text-[#1C1917] 
                                          min-w-[20px] text-center">
                            {cartItem.qty}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => {
                              addItem(product, storeSlug);
                              if (navigator.vibrate) navigator.vibrate(10);
                              supabase.from('analytics_events').insert({
                                store_id: store.id,
                                event_type: 'add_to_cart',
                                product_id: product.id,
                              });
                            }}
                            className="w-7 h-7 rounded-full flex items-center 
                                       justify-center text-white text-sm font-bold shadow-sm"
                            style={{ background: themeColor }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="add"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type:'spring', stiffness:500, damping:25 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            addItem(product, storeSlug);
                            if (navigator.vibrate) navigator.vibrate(10);
                            supabase.from('analytics_events').insert({
                              store_id: store.id,
                              event_type: 'add_to_cart',
                              product_id: product.id,
                            });
                          }}
                          className="w-full h-[30px] rounded-full text-[11px] 
                                     font-bold text-white shadow-sm border border-white/20"
                          style={{ background: themeColor }}
                        >
                          Tambah
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Powered By */}
      <div className="fixed bottom-3 right-3 z-30">
         <PoweredBy />
      </div>

      {/* 4. CART FAB — Apple Wallet feel */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            transition={{ type:'spring', stiffness:400, damping:30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 
                       w-full max-w-[calc(100%-2rem)] sm:max-w-md px-0"
          >
            <motion.button
              onClick={() => setCartOpen(true)}
              whileTap={{ scale: 0.97 }}
              transition={{ type:'spring', stiffness:400, damping:30 }}
              className="w-full h-14 rounded-[18px] flex items-center px-4 
                         shadow-ios-lg text-white border border-white/20"
              style={{
                background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
              }}
            >
              {/* Left: icon + count */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <ShoppingCart className="w-5 h-5" />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type:'spring', stiffness:500, damping:20 }}
                  className="w-5 h-5 bg-white/25 rounded-full text-[11px] 
                             font-bold flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              </div>

              {/* Center: price */}
              <motion.span
                key={totalPrice}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type:'spring', stiffness:400, damping:30 }}
                className="flex-1 text-center text-[15px] font-bold"
              >
                {formatRupiah(totalPrice)}
              </motion.span>

              {/* Right: chevron */}
              <ChevronRight className="w-5 h-5 opacity-70 flex-shrink-0" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. CART BOTTOM SHEET — iOS native feel */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="relative bg-[#FAFAF8] rounded-t-[28px] w-full max-w-lg max-h-[75vh] flex flex-col shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-[#E8E6E1] rounded-full mx-auto mt-3 mb-1" />
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]">
                <h2 className="font-bold text-[#1C1917] text-lg">Pesanan ({totalItems})</h2>
                <button 
                  onClick={() => setCartOpen(false)} 
                  className="p-2 bg-[#EEECEA] rounded-full text-[#78716C] ios-press"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04] last:border-0">
                    <div className="w-11 h-11 rounded-[12px] bg-[#EEECEA] flex-shrink-0 overflow-hidden relative">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ProductPlaceholder 
                          name={item.product.name}
                          themeColor={themeColor}
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1C1917] truncate">{item.product.name}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: themeColor }}>{formatRupiah(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-7 h-7 rounded-full border border-[#E8E6E1] bg-[#FAFAF8] flex items-center justify-center text-[#1C1917] ios-press shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center text-[#1C1917]">{item.qty}</span>
                      <button
                        onClick={() => addItem(item.product, storeSlug)}
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center ios-press shadow-sm"
                        style={{ background: themeColor }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#FAFAF8] border-t border-black/[0.06] px-4 py-4 pb-safe">
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-[#78716C] font-medium text-sm">Total Pembayaran</span>
                  <span className="font-bold text-[#1C1917] text-ios-subhead">{formatRupiah(totalPrice)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[14px] text-white font-bold text-base shadow-ios-md ios-press"
                  style={{ background: '#25D366' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Pesan via WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. QRIS MODAL — centered sheet */}
      <AnimatePresence>
        {qrisOpen && store.qris_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setQrisOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
              className="relative bg-[#FAFAF8] rounded-[28px] p-5 w-full max-w-xs text-center shadow-ios-lg border border-white/50"
            >
              <button 
                onClick={() => setQrisOpen(false)} 
                className="absolute top-4 right-4 p-1.5 bg-[#EEECEA] rounded-full text-[#78716C] ios-press"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-[#1C1917] mb-4 text-lg">Bayar via QRIS</h3>
              <div className="bg-white p-2 rounded-[18px] shadow-sm border border-[#E8E6E1] mb-3">
                <img src={store.qris_url} alt="QRIS" className="w-full rounded-[14px]" />
              </div>
              <p className="text-ios-caption text-[#A8A29E] mt-2">Scan menggunakan GoPay, OVO, Dana, atau m-banking</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}