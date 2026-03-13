import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Store, MessageCircle, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Support() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    toast.success('Pesan terkirim! Tim kami akan menghubungi Anda segera.');
  };

  const contactMethods = [
    { 
      icon: Mail, 
      title: 'Email', 
      desc: 'support@openmenu.app', 
      action: 'mailto:support@openmenu.app',
      color: 'bg-amber-100 text-amber-600'
    },
    { 
      icon: MessageCircle, 
      title: 'WhatsApp', 
      desc: '+62 812-3456-7890', 
      action: 'https://wa.me/6281234567890',
      color: 'bg-green-100 text-green-600'
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-xl font-bold text-[#1C1917] mb-2">Terima Kasih!</h2>
          <p className="text-sm text-[#78716C] mb-6">Pesan Anda telah terkirim. Tim kami akan menghubungi dalam 24 jam.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', subject: '', message: '' });
            }}
            className="text-amber-600 font-semibold text-sm"
          >
            Kirim pesan lain
          </button>
        </motion.div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1C1917]">Bantuan & Feedback</h1>
            <p className="text-sm text-[#78716C] mt-2">
              Punya pertanyaan atau saran? Tim kami siap membantu!
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-2 gap-3">
            {contactMethods.map((item, i) => (
              <motion.a
                key={i}
                href={item.action}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-black/[0.04] hover:shadow-md transition-shadow flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">{item.title}</h3>
                  <p className="text-xs text-[#A8A29E]">{item.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E8E6E1]" />
            <span className="text-xs text-[#A8A29E] font-medium">ATAU</span>
            <div className="flex-1 h-px bg-[#E8E6E1]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#1C1917] mb-1.5 block">Nama</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nama Anda"
                  className="w-full rounded-[14px] bg-white border border-[#E8E6E1] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1917] mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@anda.com"
                  className="w-full rounded-[14px] bg-white border border-[#E8E6E1] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1C1917] mb-1.5 block">Subjek</label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full rounded-[14px] bg-white border border-[#E8E6E1] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                <option value="">Pilih subjek...</option>
                <option value="bug">Laporan Bug</option>
                <option value="feature">Saran Fitur</option>
                <option value="payment">Masalah Pembayaran</option>
                <option value="account">Masalah Akun</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1C1917] mb-1.5 block">Pesan</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Jelaskan masalah atau saran Anda..."
                className="w-full rounded-[14px] bg-white border border-[#E8E6E1] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#1C1917] text-white font-semibold py-4 rounded-[16px] shadow-lg shadow-black/10 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Kirim Pesan
            </motion.button>
          </form>

          {/* FAQ Preview */}
          <div className="bg-[#F5F4F0] rounded-[20px] p-5">
            <h3 className="font-bold text-[#1C1917] mb-4">Pertanyaan Umum</h3>
            <div className="space-y-3">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm font-medium text-[#1C1917]">Bagaimana cara membuat katalog?</span>
                  <span className="text-[#A8A29E] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-[#78716C] mt-2">
                  Daftar gratis, buat toko, dan tambahkan produk. QR Code akan dibuat otomatis!
                </p>
              </details>
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm font-medium text-[#1C1917]">Apakah OpenMenu gratis?</span>
                  <span className="text-[#A8A29E] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-[#78716C] mt-2">
                  Ya! Fitur dasar sepenuhnya gratis. Kami juga tawarkan fitur premium opsional.
                </p>
              </details>
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm font-medium text-[#1C1917]">Bisakah saya ubah desain katalog?</span>
                  <span className="text-[#A8A29E] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-[#78716C] mt-2">
                  Tentu! Anda bisa ubah warna, logo, dan info toko di menu Pengaturan.
                </p>
              </details>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
