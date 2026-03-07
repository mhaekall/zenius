import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Eye, MessageCircle, ExternalLink, TrendingUp, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui';
import { formatRupiah } from '../../lib/utils';
import type { Product, AnalyticsSummary } from '../../types';

export default function Overview() {
  const { store } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    total_views: 0,
    total_wa_clicks: 0,
    total_products_viewed: 0,
    views_today: 0,
  });
  const [copied, setCopied] = useState(false);

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

    // Fetch analytics
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('store_id', store.id)
      .then(({ data }) => {
        if (!data) return;
        setAnalytics({
          total_views: data.filter((e) => e.event_type === 'page_view').length,
          total_wa_clicks: data.filter((e) => e.event_type === 'wa_checkout').length,
          total_products_viewed: data.filter((e) => e.event_type === 'product_view').length,
          views_today: data.filter(
            (e) => e.event_type === 'page_view' && e.created_at.startsWith(today)
          ).length,
        });
      });
  }, [store]);

  const catalogUrl = store ? `${window.location.origin}/c/${store.slug}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!store) return null;

  const bentoItems = [
    { label: 'Total Pengunjung', value: analytics.total_views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Klik WhatsApp', value: analytics.total_wa_clicks, icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Hari Ini', value: analytics.views_today, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  return (
    <DashboardLayout activeHref="/dashboard">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">👋 Halo, {store.name}!</h1>
        <p className="text-sm text-gray-500 mt-0.5">Berikut ringkasan toko kamu hari ini</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Catalog Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:col-span-2 lg:col-span-2"
        >
          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Link Katalog</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
              <span className="text-sm text-gray-700 flex-1 truncate">{catalogUrl}</span>
              <button
                onClick={copyLink}
                className="text-gray-400 hover:text-violet-600 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={catalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Katalog
              </a>
              <Link
                to="/dashboard/qrcode"
                className="flex items-center gap-1.5 text-xs text-gray-500 font-medium hover:text-violet-600"
              >
                Download QR Code
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        {bentoItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center mb-3`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Products */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Produk Terbaru</h2>
            <p className="text-xs text-gray-400">3 produk terakhir ditambahkan</p>
          </div>
          <Link
            to="/dashboard/products"
            className="text-xs text-violet-600 font-medium hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-3">Belum ada produk</p>
            <Link to="/dashboard/products">
              <button className="text-sm text-violet-600 font-medium hover:underline">
                + Tambah produk pertama
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(product.price)}</p>
                  <Badge variant={product.is_available ? 'green' : 'red'}>
                    {product.is_available ? 'Tersedia' : 'Habis'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
