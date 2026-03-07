import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Eye, MessageCircle, ExternalLink, TrendingUp, Copy, Check, Store, ShoppingCart, QrCode } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card, Badge, Button } from '../../components/ui';
import { cn, formatRupiah } from '../../lib/utils';
import type { Product, AnalyticsSummary } from '../../types';

export default function Overview() {
  const { store } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Array<{ event_type: string; created_at: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    // Fetch recent products
    supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => data && setProducts(data));

    // Fetch analytics events
    supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, [store]);

  const catalogUrl = store ? `${window.location.origin}/c/${store.slug}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------------------------------------------------------
  // Un-setup Store State
  // ---------------------------------------------------------
  if (!store) {
    return (
      <>
        <div className="max-w-md mx-auto mt-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selesaikan Setup Toko</h2>
            <p className="text-gray-500 mb-8">
              Kamu login menggunakan Google, tapi belum mendaftarkan nama toko dan nomor WhatsApp. Yuk lengkapi sekarang agar katalogmu bisa diakses pelanggan!
            </p>
            <Link to="/dashboard/settings">
              <Button size="lg" className="w-full shadow-lg shadow-violet-200">
                Setup Toko Sekarang
              </Button>
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  // ---------------------------------------------------------
  // Analytics Calculations
  // ---------------------------------------------------------
  const today = new Date().toISOString().split('T')[0];
  const totalViews = events.filter((e) => e.event_type === 'page_view').length;
  const totalWa = events.filter((e) => e.event_type === 'wa_checkout').length;
  const totalCart = events.filter((e) => e.event_type === 'add_to_cart').length;
  const todayViews = events.filter((e) => e.event_type === 'page_view' && e.created_at.startsWith(today)).length;

  const bentoItems = [
    { label: 'Total Pengunjung', value: totalViews, icon: Eye, color: 'text-gray-900', bg: 'bg-gray-100' },
    { label: 'Klik WhatsApp', value: totalWa, icon: MessageCircle, color: 'text-gray-900', bg: 'bg-gray-100' },
    { label: 'Hari Ini', value: todayViews, icon: TrendingUp, color: 'text-gray-900', bg: 'bg-gray-100' },
  ];

  const fullStats = [
    ...bentoItems,
    { label: 'Tambah Keranjang', value: totalCart, icon: ShoppingCart, color: 'text-gray-900', bg: 'bg-gray-100' },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    const views = events.filter((e) => e.event_type === 'page_view' && e.created_at.startsWith(key)).length;
    const wa = events.filter((e) => e.event_type === 'wa_checkout' && e.created_at.startsWith(key)).length;
    return { label, views, wa };
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Halo, {store.name}! 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau dan kelola performa tokomu di sini</p>
      </div>

      {/* iOS Style Segmented Control (Tabs) */}
      <div className="bg-gray-100 p-1 rounded-[1.25rem] flex items-center mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-2xl transition-all duration-300",
            activeTab === 'overview' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-2xl transition-all duration-300",
            activeTab === 'analytics' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Analitik
        </button>
      </div>

      {/* Tab Content Area with Animation */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-5 sm:col-span-2 lg:col-span-2 shadow-sm border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Link Katalog Publik</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
                  <span className="text-sm text-gray-700 flex-1 truncate">{catalogUrl}</span>
                  <button onClick={copyLink} className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0">
                    {copied ? <Check className="w-4 h-4 text-gray-900" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-4 mt-4">
                  <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-900 font-medium hover:underline">
                    <ExternalLink className="w-4 h-4" /> Buka Katalog
                  </a>
                  <Link to="/dashboard/qrcode" className="flex items-center gap-1.5 text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors">
                    <QrCode className="w-4 h-4" /> Dapatkan QR
                  </Link>
                </div>
              </Card>

              {bentoItems.map((item, i) => (
                <Card key={item.label} className="p-5 shadow-sm border-gray-100">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
                </Card>
              ))}
            </div>

            {/* Recent Products */}
            <Card className="p-5 shadow-sm border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">Produk Terbaru</h2>
                  <p className="text-xs text-gray-400">Baru ditambahkan</p>
                </div>
                <Link to="/dashboard/products" className="text-xs text-violet-600 font-medium hover:underline bg-violet-50 px-3 py-1.5 rounded-lg">
                  Kelola Semua
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Belum ada produk</p>
                  <Link to="/dashboard/products" className="text-xs text-violet-600 hover:underline">Tambah sekarang →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden shadow-sm border border-gray-100/50">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatRupiah(product.price)}</p>
                        <Badge variant={product.is_available ? 'green' : 'red'}>
                          {product.is_available ? 'Tersedia' : 'Habis'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {fullStats.map((stat) => (
                <Card key={stat.label} className="p-4 shadow-sm border-gray-100">
                  <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{loading ? '...' : stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Chart */}
            <Card className="p-6 shadow-sm border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm mb-6">Tren Pengunjung (7 Hari Terakhir)</h2>
              {loading ? (
                <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="views" fill="#111827" radius={[4, 4, 0, 0]} name="Pengunjung" barSize={32} />
                      <Bar dataKey="wa" fill="#9ca3af" radius={[4, 4, 0, 0]} name="Klik WA" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}