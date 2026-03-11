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
      // Don't expose raw error messages - log for debugging, show generic message
      console.error('Login error:', authError.message);
      setError('Email atau password salah. Silakan coba lagi.');
      return;
    }

    if (authData.session) {
      // Do NOT call setUser or fetchStore here
      // AuthInit onAuthStateChange will handle it automatically
      // Just navigate — ProtectedRoute will wait for loading to resolve
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    // Use the current origin for redirect - works for both localhost and production domains
    const redirectTo = `${window.location.origin}/dashboard`;
    console.log('[Google Login] Redirect URL:', redirectTo);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) {
      console.error('Google login error:', error.message);
      setError('Gagal login dengan Google. Silakan coba lagi.');
    }
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
            <span className="text-xl font-bold text-[#1C1917] tracking-tight">OpenMenu</span>
          </div>
          <h1 className="text-xl font-bold text-[#1C1917]">Selamat datang kembali!</h1>
          <p className="text-sm text-[#78716C] mt-1">Masuk ke akun toko kamu</p>
        </div>

        {/* Card */}
        <div className="bg-[#F5F4F0] rounded-[28px] shadow-ios-md border border-black/[0.06] p-6">
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
              Masuk
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
              Lanjutkan dengan Google
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#78716C] mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-[#F59E0B] font-bold hover:underline">
            Daftar gratis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}