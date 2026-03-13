import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, QrCode, Smartphone, ArrowRight, Package } from 'lucide-react';
import { Button } from '../components/ui';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1917] flex flex-col">
      {/* 1. Nav (Apple Style - Minimal & Centered Logo) */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-2 justify-center flex-1">
            <div className="w-6 h-6 bg-gradient-to-br from-[#F59E0B] to-amber-600 rounded-[8px] flex items-center justify-center shadow-sm">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[#1C1917] tracking-tight text-sm">OpenMenu</span>
          </div>
          <div className="flex items-center gap-3 justify-end flex-1">
            <Link to="/login" className="text-xs text-[#78716C] hover:text-[#1C1917] transition-colors font-medium hidden sm:block">
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero + Mockup (Merged & Simplified) */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-16 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1C1917] leading-tight mb-4 tracking-tight">
            Katalog Digital. <br />
            <span className="text-[#A8A29E]">Tanpa Aplikasi.</span>
          </h1>
          <p className="text-lg text-[#78716C] max-w-lg mx-auto mb-10 leading-relaxed">
            Buat toko dalam 2 menit. Pelanggan scan QR, pesan langsung via WhatsApp. Sesimpel itu.
          </p>
        </motion.div>

        {/* Minimalist Phone Graphic with embedded CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35, delay: 0.1 }}
          className="mx-auto max-w-[280px]"
        >
          <div className="relative aspect-[9/19] bg-white rounded-[44px] shadow-2xl border-8 border-[#1C1917] overflow-hidden flex flex-col group">
            <div className="absolute top-0 inset-x-0 h-7 bg-[#1C1917] rounded-b-[20px] w-[40%] mx-auto z-10" />
            
            {/* Real Interactive UI Content */}
            <div className="flex-1 bg-[#FAFAF8] flex flex-col relative">
              {/* Cover Image */}
              <div className="h-32 bg-[#1C1917] relative">
                <img 
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600" 
                  alt="Cafe Cover" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF8] to-transparent" />
              </div>

              {/* Profile & Info */}
              <div className="px-4 -mt-10 relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-black/[0.04] p-1.5 mb-2">
                  <div className="w-full h-full bg-[#1C1917] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                </div>
                <h2 className="text-lg font-black text-[#1C1917] leading-tight">Kedai Kopi Senja</h2>
                <p className="text-[10px] text-[#A8A29E] font-medium mt-0.5">Buka • 08:00 - 22:00</p>
              </div>

              {/* Fake Products Grid */}
              <div className="px-4 pt-4 flex-1">
                <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-3">Menu Terlaris</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Product 1 */}
                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-black/[0.02]">
                    <div className="aspect-[4/3] rounded-xl mb-2 overflow-hidden bg-[#EEECEA]">
                      <img src="https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Kopi" />
                    </div>
                    <p className="text-[10px] font-bold text-[#1C1917] leading-tight mb-1 line-clamp-1">Es Kopi Susu Aren</p>
                    <p className="text-[10px] font-black text-amber-600">Rp 18.000</p>
                  </div>
                  
                  {/* Product 2 */}
                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-black/[0.02]">
                    <div className="aspect-[4/3] rounded-xl mb-2 overflow-hidden bg-[#EEECEA]">
                      <img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Kopi" />
                    </div>
                    <p className="text-[10px] font-bold text-[#1C1917] leading-tight mb-1 line-clamp-1">Matcha Latte</p>
                    <p className="text-[10px] font-black text-amber-600">Rp 22.000</p>
                  </div>
                </div>
              </div>

              {/* Real Interactive CTA Button inside Mockup */}
              <div className="mt-auto p-4 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8] to-transparent pt-8">
                <Link to="/register" className="block transform transition-transform active:scale-95 hover:scale-[1.02]">
                  <div className="h-12 bg-[#1C1917] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 gap-2">
                    <span className="text-white font-bold text-[13px]">Buat Katalog Seperti Ini</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </Link>
                <p className="text-[9px] text-[#A8A29E] font-medium uppercase tracking-widest text-center mt-3">
                  Gratis. Tanpa Kartu Kredit.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* 3. Footer (Apple Style Minimalist) */}
      <footer className="border-t border-black/[0.04] py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Store className="w-4 h-4 text-[#1C1917]" />
            <span className="text-xs font-bold text-[#1C1917]">OpenMenu</span>
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="text-xs text-[#A8A29E] hover:text-[#1C1917] transition-colors">Login</Link>
            <a href="mailto:support@openmenu.app" className="text-xs text-[#A8A29E] hover:text-[#1C1917] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}