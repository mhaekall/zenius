import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Zap, Crown, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/ui';

export default function Upgrade() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: <Star className="w-5 h-5 text-gray-400" />,
      price: { monthly: 0, yearly: 0 },
      description: 'Mulai jualan online tanpa modal.',
      features: [
        'Maksimal 15 Produk',
        'Katalog link (openmenu.app)',
        'Order via WhatsApp',
        'Tema standar',
        'Watermark Zenius',
      ],
      cta: 'Paket Saat Ini',
      popular: false,
      color: 'gray',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: <Zap className="w-5 h-5 text-amber-500" fill="currentColor" />,
      price: { monthly: 49000, yearly: 39000 },
      originalPrice: { monthly: null, yearly: 49000 },
      description: 'Buka semua batasan, tingkatkan penjualan.',
      features: [
        'Produk Tanpa Batas (Unlimited)',
        'Tanpa Watermark',
        'Terima Pembayaran QRIS / VA',
        'Notifikasi Pesanan Realtime',
        'Kustomisasi Warna Tanpa Batas',
      ],
      cta: 'Mulai 7 Hari Gratis',
      popular: true,
      color: 'amber',
    },
    {
      id: 'promax',
      name: 'Pro Max',
      icon: <Crown className="w-5 h-5 text-white" fill="currentColor" />,
      price: { monthly: 129000, yearly: 99000 },
      description: 'Skala bisnis dengan brand mandiri.',
      features: [
        'Semua fitur Pro',
        'Domain Sendiri (.com / .id)',
        'Kelola 3 Cabang Toko',
        'Export Data Analitik',
        'Prioritas Support (WA 24/7)',
      ],
      cta: 'Pilih Pro Max',
      popular: false,
      color: 'black',
    },
  ];

  return (
    <div className="pb-8">
      {/* Header Section */}
      <div className="text-center px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/50 text-amber-600 text-xs font-bold mb-4 border border-amber-200/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Penawaran Terbatas (Diskon 20%)
          </div>
          <h1 className="text-3xl font-black text-[#1C1917] tracking-tight mb-3 leading-tight">
            Level up toko Anda.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Lebih banyak order.
            </span>
          </h1>
          <p className="text-[#78716C] text-sm max-w-[280px] mx-auto">
            Jangan biarkan batas 15 produk menghentikan omset Anda. Buka potensi penuh sekarang.
          </p>
        </motion.div>

        {/* Toggle Billing */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mt-6"
        >
          <div className="bg-[#EEECEA] p-1 rounded-2xl inline-flex relative border border-black/[0.04]">
            {/* Sliding background */}
            <motion.div
              layoutId="billing-bg"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-black/[0.02]"
              animate={{ left: billingCycle === 'monthly' ? '4px' : '50%' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            />
            
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-6 py-2.5 text-sm font-bold transition-colors rounded-xl ${
                billingCycle === 'monthly' ? 'text-[#1C1917]' : 'text-[#A8A29E] hover:text-[#78716C]'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-6 py-2.5 text-sm font-bold transition-colors rounded-xl flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'text-[#1C1917]' : 'text-[#A8A29E] hover:text-[#78716C]'
              }`}
            >
              Tahunan
              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-black whitespace-nowrap -mt-3 -mr-2 absolute">
                Hemat 20%
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-5 px-4 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + (index * 0.1) }}
            className={`relative rounded-[32px] p-6 flex flex-col ${
              plan.popular
                ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 shadow-[0_8px_30px_rgba(245,158,11,0.15)] scale-100 md:scale-105 z-10'
                : plan.color === 'black'
                ? 'bg-[#1C1917] border border-[#333] shadow-xl text-white'
                : 'bg-white border border-[#E8E6E1] shadow-ios-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap">
                Paling Laris 🔥
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${
                plan.color === 'amber' ? 'bg-amber-100' : plan.color === 'black' ? 'bg-[#333]' : 'bg-gray-100'
              }`}>
                {plan.icon}
              </div>
              <h3 className={`text-xl font-black ${plan.color === 'black' ? 'text-white' : 'text-[#1C1917]'}`}>
                {plan.name}
              </h3>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1 mb-1">
                {plan.price[billingCycle] === 0 ? (
                  <span className={`text-3xl font-black ${plan.color === 'black' ? 'text-white' : 'text-[#1C1917]'}`}>
                    Gratis
                  </span>
                ) : (
                  <>
                    <span className={`text-3xl font-black ${plan.color === 'black' ? 'text-white' : 'text-[#1C1917]'}`}>
                      Rp{plan.price[billingCycle].toLocaleString('id-ID')}
                    </span>
                    <span className={`text-sm mb-1 font-medium ${plan.color === 'black' ? 'text-gray-400' : 'text-[#A8A29E]'}`}>
                      / bln
                    </span>
                  </>
                )}
              </div>
              
              <div className={`text-xs h-4 ${plan.color === 'black' ? 'text-gray-400' : 'text-[#A8A29E]'}`}>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <span className="flex items-center gap-1">
                    Ditagih Rp{(plan.price.yearly * 12).toLocaleString('id-ID')} per tahun
                  </span>
                )}
                {billingCycle === 'monthly' && plan.id === 'pro' && (
                  <span className="line-through">Normal: Rp49.000/bln</span>
                )}
              </div>
            </div>

            <Button
              variant={plan.id === 'free' ? 'secondary' : plan.id === 'pro' ? 'primary' : 'outline'}
              className={`w-full py-4 rounded-[16px] text-sm font-bold shadow-sm mb-8 ${
                plan.id === 'pro' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0' 
                  : plan.id === 'promax'
                  ? 'bg-white text-black hover:bg-gray-100 border-0'
                  : ''
              }`}
              disabled={plan.id === 'free'}
            >
              {plan.cta}
            </Button>

            <div className="space-y-3.5 flex-1">
              <p className={`text-[11px] font-bold uppercase tracking-widest ${plan.color === 'black' ? 'text-gray-500' : 'text-[#A8A29E]'}`}>
                Yang Anda dapatkan:
              </p>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                    plan.color === 'amber' ? 'bg-amber-100 text-amber-600' : plan.color === 'black' ? 'bg-[#333] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                  <span className={`text-sm leading-snug font-medium ${
                    plan.color === 'black' ? 'text-gray-300' : 'text-[#374151]'
                  }`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-12 text-center px-4">
        <p className="text-xs text-[#A8A29E] font-medium mb-4">Metode pembayaran didukung oleh Xendit</p>
        <div className="flex justify-center gap-4 opacity-60 grayscale">
          {/* Dummy placeholders for payment logos */}
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}