import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, MessageCircle, ShoppingCart,
  ExternalLink, Copy, Check,
  QrCode, ArrowRight, Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { cn, formatRupiah } from '../../lib/utils';
import { OverviewSkeleton } from '../../components/ui/Skeleton';
import { ProductPlaceholder } from '../../components/ui/ProductPlaceholder';
import type { Product } from '../../types';

type Period = 'today' | '7d' | '30d';

interface InsightResult {
  emoji: string;
  headline: string;
  subtext: string;
  action?: {
    label: string;
    href: string;
  };
  sentiment: 'positive' | 'neutral' | 'warning' | 'tip';
}

function generateInsight({
  views,
  waClicks,
  totalProducts,
  productsWithoutPhoto,
  period,
  storeSlug,
}: {
  views: number;
  waClicks: number;
  totalProducts: number;
  productsWithoutPhoto: number;
  period: 'today' | '7d' | '30d';
  storeSlug: string;
}): InsightResult {
  const periodLabel = period === 'today' ? 'hari ini' : period === '7d' ? '7 hari ini' : '30 hari ini';
  const convRate = views > 0 ? (waClicks / views) * 100 : 0;

  if (totalProducts === 0) return {
    emoji: '📦',
    headline: 'Tambahkan produk pertamamu',
    subtext: 'Katalog kosong tidak bisa menarik pelanggan.',
    action: { label: 'Tambah Produk', href: '/dashboard/products' },
    sentiment: 'warning'
  };

  if (views === 0) return {
    emoji: '📣',
    headline: 'Belum ada pengunjung',
    subtext: 'Share link katalog ke WhatsApp Group atau Instagram Story kamu.',
    action: { label: 'Salin Link Katalog', href: '/dashboard' },
    sentiment: 'neutral'
  };

  if (views >= 5 && waClicks === 0) return {
    emoji: '🤔',
    headline: 'Pengunjung ada, tapi belum ada yang pesan',
    subtext: productsWithoutPhoto > 0
      ? `${productsWithoutPhoto} produk belum punya foto. Foto menarik = lebih banyak pesanan.`
      : 'Coba cek harga dan deskripsi produkmu — apakah sudah jelas?',
    action: productsWithoutPhoto > 0
      ? { label: 'Lengkapi Foto Produk', href: '/dashboard/products' }
      : { label: 'Edit Produk', href: '/dashboard/products' },
    sentiment: 'warning'
  };

  if (convRate >= 10) return {
    emoji: '🔥',
    headline: `Toko kamu sedang ramai ${periodLabel}!`,
    subtext: `${views} pengunjung, ${waClicks} pesanan masuk. Conversion rate ${convRate.toFixed(1)}% — di atas rata-rata!`,
    sentiment: 'positive'
  };

  if (views >= 10 && convRate < 5) return {
    emoji: '💡',
    headline: `Conversion rate ${convRate.toFixed(1)}% — masih bisa lebih baik`,
    subtext: 'Toko dengan foto produk lengkap rata-rata 3x lebih banyak dapat pesanan.',
    action: productsWithoutPhoto > 0
      ? { label: 'Upload Foto Sekarang', href: '/dashboard/products' }
      : { label: 'Lihat Katalog', href: `/c/${storeSlug}` },
    sentiment: 'tip'
  };

  return {
    emoji: '📈',
    headline: `${views} orang melihat katalogmu ${periodLabel}`,
    subtext: waClicks > 0
      ? `${waClicks} diantaranya memesan via WhatsApp. Terus share katalogmu!`
      : 'Bagikan ke lebih banyak orang untuk meningkatkan pesanan.',
    sentiment: 'neutral'
  };
}

