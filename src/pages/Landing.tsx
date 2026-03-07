import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Zap, Store, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui';

const features = [
  { icon: Store, title: 'Buat Toko', desc: 'Daftar gratis dan setup toko dalam 2 menit' },
  { icon: Zap, title: 'Upload Produk', desc: 'Tambah foto, harga, dan deskripsi dengan mudah' },
  { icon: QrCode, title: 'Bagikan QR', desc: 'Cetak QR Code dan pelanggan langsung bisa akses' },
];

const benefits = [
  'Tanpa biaya cetak menu fisik',
  'Update produk kapan saja',
  'Pesanan langsung ke WhatsApp',
  'Tampilan modern & estetik',
  'Tanpa download aplikasi',
  'Gratis untuk memulai',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Zenius</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Masuk
            </Link>
            <Link to="/register">
              <Button size="sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Smartphone className="w-3 h-3" /> Khusus untuk UMKM Indonesia
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Katalog Digital{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Berbasis QR Code
            </span>
            <br />untuk Bisnis Kamu
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Buat menu atau katalog digital dalam hitungan menit. Pelanggan cukup scan QR Code — langsung muncul di ponsel, tanpa install aplikasi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Mulai Gratis Sekarang <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg">
                Lihat Demo Katalog
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-violet-100/50 to-transparent rounded-3xl" />
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { name: 'Kopi Susu', price: 'Rp 18.000', color: 'bg-amber-100' },
                { name: 'Matcha Latte', price: 'Rp 22.000', color: 'bg-green-100' },
                { name: 'Es Teh Manis', price: 'Rp 8.000', color: 'bg-blue-100' },
              ].map((item) => (
                <div key={item.name} className="bg-white rounded-2xl p-3 shadow-sm">
                  <div className={`${item.color} rounded-xl h-20 mb-2`} />
                  <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-violet-600 font-bold">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features / Steps */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Mulai dalam 3 Langkah
          </h2>
          <p className="text-gray-500 text-center mb-10">Semua bisa dilakukan tanpa keahlian teknis apapun</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-violet-600" />
                </div>
                <div className="text-xs font-bold text-violet-500 mb-1">Langkah {i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
          Kenapa Pilih Zenius?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-600 to-purple-700 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Siap Buat Katalog Digital Kamu?
          </h2>
          <p className="text-violet-200 mb-8">Gratis selamanya untuk UMKM. Tidak perlu kartu kredit.</p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="font-semibold">
              Daftar Sekarang — Gratis!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg" />
            <span className="text-sm font-semibold text-gray-900">Zenius</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Zenius. Dibuat dengan ❤️ untuk UMKM Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
