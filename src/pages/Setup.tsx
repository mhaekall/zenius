import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, MapPin, Clock, Phone, Palette, ChevronRight, Check, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/ui';
import { sanitizeSlug } from '../lib/utils';

// Extended schema with more fields
const setupSchema = z.object({
  // Required fields
  storeName: z.string().min(2, 'Nama toko minimal 2 karakter'),
  waNumber: z.string()
    .min(8, 'Nomor WhatsApp minimal 8 digit')
    .regex(/^(0|62)?[0-9]{8,12}$/, 'Format nomor tidak valid'),
  
  // Optional fields
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  operatingHours: z.string().optional(),
  themeColor: z.string()
    .optional()
    .refine(
      (val) => !val || /^#[0-9A-Fa-f]{6}$/.test(val),
      'Format warna tidak valid (contoh: #F59E0B)'
    ),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function Setup() {
  const navigate = useNavigate();
  const { user, store, loading: authLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'store' | 'details' | 'success'>('store');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // If user already has a store, redirect to dashboard
  useEffect(() => {
    if (store && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [store, authLoading, navigate]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user && !authLoading && !store) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, store, navigate]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 to-amber-500">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show error if no user available after auth is done
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 to-amber-500">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-red-600 mb-4">Sesi tidak valid. Silakan login ulang.</p>
          <Button onClick={() => navigate('/login')}>Ke Halaman Login</Button>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      themeColor: '#F59E0B',
    }
  });

  const storeName = watch('storeName', '');
  const previewSlug = sanitizeSlug(storeName);

  useEffect(() => {
    if (!previewSlug) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', previewSlug)
        .maybeSingle();
      
      if (!error && data) {
        setSlugStatus('taken');
      } else {
        setSlugStatus('available');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [previewSlug]);

  const onSubmit = async (data: SetupFormData) => {
    if (!user) {
      setError('Sesi tidak valid. Silakan refresh halaman.');
      setIsSubmitting(false);
      return;
    }

    if (slugStatus === 'taken') {
      setError('URL katalog sudah dipakai. Silakan pilih nama toko lain.');
      setIsSubmitting(false);
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      const slug = sanitizeSlug(data.storeName) || `toko-${user.id.slice(0, 6)}`;

      // Create store with extended fields
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          slug,
          name: data.storeName,
          description: data.description || null,
          wa_number: data.waNumber.startsWith('0')
            ? '62' + data.waNumber.slice(1)
            : data.waNumber,
          theme_color: data.themeColor || '#F59E0B',
          is_active: true,
        })
        .select()
        .single();

      if (storeError) {
        console.error('Store creation error details:', storeError);
        // If error is about missing columns, try without them
        if (storeError.message.includes('address') || 
            storeError.message.includes('city') || 
            storeError.message.includes('operating_hours')) {
          // Retry without optional fields
          const { data: retryData, error: retryError } = await supabase
            .from('stores')
            .insert({
              owner_id: user.id,
              slug,
              name: data.storeName,
              description: data.description || null,
              wa_number: data.waNumber.startsWith('0')
                ? '62' + data.waNumber.slice(1)
                : data.waNumber,
              theme_color: data.themeColor || '#F59E0B',
              is_active: true,
            })
            .select()
            .single();
          
          if (retryError) {
            console.error('Retry error:', retryError);
            setError('Gagal membuat toko: ' + retryError.message);
            setIsSubmitting(false);
            return;
          }
          
          useAuthStore.getState().setStore(retryData);
          setStep('success');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }
        setError('Gagal membuat toko: ' + storeError.message);
        setIsSubmitting(false);
        return;
      }

      // Update store in auth store
      useAuthStore.getState().setStore(storeData);
      
      setStep('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Setup error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Toko Berhasil Dibuat!</h2>
          <p className="text-gray-500">Mengalihkan ke dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className={step === 'store' ? 'text-amber-500 font-medium' : 'text-green-500'}>1. Info Toko</span>
            <ChevronRight className="w-4 h-4" />
            <span className={step === 'details' ? 'text-amber-500 font-medium' : ''}>2. Detail (Opsional)</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: step === 'store' ? '50%' : '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-[14px] flex items-center justify-center shadow-ios-sm">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1C1917]">Setup Toko</span>
            </div>
            <p className="text-sm text-gray-500">
              {step === 'store' 
                ? 'Langkah 1: Informasi dasar toko Anda' 
                : 'Langkah 2: Detail tambahan (opsional)'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 'store' ? (
              <>
                {/* Store Name - Required */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nama Toko <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('storeName')}
                    placeholder="Toko Saya"
                    className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {errors.storeName && (
                    <p className="text-xs text-red-500 mt-1">{errors.storeName.message}</p>
                  )}
                  {previewSlug && (
                    <div className="flex items-center justify-between mt-1 px-1">
                      <p className="text-xs text-[#A8A29E]">
                        URL: <span className="text-[#1C1917] font-medium">openmenu.app/{previewSlug}</span>
                      </p>
                      {slugStatus === 'checking' && <span className="text-[10px] text-amber-500 font-bold">Memeriksa...</span>}
                      {slugStatus === 'available' && <span className="text-[10px] text-green-500 font-bold">✓ Tersedia</span>}
                      {slugStatus === 'taken' && <span className="text-[10px] text-red-500 font-bold">✕ Sudah dipakai</span>}
                    </div>
                  )}
                </div>

                {/* WhatsApp - Required */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('waNumber')}
                      placeholder="628xxxxxxxxxx"
                      className="w-full rounded-[14px] border-0 bg-[#EEECEA] pl-10 pr-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  {errors.waNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.waNumber.message}</p>
                  )}
                </div>

                {/* Description - Optional */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Deskripsi Toko
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Deskripsi singkat tentang toko Anda..."
                    rows={3}
                    className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full py-4"
                >
                  Lanjut ke Detail <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                {/* Address - Optional */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Alamat
                  </label>
                  <textarea
                    {...register('address')}
                    placeholder="Jl. Contoh No. 123, Jakarta..."
                    rows={2}
                    className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                {/* City - Optional */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Kota
                  </label>
                  <input
                    {...register('city')}
                    placeholder="Jakarta"
                    className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Operating Hours - Optional */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Jam Buka
                  </label>
                  <input
                    {...register('operatingHours')}
                    placeholder="08:00 - 21:00"
                    className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Theme Color - Optional */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                    <Palette className="w-4 h-4" /> Warna Tema
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...register('themeColor')}
                      className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                    />
                    <input
                      {...register('themeColor')}
                      placeholder="#F59E0B"
                      className="flex-1 rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  {errors.themeColor && (
                    <p className="text-xs text-red-500 mt-1">{errors.themeColor.message}</p>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 rounded-[14px] px-3 py-2.5">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep('store')}
                    className="flex-1"
                  >
                    Kembali
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="flex-1"
                  >
                    Buat Toko
                  </Button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
