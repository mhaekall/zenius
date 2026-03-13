import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Phone, Palette, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';
import { sanitizeSlug } from '../lib/utils';
import toast from 'react-hot-toast';

const setupSchema = z.object({
  storeName: z.string().min(2, 'Nama toko minimal 2 karakter'),
  waNumber: z.string()
    .min(8, 'Nomor WhatsApp minimal 8 digit')
    .regex(/^(0|62)?[0-9]{8,12}$/, 'Format nomor tidak valid'),
  themeColor: z.string().default('#F59E0B'),
});

type SetupFormData = z.infer<typeof setupSchema>;

const COLORS = [
  { id: 'amber', hex: '#F59E0B', name: 'Amber' },
  { id: 'red', hex: '#EF4444', name: 'Ruby' },
  { id: 'blue', hex: '#3B82F6', name: 'Ocean' },
  { id: 'green', hex: '#10B981', name: 'Emerald' },
  { id: 'purple', hex: '#8B5CF6', name: 'Amethyst' },
  { id: 'black', hex: '#1C1917', name: 'Midnight' },
];

export default function Setup() {
  const navigate = useNavigate();
  const { user, store, loading: authLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: { themeColor: '#F59E0B' },
    mode: 'onChange'
  });

  const storeName = watch('storeName', '');
  const waNumber = watch('waNumber', '');
  const themeColor = watch('themeColor');
  const previewSlug = sanitizeSlug(storeName);

  // Auto redirect if already setup
  useEffect(() => {
    if (store && !authLoading) navigate('/dashboard', { replace: true });
    if (!user && !authLoading && !store) navigate('/login', { replace: true });
  }, [store, authLoading, user, navigate]);

  // Realtime slug check
  useEffect(() => {
    if (!previewSlug) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.from('stores').select('id').eq('slug', previewSlug).maybeSingle();
      setSlugStatus(!error && data ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(timer);
  }, [previewSlug]);

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger('storeName');
      if (!isValid) return;
      if (slugStatus === 'checking' || slugStatus === 'taken') {
        if (slugStatus === 'taken') toast.error('URL sudah dipakai, mohon ganti nama toko.');
        return;
      }
      setStep(2);
      return;
    }
    
    if (step === 2) {
      const isValid = await trigger('waNumber');
      if (!isValid) return;
      setStep(3);
      return;
    }

    if (step === 3) {
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: SetupFormData) => {
    if (!user) return toast.error('Sesi tidak valid.');

    setIsSubmitting(true);
    try {
      const slug = sanitizeSlug(data.storeName) || `toko-${user.id.slice(0, 6)}`;
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          slug,
          name: data.storeName,
          wa_number: data.waNumber.startsWith('0') ? '62' + data.waNumber.slice(1) : data.waNumber,
          theme_color: data.themeColor,
          is_active: true,
        })
        .select()
        .single();

      if (storeError) throw storeError;

      useAuthStore.getState().setStore(storeData);
      setStep(4); // Success step
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat toko.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center" />;
  }

  // Apple HIG Spring Animation
  const springTransition = { type: "spring", damping: 24, stiffness: 200 };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Blur based on Theme Color */}
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[140%] h-[60%] blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ background: themeColor, borderRadius: '100%' }}
      />

      {/* Header / Nav */}
      <div className="pt-12 px-6 flex items-center justify-between z-10">
        {step > 1 && step < 4 ? (
          <button 
            onClick={() => setStep(step - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-black/[0.04] text-[#1C1917] transition-transform active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : <div className="w-10" />}

        {/* Progress Dots */}
        {step < 4 && (
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-6 bg-[#1C1917]' : step > i ? 'w-2 bg-[#1C1917]' : 'w-2 bg-[#E8E6E1]'}`}
              />
            ))}
          </div>
        )}
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20 z-10 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
              className="space-y-6"
            >
              <div>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-white rounded-[20px] shadow-ios-md border border-black/[0.04] flex items-center justify-center mb-6"
                >
                  <Store className="w-8 h-8 text-[#1C1917]" />
                </motion.div>
                <h1 className="text-3xl font-black text-[#1C1917] tracking-tight mb-2">Beri nama tokomu.</h1>
                <p className="text-[#78716C]">Ini akan menjadi nama yang dilihat pelanggan dan link katalogmu.</p>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <input
                    {...register('storeName')}
                    placeholder="Misal: Kedai Kopi Makmur"
                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-[#E8E6E1] focus:border-[#1C1917] pb-3 outline-none transition-colors placeholder:text-[#A8A29E]"
                    autoFocus
                  />
                  <div className="h-6 mt-2">
                    {previewSlug && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between px-1">
                        <p className="text-sm text-[#78716C]">openmenu.app/<span className="font-bold text-[#1C1917]">{previewSlug}</span></p>
                        {slugStatus === 'checking' && <span className="text-xs text-amber-500 font-bold">Memeriksa...</span>}
                        {slugStatus === 'available' && <span className="text-xs text-green-500 font-bold">Tersedia</span>}
                        {slugStatus === 'taken' && <span className="text-xs text-red-500 font-bold">Terpakai</span>}
                      </motion.div>
                    )}
                  </div>
                  {errors.storeName && <p className="text-sm text-red-500 mt-1">{errors.storeName.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
              className="space-y-6"
            >
              <div>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-white rounded-[20px] shadow-ios-md border border-black/[0.04] flex items-center justify-center mb-6"
                >
                  <Phone className="w-8 h-8 text-[#1C1917]" />
                </motion.div>
                <h1 className="text-3xl font-black text-[#1C1917] tracking-tight mb-2">Ke mana pesanan dikirim?</h1>
                <p className="text-[#78716C]">Semua order dari pelanggan akan masuk otomatis ke nomor WhatsApp ini.</p>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-3 border-b-2 border-[#E8E6E1] focus-within:border-[#1C1917] pb-3 transition-colors">
                  <span className="text-2xl font-bold text-[#1C1917]">+62</span>
                  <input
                    {...register('waNumber')}
                    placeholder="8123456789"
                    type="tel"
                    className="w-full text-2xl font-bold bg-transparent outline-none placeholder:text-[#A8A29E]"
                    autoFocus
                  />
                </div>
                {errors.waNumber && <p className="text-sm text-red-500 mt-2">{errors.waNumber.message}</p>}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springTransition}
              className="space-y-6"
            >
              <div>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-white rounded-[20px] shadow-ios-md border border-black/[0.04] flex items-center justify-center mb-6 overflow-hidden"
                >
                  <div className="w-full h-full" style={{ background: themeColor }} />
                </motion.div>
                <h1 className="text-3xl font-black text-[#1C1917] tracking-tight mb-2">Pilih warna brandmu.</h1>
                <p className="text-[#78716C]">Warna ini akan menghiasi tombol dan aksen di katalog publikmu.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setValue('themeColor', color.hex)}
                    className={`aspect-square rounded-[24px] flex items-center justify-center transition-all ${themeColor === color.hex ? 'scale-95 shadow-ios-md ring-4 ring-offset-2 ring-[#1C1917]/10' : 'hover:scale-105 shadow-sm border border-black/[0.04]'}`}
                    style={{ background: color.hex }}
                  >
                    {themeColor === color.hex && <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springTransition}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20 mb-8">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-black text-[#1C1917] tracking-tight">Katalog Siap!</h1>
              <p className="text-[#78716C]">Mengarahkan ke dashboard untuk menambah produk pertamamu...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Bar (HIG Style) */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8] to-transparent z-20">
          <div className="max-w-md mx-auto">
            <Button 
              onClick={handleNext}
              loading={isSubmitting}
              disabled={
                (step === 1 && (!storeName || slugStatus === 'taken' || slugStatus === 'checking')) ||
                (step === 2 && !waNumber)
              }
              className="w-full py-4 rounded-[20px] text-lg font-bold shadow-ios-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ background: step === 3 ? themeColor : '#1C1917', color: '#fff' }}
            >
              {step === 3 ? 'Selesaikan Setup' : 'Lanjutkan'}
              {step < 3 && <ArrowRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}