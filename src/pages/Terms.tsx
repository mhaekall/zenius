import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Store } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-[#78716C] hover:text-[#1C1917] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-amber-600 rounded-[14px] flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1C1917]">Ketentuan Layanan</h1>
              <p className="text-xs text-[#A8A29E]">Terakhir diperbarui: Maret 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6">
            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">1. Pendahuluan</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Selamat datang di OpenMenu. Dengan mengakses dan menggunakan layanan OpenMenu, 
                Anda setuju untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak setuju 
                dengan ketentuan ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">2. Definisi</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                <strong>Layanan</strong> adalah platform OpenMenu yang memungkinkan UMKM untuk 
                membuat katalog digital dan QR Code untuk bisnis mereka.<br /><br />
                <strong>Pengguna</strong> adalah pemilik bisnis yang terdaftar dan menggunakan layanan kami.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">3. Akun dan Registrasi</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Untuk menggunakan layanan kami, Anda harus membuat akun dengan informasi yang benar 
                dan lengkap. Anda bertanggung jawab untuk menjaga kerahasiaan akun dan password Anda. 
                OpenMenu tidak bertanggung jawab atas kerugian yang timbul dari penggunaan akun Anda 
                oleh pihak lain.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">4. Katalog dan Konten</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Anda sepenuhnya bertanggung jawab atas konten yang Anda masukkan ke dalam katalog, 
                termasuk nama produk, deskripsi, harga, dan gambar. Pastikan konten tersebut tidak 
                melanggar hak cipta atau hak kekayaan intelektual pihak lain.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">5. Pembayaran</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                OpenMenu saat ini adalah layanan gratis untuk fitur dasar. Kami berhak mengubah 
                struktur harga di masa depan dengan pemberitahuan terlebih dahulu. Pembayaran untuk 
                fitur premium akan diproses melalui metode pembayaran yang tersedia.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">6. Batasan Tanggung Jawab</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                OpenMenu tidak bertanggung jawab atas kerugian langsung atau tidak langsung yang 
                timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami. Layanan disediakan 
                "sebagaimana adanya" tanpa jaminan apapun.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">7. Perubahan Layanan</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Kami berhak untuk mengubah, menangguhkan, atau menghentikan layanan kami kapan saja 
                dengan atau tanpa pemberitahuan. Kami tidak akan bertanggung jawab atas perubahan 
                tersebut.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">8. Hubungi Kami</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Jika Anda memiliki pertanyaan tentang ketentuan layanan ini, silakan hubungi kami di 
                <a href="mailto:support@openmenu.app" className="text-amber-600 font-medium ml-1">
                  support@openmenu.app
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
