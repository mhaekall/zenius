import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { Button, Input } from '../components/ui';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we arrived here via a valid password recovery link
    // Supabase sets the hash fragment with access_token and type=recovery
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    // In some edge cases or newer Supabase versions, it might be in query params instead
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc = searchParams.get('error_description');

    if (errorDesc) {
      setError('Tautan reset sandi tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.');
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordData) => {
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password
    });

    if (updateError) {
      console.error('Update password error:', updateError.message);
      setError('Gagal memperbarui sandi. Sesi mungkin sudah kedaluwarsa, silakan minta link reset baru.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-[14px] flex items-center justify-center shadow-ios-sm border border-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-[#1C1917] tracking-tight">Sandi Baru</h1>
          <p className="text-sm text-[#78716C] mt-2 leading-relaxed">
            Buat kata sandi baru yang kuat untuk mengamankan toko Anda.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F5F4F0] rounded-[28px] shadow-ios-md border border-black/[0.06] p-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-4"
              >
                <div className="relative">
                  <Input
                    label="Password Baru"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    {...register('password')}
                    error={errors.password?.message}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-[#A8A29E] hover:text-[#1C1917] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Konfirmasi Password Baru"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password di atas"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />
                </div>

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

                <Button type="submit" loading={isSubmitting} className="w-full py-4 text-base shadow-ios-sm mt-4">
                  Simpan & Masuk
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-[#1C1917] rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
                  <LockKeyhole className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1C1917] mb-2">Sandi Diperbarui!</h3>
                <p className="text-sm text-[#78716C]">
                  Kata sandi berhasil diubah. Mengarahkan Anda ke halaman login...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}