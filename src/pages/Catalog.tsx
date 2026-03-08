import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, X, MessageCircle, Image, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { formatRupiah, buildWhatsAppUrl } from '../lib/utils';
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
        // Combined query: fetch store with its products in one go
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
        
        // Data is already there from the join
        if (storeData.products) {
          const sortedProducts = (storeData.products as Product[]).filter(p => p.is_available).sort((a, b) => a.sort_order - b.sort_order);
          setProducts(sortedProducts);
          const cats = ['Semua', ...new Set(sortedProducts.map((p) => p.category))];
          setCategories(cats);
        }

        // Async: track page view without blocking
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

    // Track wa checkout
    supabase.from('analytics_events').insert({
      store_id: store.id,
      event_type: 'wa_checkout',
    });

    clearCart();
    window.open(url, '_blank');
  };

  const themeColor = store?.theme_color || '#6366f1';
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl bg-violet-500 animate-pulse mx-auto mb-3" />
          <p className="text-sm text-gray-400">Memuat katalog...</p>
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Toko tidak ditemukan</h1>
          <p className="text-sm text-gray-500">URL yang kamu akses tidak valid atau toko sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}05 50%, #f9fafb 100%)`,
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30"
        style={{ background: `${themeColor}15`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: themeColor }}
            >
              {store.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-sm truncate">{store.name}</h1>
            {store.description && (
              <p className="text-xs text-gray-500 truncate">{store.description}</p>
            )}
          </div>
          {store.qris_url && (
            <button
              onClick={() => setQrisOpen(true)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl text-white"
              style={{ background: themeColor }}
            >
              <QrCode className="w-3 h-3" /> QRIS
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="sticky top-[52px] z-20 bg-white/70 backdrop-blur-sm border-b border-white/50">
          <div className="max-w-lg mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={
                  activeCategory === cat
                    ? { background: themeColor, color: 'white' }
                    : { background: 'rgba(255,255,255,0.8)', color: '#6b7280' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🥺</p>
            <p className="text-gray-500 text-sm">Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const cartItem = items.find((i) => i.product.id === product.id);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-xs leading-tight">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
                    )}
                    <p className="font-bold text-xs mt-1" style={{ color: themeColor }}>
                      {formatRupiah(product.price)}
                    </p>

                    {/* Add/Remove buttons */}
                    {cartItem ? (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(product.id, cartItem.qty - 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                          style={{ background: themeColor }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-900 flex-1 text-center">{cartItem.qty}</span>
                        <button
                          onClick={() => addItem(product, storeSlug)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                          style={{ background: themeColor }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          addItem(product, storeSlug);
                          supabase.from('analytics_events').insert({
                            store_id: store.id,
                            event_type: 'add_to_cart',
                            product_id: product.id,
                          });
                        }}
                        className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: themeColor }}
                      >
                        + Tambah
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-lg"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-white font-semibold text-sm transition-transform active:scale-95"
              style={{ background: themeColor }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="flex-1 text-left">{totalItems} item dipilih</span>
              <span className="font-bold">{formatRupiah(totalPrice)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
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
              transition={{ type: 'spring', damping: 30 }}
              className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Keranjang ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs" style={{ color: themeColor }}>{formatRupiah(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => addItem(item.product, storeSlug)}
                        className="w-7 h-7 rounded-lg text-white flex items-center justify-center"
                        style={{ background: themeColor }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-900">{formatRupiah(totalPrice)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm"
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

      {/* QRIS Modal */}
      <AnimatePresence>
        {qrisOpen && store.qris_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setQrisOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-xs text-center"
            >
              <button onClick={() => setQrisOpen(false)} className="absolute top-4 right-4 text-gray-400">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-gray-900 mb-4">Bayar via QRIS</h3>
              <img src={store.qris_url} alt="QRIS" className="w-full rounded-xl" />
              <p className="text-xs text-gray-400 mt-3">Scan menggunakan GoPay, OVO, Dana, atau m-banking</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
