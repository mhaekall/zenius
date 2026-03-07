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

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setUser, fetchStore } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError('Email atau password salah. Silakan coba lagi.');
      return;
    }

    if (authData.user) {
      setUser(authData.user);
      await fetchStore(authData.user.id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Zenius</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Selamat datang kembali!</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk ke akun toko kamu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
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
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Belum punya akun?{' '}
          <Link to="/register" className="text-violet-600 font-semibold hover:underline">
            Daftar gratis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
