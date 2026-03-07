import { useState } from 'react';
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
  waNumber: z.string().min(8, 'Nomor WhatsApp tidak valid').regex(/^[0-9]+$/, 'Hanya angka'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { setUser, setStore } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const storeName = watch('storeName', '');
  const previewSlug = sanitizeSlug(storeName);

  const onSubmit = async (data: RegisterFormData) => {
    setError('');

    // 1. Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!authData.user) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      return;
    }

    // 2. Create store
    const slug = sanitizeSlug(data.storeName) || `toko-${authData.user.id.slice(0, 6)}`;
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .insert({
        owner_id: authData.user.id,
        slug,
        name: data.storeName,
        wa_number: data.waNumber.startsWith('0')
          ? '62' + data.waNumber.slice(1)
          : data.waNumber,
        theme_color: '#6366f1',
      })
      .select()
      .single();

    if (storeError) {
      setError('Gagal membuat toko. Slug mungkin sudah digunakan, coba ganti nama toko.');
      return;
    }

    setUser(authData.user);
    setStore(storeData);
    setStep('success');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Toko berhasil dibuat! 🎉</h2>
          <p className="text-gray-500 text-sm">Mengarahkan ke dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Zenius</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Buat Katalog Digital</h1>
          <p className="text-sm text-gray-500 mt-1">Gratis & siap dalam 2 menit</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Nama Toko / Bisnis"
                placeholder="contoh: Kafe Kopi Nusantara"
                {...register('storeName')}
                error={errors.storeName?.message}
              />
              {previewSlug && (
                <p className="text-xs text-gray-400 mt-1">
                  URL katalog: <span className="text-violet-600 font-medium">zenius.app/{previewSlug}</span>
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
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Buat Toko Gratis
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-violet-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
