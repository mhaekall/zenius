import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/ui';
import { sanitizeSlug } from '../lib/utils';

const registerSchema = z.object({
  storeName: z.string().min(2, 'Nama toko minimal 2 karakter'),
  waNumber: z.string()
    .min(8, 'Nomor WhatsApp minimal 8 digit')
    .regex(/^(0|62)?[0-9]{8,12}$/, 'Format nomor tidak valid (contoh: 628xxxxxxxxxx atau 08xxxxxxxxxx)'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { user, store, setUser, setStore, fetchStore } = useAuthStore();
  const navigate = useNavigate();

  // If user is already logged in and has a store, redirect to dashboard
  useEffect(() => {
    if (store) {
      navigate('/dashboard', { replace: true });
    }
  }, [store, navigate]);

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const storeName = watch('storeName', '');
  const previewSlug = sanitizeSlug(storeName);

  const handleGoogleLogin = async () => {
    setError('');
    // Use the current origin for redirect - works for both localhost and production domains
    const redirectTo = user 
      ? `${window.location.origin}/dashboard` 
      : `${window.location.origin}/register`;
    console.log('[Google Register] Redirect URL:', redirectTo);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) {
      console.error('Google OAuth error:', error.message);
      setError('Gagal login dengan Google. Silakan coba lagi.');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');

    // Check if user is already logged in (e.g., via Google OAuth)
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;
    
    let userId = currentUser?.id;

    // If no existing session, create new user
    if (!userId) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Auth signup error:', authError.message);
        setError('Gagal membuat akun. Silakan coba lagi.');
        return;
      }

      if (!authData.user) {
        setError('Terjadi kesalahan. Silakan coba lagi.');
        return;
      }

      userId = authData.user.id;
    }

    // Create store
    const slug = sanitizeSlug(data.storeName) || `toko-${userId.slice(0, 6)}`;
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .insert({
        owner_id: userId,
        slug,
        name: data.storeName,
        wa_number: data.waNumber.startsWith('0')
          ? '62' + data.waNumber.slice(1)
          : data.waNumber,
        theme_color: '#F59E0B',
      })
      .select()
      .single();

    if (storeError) {
      console.error('Store Insert Error:', storeError.message);
      setError('Gagal membuat toko. Silakan coba lagi.');
      return;
    }

    // Manually set store in Zustand
    useAuthStore.getState().setStore(storeData);
    
    // Show success then navigate
    setStep('success');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#34C759] shadow-ios-md">
            <svg className="w-10 h-10 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1C1917] mb-2">Toko berhasil dibuat! 🎉</h2>
          <p className="text-[#78716C] text-sm">Mengarahkan ke dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-[14px] flex items-center justify-center shadow-ios-sm border border-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1C1917] tracking-tight">OpenMenu</span>
          </div>
          <h1 className="text-xl font-bold text-[#1C1917]">Buat Katalog Digital</h1>
          <p className="text-sm text-[#78716C] mt-1">Gratis & siap dalam 2 menit</p>
        </div>

        <div className="bg-[#F5F4F0] rounded-[28px] shadow-ios-md border border-black/[0.06] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Nama Toko / Bisnis"
                placeholder="contoh: Kafe Kopi Nusantara"
                {...register('storeName')}
                error={errors.storeName?.message}
              />
              {previewSlug && (
                <p className="text-xs text-[#A8A29E] mt-1 px-1">
                  URL katalog: <span className="text-[#1C1917] font-medium">openmenu.app/{previewSlug}</span>
                </p>
              )}
            </div>

            <Input
              label="Nomor WhatsApp"
              placeholder="08123456789"
              type="tel"
              {...register('waNumber')}
              error={errors.waNumber?.message}
              hint="Pesanan pelanggan akan masuk ke nomor ini"
            />
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-[#A8A29E] hover:text-[#1C1917] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 bg-red-50 rounded-[14px] px-3 py-2.5 border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={isSubmitting} className="w-full py-4 text-base mt-2 shadow-ios-sm">
              Buat Toko Gratis
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#F5F4F0] text-[#A8A29E] text-xs uppercase tracking-widest font-semibold">Atau</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="secondary" 
              className="w-full gap-2 py-4 shadow-ios-sm border border-black/[0.06] bg-[#FAFAF8] text-[#1C1917]" 
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#78716C] mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#F59E0B] font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}