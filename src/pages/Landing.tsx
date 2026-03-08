import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, QrCode, Smartphone, ArrowRight, Package } from 'lucide-react';
import { Button } from '../components/ui';

const features = [
  { icon: Store, title: 'Buat Toko', desc: 'Daftar gratis dan setup toko dalam 2 menit' },
  { icon: Package, title: 'Upload Produk', desc: 'Tambah foto, harga, dan deskripsi' },
  { icon: QrCode, title: 'Bagikan QR', desc: 'Cetak QR Code dan pelanggan bisa langsung pesan' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1917]">
      {/* 1. Nav */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-amber-600 rounded-[10px] flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1C1917] tracking-tight">OpenMenu</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors font-medium">
              Masuk
            </Link>
            <Link to="/register">
              <Button size="sm" className="shadow-ios-sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero + Mockup */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <span className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 shadow-sm border border-amber-200">
            <Smartphone className="w-3.5 h-3.5" /> Tanpa Download Aplikasi
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1C1917] leading-tight mb-5 tracking-tight">
            Katalog Digital{' '}
            <span className="text-[#F59E0B]">
              Berbasis QR Code
            </span>
          </h1>
          <p className="text-lg text-[#78716C] max-w-xl mx-auto mb-10">
            Pelanggan cukup scan barcode di meja, menu langsung muncul di HP. Pesanan otomatis masuk ke WhatsApp Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2 shadow-ios-md py-4 text-base">
                Mulai Buat Menu <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Warm iOS Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35, delay: 0.1 }}
          className="mt-16 relative max-w-[280px] mx-auto"
        >
          <div className="absolute inset-0 bg-[#F59E0B] opacity-10 blur-3xl rounded-full" />
          <div className="relative bg-[#FAFAF8] rounded-[44px] p-3 shadow-2xl border-4 border-[#E8E6E1]">
            <div className="bg-[#F5F4F0] rounded-[36px] overflow-hidden border border-black/[0.04] h-[500px] flex flex-col relative">
              {/* Fake Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#E8E6E1] rounded-b-xl z-10" />
              
              {/* Mockup Content */}
              <div className="pt-10 px-4 pb-4 flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#F59E0B] rounded-[10px]" />
                  <div>
                    <div className="w-24 h-4 bg-[#E8E6E1] rounded mb-1" />
                    <div className="w-16 h-3 bg-[#E8E6E1] rounded" />
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <div className="w-16 h-6 bg-[#1C1917] rounded-full" />
                  <div className="w-16 h-6 bg-[#EEECEA] rounded-full" />
                  <div className="w-16 h-6 bg-[#EEECEA] rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[14px] p-2 shadow-sm border border-black/[0.04]">
                      <div className="aspect-square bg-[#EEECEA] rounded-[10px] mb-2" />
                      <div className="w-full h-3 bg-[#E8E6E1] rounded mb-1.5" />
                      <div className="w-1/2 h-3 bg-[#F59E0B] opacity-50 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake FAB */}
              <div className="absolute bottom-4 left-4 right-4 h-12 bg-[#1C1917] rounded-full shadow-lg opacity-90" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Steps */}
      <section className="bg-[#F5F4F0] py-20 border-t border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-2">
              Super Simpel
            </h2>
            <p className="text-[#78716C]">Siap jualan dalam 3 langkah mudah</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-[#FAFAF8] rounded-[24px] p-6 shadow-ios-sm border border-black/[0.04]"
              >
                <div className="w-12 h-12 bg-[#FEF3C7] rounded-[14px] flex items-center justify-center mb-5 border border-amber-100">
                  <f.icon className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest mb-2">Langkah {i + 1}</div>
                <h3 className="font-bold text-[#1C1917] text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-[#78716C] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-20 border-t border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-4">
            Tinggalkan Menu Kertas Kusam
          </h2>
          <p className="text-[#78716C] mb-8 text-lg">Bikin toko terlihat lebih profesional dan hemat biaya cetak sekarang juga.</p>
          <Link to="/register">
            <Button size="lg" className="shadow-ios-md py-4 text-base px-8">
              Coba Gratis Selamanya
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-[#EEECEA] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#A8A29E]" />
            <span className="text-sm font-bold text-[#78716C]">OpenMenu</span>
          </div>
          <p className="text-xs text-[#A8A29E]">© 2026 OpenMenu. Didesain dengan hangat untuk UMKM Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}