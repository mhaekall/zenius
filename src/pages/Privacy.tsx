import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Store, Shield, Eye, Lock, Users } from 'lucide-react';

export default function Privacy() {
  const features = [
    { icon: Shield, title: 'Perlindungan Data', desc: 'Data Anda dilindungi dengan standar keamanan tertinggi' },
    { icon: Eye, title: 'Transparansi', desc: 'Kami jelaskan bagaimana data Anda digunakan' },
    { icon: Lock, title: 'Enkripsi', desc: 'Semua data dienkripsi dengan teknologi terkini' },
    { icon: Users, title: 'Kontrol Pengguna', desc: 'Anda memiliki kontrol penuh atas data Anda' },
  ];

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
              <h1 className="text-lg font-bold text-[#1C1917]">Kebijakan Privasi</h1>
              <p className="text-xs text-[#A8A29E]">Terakhir diperbarui: Maret 2026</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-black/[0.04]"
              >
                <item.icon className="w-5 h-5 text-amber-500 mb-2" />
                <h3 className="text-sm font-bold text-[#1C1917]">{item.title}</h3>
                <p className="text-xs text-[#A8A29E] mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama, alamat email, 
                dan informasi bisnis. Kami juga mengumpulkan data penggunaan untuk meningkatkan layanan kami.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">2. Cara Kami Menggunakan Informasi</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Informasi Anda digunakan untuk: предоставления dan peningkatan layanan kami, 
                memproses transaksi, berkomunikasi dengan Anda tentang pembaruan, dan mematuhi kewajiban hukum.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">3. Perlindungan Data</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Kami menerapkan langkah-langkah keamanan teknis dan organisatoris untuk melindungi data Anda, 
                termasuk enkripsi SSL, firewall, dan akses terbatas ke data pribadi.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">4. Berbagi Data</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Kami tidak menjual data pribadi Anda. Data dapat dibagikan dengan penyedia layanan 
                yang membantu operasional kami, siempre dengan kewajiban kerahasiaan.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">5. Hak Anda</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Anda memiliki hak untuk: mengakses data Anda, memperbaiki data yang tidak akurat, 
                meminta penghapusan data, dan menolak pemrosesan data tertentu. Untuk menggunakan hak ini, 
                hubungi kami di support@openmenu.app.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">6. Penyimpanan Data</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Data disimpan di server yang aman dengan standar industri. Kami akan menyimpan data Anda 
                selama akun Anda aktif atau sebagaimana diperlukan untuk предоставления layanan.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">7. Perubahan Kebijakan</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan 
                akan notified melalui email atau pemberitahuan di aplikasi.
              </p>
            </section>

            <section className="bg-white rounded-[20px] p-5 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-bold text-[#1C1917] mb-3">8. Hubungi Kami</h2>
              <p className="text-sm text-[#525252] leading-relaxed">
                Jika ada pertanyaan tentang kebijakan privasi ini, silakan hubungi:
                <br />
                <a href="mailto:support@openmenu.app" className="text-amber-600 font-medium">
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
