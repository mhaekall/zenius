import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ArrowLeft, MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { Button, Input } from '../components/ui';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordData) => {
    setError('');
    
    // In production, you would point this to your actual deployed domain
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo,
    });

    if (resetError) {
      console.error('Password reset error:', resetError.message);
      setError('Gagal mengirim email reset. Pastikan email terdaftar.');
      return;
    }

    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-sm font-semibold text-[#A8A29E] hover:text-[#1C1917] transition-colors ios-press">
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-[14px] flex items-center justify-center shadow-ios-sm border border-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-[#1C1917] tracking-tight">Lupa Password?</h1>
          <p className="text-sm text-[#78716C] mt-2 leading-relaxed">
            Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang sandi Anda.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F5F4F0] rounded-[28px] shadow-ios-md border border-black/[0.06] p-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-4"
              >
                <Input
                  label="Email Terdaftar"
                  type="email"
                  placeholder="nama@email.com"
                  {...register('email')}
                  error={errors.email?.message}
                  autoFocus
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="text-sm text-red-500 bg-red-50 rounded-[14px] px-3 py-2.5 border border-red-100"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" loading={isSubmitting} className="w-full py-4 text-base shadow-ios-sm mt-2">
                  Kirim Link Reset
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                  <MailCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1C1917] mb-2">Cek Email Anda</h3>
                <p className="text-sm text-[#78716C] mb-6">
                  Tautan untuk mengatur ulang kata sandi telah dikirim. Berlaku selama 24 jam.
                </p>
                <p className="text-[11px] text-[#A8A29E]">
                  Tidak menerima email? Cek folder spam atau <button onClick={() => setIsSuccess(false)} className="text-amber-500 font-bold hover:underline">coba lagi</button>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}