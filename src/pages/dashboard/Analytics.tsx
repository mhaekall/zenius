import { useEffect, useState } from 'react';
import { Eye, MessageCircle, TrendingUp, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui';

export default function Analytics() {
  const { store } = useAuthStore();
  const [events, setEvents] = useState<Array<{ event_type: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;
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

  // Process events for chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    const views = events.filter(
      (e) => e.event_type === 'page_view' && e.created_at.startsWith(key)
    ).length;
    const wa = events.filter(
      (e) => e.event_type === 'wa_checkout' && e.created_at.startsWith(key)
    ).length;
    return { label, views, wa };
  });

  const totalViews = events.filter((e) => e.event_type === 'page_view').length;
  const totalWa = events.filter((e) => e.event_type === 'wa_checkout').length;
  const totalCart = events.filter((e) => e.event_type === 'add_to_cart').length;
  const today = new Date().toISOString().split('T')[0];
  const todayViews = events.filter(
    (e) => e.event_type === 'page_view' && e.created_at.startsWith(today)
  ).length;

  const stats = [
    { label: 'Total Pengunjung', value: totalViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Klik WA Hari Ini', value: todayViews, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Total Klik Pesan', value: totalWa, icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Total Tambah Keranjang', value: totalCart, icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <DashboardLayout activeHref="/dashboard/analytics">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Analitik</h1>
        <p className="text-sm text-gray-500">Performa katalog digital kamu</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Pengunjung 7 Hari Terakhir</h2>
        {loading ? (
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Pengunjung" />
              <Bar dataKey="wa" fill="#10b981" radius={[4, 4, 0, 0]} name="Klik WA" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </DashboardLayout>
  );
}