export default function Overview() {
  const { store } = useAuthStore();
  const navigate = useNavigate();
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [allEvents, setAllEvents] = useState<Array<{ event_type: string; created_at: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New States for Insights
  const [period, setPeriod] = useState<Period>('7d');
  const [productsWithoutPhoto, setProductsWithoutPhoto] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (!store) return;

    supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => data && setProducts(data));

    supabase
      .from('products')
      .select('id, image_url')
      .eq('store_id', store.id)
      .then(({ data }) => {
        if (data) {
          setTotalProducts(data.length);
          setProductsWithoutPhoto(data.filter(p => !p.image_url).length);
        }
      });

    supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        setAllEvents(data || []);
        setLoading(false);
      });
  }, [store, navigate]);

  const catalogUrl = store ? `${window.location.origin}/c/${store.slug}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <OverviewSkeleton />;

  if (!store) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 bg-[#F5F4F0] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-ios-md border border-black/[0.06]">
            <Package className="w-10 h-10 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] mb-2">Selesaikan Setup Toko</h2>
          <p className="text-[#78716C] mb-8">
            Kamu login menggunakan Google, tapi belum mendaftarkan nama toko dan nomor WhatsApp. Yuk lengkapi sekarang agar katalogmu bisa diakses pelanggan!
          </p>
          <Link to="/dashboard/settings">
            <Button size="lg" className="w-full shadow-ios-md py-4 text-base">
              Setup Toko Sekarang
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const filterByPeriod = (events: typeof allEvents, p: Period) => {
    const now = new Date();
    const cutoff = new Date();
    if (p === 'today') cutoff.setHours(0, 0, 0, 0);
    if (p === '7d') cutoff.setDate(now.getDate() - 7);
    if (p === '30d') cutoff.setDate(now.getDate() - 30);
    return events.filter(e => new Date(e.created_at) >= cutoff);
  };

  const events = filterByPeriod(allEvents, period);
  const totalViews = events.filter((e) => e.event_type === 'page_view').length;
  const totalWa = events.filter((e) => e.event_type === 'wa_checkout').length;
  const totalCart = events.filter((e) => e.event_type === 'add_to_cart').length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const views = allEvents.filter((e) => e.event_type === 'page_view' && e.created_at.startsWith(key)).length;
    const wa = allEvents.filter((e) => e.event_type === 'wa_checkout' && e.created_at.startsWith(key)).length;
    return { label, views, wa };
  });

  return (
    <>
      {/* 1. PAGE HEADER — compact */}
      <div className="mb-4">
        <h1 className="text-ios-title2 font-bold text-[#1C1917] tracking-tight">
          {store.name}
        </h1>
        <p className="text-ios-caption text-[#A8A29E] mt-0.5">
          {catalogUrl}
        </p>
      </div>

      {/* 2. PERIOD SELECTOR — iOS Segmented Control */}
      <div className="bg-[#EEECEA] p-1 rounded-[14px] flex items-center mb-5">
        {(['today', '7d', '30d'] as Period[]).map((p) => (
          <motion.button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition-colors duration-200 relative',
              period === p ? 'text-[#1C1917]' : 'text-[#A8A29E]'
            )}
          >
            {period === p && (
              <motion.div
                layoutId="period-indicator"
                className="absolute inset-0 bg-[#FAFAF8] rounded-[10px] shadow-ios-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {p === 'today' ? 'Hari Ini' : p === '7d' ? '7 Hari' : '30 Hari'}
            </span>
          </motion.button>
        ))}
      </div>

      {/* 3. INSIGHT CARD — hero, most prominent */}
      {(() => {
        const insight = generateInsight({
          views: totalViews,
          waClicks: totalWa,
          totalProducts,
          productsWithoutPhoto,
          period,
          storeSlug: store.slug,
        });

        const sentimentStyles = {
          positive: 'bg-emerald-50 border-emerald-100',
          warning: 'bg-amber-50 border-amber-100',
          tip: 'bg-blue-50 border-blue-100',
          neutral: 'bg-[#F5F4F0] border-black/[0.06]',
        };

        return (
          <motion.div
            key={`${period}-${totalViews}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'rounded-[18px] border p-4 mb-5',
              sentimentStyles[insight.sentiment]
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{insight.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ios-subhead font-semibold text-[#1C1917] leading-snug">
                  {insight.headline}
                </p>
                <p className="text-ios-caption text-[#78716C] mt-1 leading-relaxed">
                  {insight.subtext}
                </p>
                {insight.action && insight.action.label === 'Salin Link Katalog' ? (
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-amber-600 ios-press"
                  >
                    {copied ? 'Link Tersalin!' : insight.action.label}
                    {!copied && <ArrowRight className="w-3 h-3" />}
                  </button>
                ) : insight.action && (
                  <Link
                    to={insight.action.href}
                    className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-amber-600 ios-press"
                  >
                    {insight.action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* 4. METRICS ROW — 3 chips, secondary to insight */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: 'Pengunjung', value: totalViews, icon: Eye },
          { label: 'Pesanan WA', value: totalWa, icon: MessageCircle },
          { label: 'Keranjang', value: totalCart, icon: ShoppingCart },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#F5F4F0] rounded-[18px] p-3 border border-black/[0.06]"
          >
            <stat.icon className="w-4 h-4 text-[#A8A29E] mb-2" />
            <p className="text-ios-title2 font-bold text-[#1C1917] leading-none">
              {loading ? '—' : stat.value}
            </p>
            <p className="text-[10px] text-[#A8A29E] mt-1 font-medium leading-tight">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* 5. CONVERSION RATE INDICATOR — Apple Health ring style */}
      {totalViews > 0 && (
        <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] p-4 mb-5 flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke="#EEECEA"
                strokeWidth="6"
              />
              <circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - Math.min((totalWa / totalViews), 1))}`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[#1C1917]">
                {((totalWa / totalViews) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-ios-subhead font-semibold text-[#1C1917]">
              Conversion Rate
            </p>
            <p className="text-ios-caption text-[#78716C] mt-0.5">
              {totalWa} dari {totalViews} pengunjung memesan
            </p>
            <p className="text-[10px] text-[#A8A29E] mt-0.5">
              Rata-rata toko bagus: &gt;5%
            </p>
          </div>
        </div>
      )}

      {/* 6. CHART — 7 days always, regardless of period selector */}
      <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] p-4 mb-5">
        <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-widest mb-4">
          Tren 7 Hari Terakhir
        </p>
        {loading ? (
          <div className="h-36 shimmer rounded-[14px]" />
        ) : (
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={last7Days}
                margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#A8A29E', fontFamily: 'Plus Jakarta Sans' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#A8A29E' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }}
                  contentStyle={{
                    borderRadius: '14px',
                    border: 'none',
                    background: '#FAFAF8',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontFamily: 'Plus Jakarta Sans'
                  }}
                />
                <Bar dataKey="views" fill="#1C1917" radius={[6,6,0,0]} name="Pengunjung" barSize={24} />
                <Bar dataKey="wa" fill="#F59E0B" radius={[6,6,0,0]} name="Pesanan WA" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 7. CATALOG LINK — compact, action-focused */}
      <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] p-4 mb-5">
        <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-widest mb-3">
          Link Katalog
        </p>
        <div className="flex items-center gap-2 bg-[#EEECEA] rounded-[14px] px-3 py-2.5">
          <span className="text-xs text-[#78716C] flex-1 truncate font-medium">
            {catalogUrl}
          </span>
          <button
            onClick={copyLink}
            className="text-[#A8A29E] hover:text-[#1C1917] transition-colors flex-shrink-0 ios-press"
          >
            {copied
              ? <Check className="w-4 h-4 text-emerald-500" />
              : <Copy className="w-4 h-4" />
            }
          </button>
        </div>
        <div className="flex gap-4 mt-3">
          <a
            href={catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#1C1917] font-semibold ios-press"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka Katalog
          </a>
          <Link
            to="/dashboard/qrcode"
            className="flex items-center gap-1.5 text-xs text-[#78716C] font-medium ios-press"
          >
            <QrCode className="w-3.5 h-3.5" /> QR Code
          </Link>
        </div>
      </div>

      {/* 8. RECENT PRODUCTS — list style, no card wrapper */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-widest">
            Produk Terbaru
          </p>
          <Link
            to="/dashboard/products"
            className="text-xs text-amber-500 font-semibold ios-press"
          >
            Kelola
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-[#F5F4F0] rounded-[18px] border-2 border-dashed border-[#E8E6E1] p-8 text-center">
            <p className="text-ios-caption text-[#A8A29E]">Belum ada produk</p>
            <Link
              to="/dashboard/products"
              className="text-xs text-amber-500 font-semibold mt-1 block ios-press"
            >
              Tambah sekarang →
            </Link>
          </div>
        ) : (
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] overflow-hidden">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  index < products.length - 1 && 'border-b border-black/[0.04]'
                )}
              >
                <div className="w-10 h-10 rounded-[12px] flex-shrink-0 overflow-hidden bg-[#EEECEA] relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ProductPlaceholder
                      name={product.name}
                      themeColor={store.theme_color || '#F59E0B'}
                      size="sm"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1C1917] truncate">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-[#A8A29E] mt-0.5">
                    {product.category}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-[#1C1917]">
                    {formatRupiah(product.price)}
                  </p>
                  <p className={cn(
                    'text-[10px] mt-0.5 font-medium',
                    product.is_available ? 'text-emerald-500' : 'text-red-400'
                  )}>
                    {product.is_available ? 'Tersedia' : 'Habis'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}