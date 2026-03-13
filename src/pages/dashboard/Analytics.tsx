import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, MessageCircle, DollarSign, Calendar, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatRupiah, cn } from '../../lib/utils';

export default function Analytics() {
  const { store } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [events, setAllEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!store) return;

    const fetchData = async () => {
      const [eventsRes, productsRes] = await Promise.all([
        supabase.from('analytics_events').select('*').eq('store_id', store.id).order('created_at', { ascending: false }).limit(2000),
        supabase.from('products').select('id, name, price').eq('store_id', store.id)
      ]);

      setAllEvents(eventsRes.data || []);
      setProducts(productsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [store]);

  if (loading) return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  // Data Aggregation
  const avgPrice = products.reduce((acc, p) => acc + Number(p.price), 0) / (products.length || 1);
  
  const getDailyStats = (days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      const dayViews = events.filter(e => e.event_type === 'page_view' && e.created_at.startsWith(key)).length;
      const dayWa = events.filter(e => e.event_type === 'wa_checkout' && e.created_at.startsWith(key)).length;
      const dayRevenue = dayWa * avgPrice;
      return { 
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), 
        views: dayViews, 
        wa: dayWa,
        revenue: dayRevenue 
      };
    });
  };

  const chartData = getDailyStats(14); // 14 days view

  return (
    <div className="pb-10">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/dashboard" className="p-2 -ml-2 text-[#A8A29E] active:text-[#1C1917] transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-black text-[#1C1917] tracking-tight">Analitik Detail</h1>
      </div>

      {/* Revenue Trend Area Chart */}
      <div className="bg-white rounded-[28px] border border-black/[0.04] p-6 shadow-ios-md mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1">Estimasi Pendapatan</p>
            <h2 className="text-2xl font-black text-[#1C1917]">{formatRupiah(chartData.reduce((acc, d) => acc + d.revenue, 0))}</h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                formatter={(val: any) => [formatRupiah(val), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-center text-[#A8A29E] mt-4 font-medium uppercase tracking-tighter">Tren 14 Hari Terakhir</p>
      </div>

      {/* Visitors vs Conversion */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#F5F4F0] rounded-[28px] p-6 border border-black/[0.04]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Users className="w-4 h-4 text-[#1C1917]" />
            </div>
            <h3 className="font-bold text-[#1C1917]">Pengunjung vs Pesanan</h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="views" fill="#1C1917" radius={[4,4,0,0]} barSize={12} />
                <Bar dataKey="wa" fill="#F59E0B" radius={[4,4,0,0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-8 px-4 text-center">
        <p className="text-xs text-[#A8A29E] leading-relaxed">
          Data dikumpulkan secara realtime dari katalog Anda.<br/>
          Gunakan insight ini untuk mengatur strategi promosi.
        </p>
      </div>
    </div>
  );
}