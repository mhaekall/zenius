import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, LogOut, ChevronRight, Lock, Eye, EyeOff, MapPin, Clock, Trash2, Globe, Palette, Instagram, MessageSquare, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Textarea, Modal } from '../../components/ui';
import { SettingsSkeleton } from '../../components/ui/Skeleton';
import { sanitizeSlug, cn } from '../../lib/utils';
import type { Store } from '../../types';

const settingsSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter'),
  description: z.string().optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan dash'),
  wa_number: z.string()
    .min(8, 'Nomor WhatsApp minimal 8 digit')
    .regex(/^(0|62)?[0-9]{8,12}$/, 'Format nomor tidak valid'),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid'),
  address: z.string().optional(),
  operating_hours: z.string().optional(),
  instagram_username: z.string().optional(),
  tiktok_username: z.string().optional(),
  announcement: z.string().max(100, 'Maksimal 100 karakter').optional(),
  is_active: z.boolean().default(true),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user, store, setStore, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logo_url || null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(store?.qris_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const qrisRef = useRef<HTMLInputElement>(null);
  
  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const onChangePassword = async (data: PasswordFormData) => {
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) {
      toast.error(`Gagal mengubah password: ${error.message}`);
    } else {
      toast.success('Password berhasil diperbarui');
      setIsPasswordModalOpen(false);
      resetPasswordForm();
    }
  };

  // Cleanup blob URLs to prevent memory leak
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      if (qrisPreview && qrisPreview.startsWith('blob:')) {
        URL.revokeObjectURL(qrisPreview);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: store?.name || '',
      description: store?.description || '',
      slug: store?.slug || '',
      wa_number: store?.wa_number || '',
      theme_color: store?.theme_color || '#F59E0B',
      address: store?.address || '',
      operating_hours: store?.operating_hours || '',
      instagram_username: store?.instagram_username || '',
      tiktok_username: store?.tiktok_username || '',
      announcement: store?.announcement || '',
      is_active: store?.is_active ?? true,
    },
  });

  const isActive = watch('is_active');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== store?.slug) {
      toast.error('Konfirmasi slug tidak cocok');
      return;
    }

    const toastId = toast.loading('Menghapus akun...');
    try {
      // 1. Delete products (cascade should handle this but let's be safe)
      await supabase.from('products').delete().eq('store_id', store?.id);
      
      // 2. Delete store
      const { error: storeError } = await supabase.from('stores').delete().eq('id', store?.id);
      if (storeError) throw storeError;

      // 3. Sign out
      await signOut();
      toast.success('Akun dan toko berhasil dihapus', { id: toastId });
      navigate('/');
    } catch (err: any) {
      toast.error(`Gagal menghapus: ${err.message}`, { id: toastId });
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke old URL if exists
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      
      const toastId = toast.loading('Mengompres logo...');
      try {
        const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 512 });
        setLogoFile(compressed);
        setLogoPreview(URL.createObjectURL(compressed));
        toast.success('Logo siap!', { id: toastId });
      } catch (error) {
        toast.error('Gagal memproses logo', { id: toastId });
      }
    }
  };

  const handleQrisChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke old URL if exists
      if (qrisPreview && qrisPreview.startsWith('blob:')) {
        URL.revokeObjectURL(qrisPreview);
      }
      
      const toastId = toast.loading('Mengompres QRIS...');
      try {
        const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 800 });
        setQrisFile(compressed);
        setQrisPreview(URL.createObjectURL(compressed));
        toast.success('QRIS siap!', { id: toastId });
      } catch (error) {
        toast.error('Gagal memproses QRIS', { id: toastId });
      }
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      console.error('Upload Error:', error);
      toast.error(`Gagal upload: ${error.message}`);
      return null;
    }
    if (data) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return urlData.publicUrl;
    }
    return null;
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!user) return;
    
    let logo_url = store?.logo_url || null;
    let qris_url = store?.qris_url || null;
    const storageFolder = store?.id || user.id;

    if (logoFile) {
      logo_url = await uploadFile(logoFile, 'store-assets', `logos/${storageFolder}/logo.${logoFile.name.split('.').pop()}`);
    }
    if (qrisFile) {
      qris_url = await uploadFile(qrisFile, 'store-assets', `qris/${storageFolder}/qris.${qrisFile.name.split('.').pop()}`);
    }

    if (store) {
      const { data: updated, error } = await supabase
        .from('stores')
        .update({ ...data, logo_url, qris_url, updated_at: new Date().toISOString() })
        .eq('id', store.id)
        .select()
        .single();

      if (!error && updated) {
        setStore(updated as Store);
        toast.success('Pengaturan berhasil disimpan!');
      } else if (error) {
        toast.error(`Gagal menyimpan: ${error.message}`);
      }
    } else {
      const formattedWa = data.wa_number.startsWith('0') 
        ? '62' + data.wa_number.slice(1) 
        : data.wa_number;
        
      const { data: inserted, error } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          wa_number: formattedWa,
          theme_color: data.theme_color,
          logo_url,
          qris_url,
        })
        .select()
        .single();

      if (!error && inserted) {
        setStore(inserted as Store);
        toast.success('Toko baru berhasil dibuat!');
      } else if (error) {
        toast.error(`Gagal menyimpan toko: ${error.message}`);
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h1 className="text-ios-title2 text-[#1C1917]">Pengaturan</h1>
        </div>
      </div>

      {!store && !user ? <SettingsSkeleton /> : (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
        
        {/* Section: Live Preview (Apple-style context) */}
        <section className="px-1">
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-2.5">Live Preview</h2>
          <div className="bg-white rounded-[28px] p-4 border border-black/[0.04] shadow-ios-md flex items-center gap-4 overflow-hidden relative group">
            <div 
              className="w-20 h-28 rounded-xl shrink-0 overflow-hidden border border-black/[0.06] shadow-sm relative transition-transform group-hover:scale-[1.02]"
              style={{ background: '#F2F2F7' }}
            >
              {/* Miniature Catalog Preview */}
              <div className="h-8 w-full" style={{ background: watch('theme_color') }} />
              <div className="p-2 space-y-2">
                <div className="w-10 h-10 bg-white rounded-lg mx-auto -mt-6 border border-black/[0.02] overflow-hidden">
                  {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#EEECEA]" />}
                </div>
                <div className="w-10 h-1.5 bg-[#1C1917] rounded-full mx-auto" />
                <div className="grid grid-cols-2 gap-1">
                  <div className="aspect-square bg-white rounded-md border border-black/[0.02]" />
                  <div className="aspect-square bg-white rounded-md border border-black/[0.02]" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1C1917] truncate">{watch('name') || 'Nama Toko'}</h3>
              <p className="text-[11px] text-[#78716C] line-clamp-2 mt-1">{watch('description') || 'Belum ada deskripsi...'}</p>
              <div 
                className="mt-3 inline-flex px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                style={{ background: watch('theme_color') }}
              >
                Lihat Katalog
              </div>
            </div>
          </div>
        </section>

        {/* Section: Tampilan Toko */}
        <section>
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Tampilan Toko</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden">
            
            {/* Logo Row */}
            <div 
              onClick={() => logoRef.current?.click()}
              className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04] cursor-pointer active:bg-[#EEECEA] transition-colors"
            >
              <span className="text-sm font-medium text-[#1C1917]">Logo</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[#EEECEA] overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-[#A8A29E]">Kosong</span>
                  )}
                </div>
                <span className="text-sm text-[#78716C]">Ubah</span>
                <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
              </div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </div>

            {/* Tema Row */}
            <div className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04]">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-[#A8A29E]" />
                <span className="text-sm font-medium text-[#1C1917]">Warna Aksen</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  {...register('theme_color')} 
                  className="w-8 h-8 rounded-[8px] cursor-pointer border-0 p-0 bg-transparent" 
                />
              </div>
            </div>

            {/* Status Toko Row */}
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-3">
                <Globe className={cn("w-4 h-4", isActive ? "text-emerald-500" : "text-[#A8A29E]")} />
                <div>
                  <span className="text-sm font-medium text-[#1C1917]">Status Toko</span>
                  <p className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-tighter">
                    {isActive ? "Online & Menerima Order" : "Offline / Tutup"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValue('is_active', !isActive)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ios-press",
                  isActive ? "bg-[#34C759]" : "bg-[#EEECEA]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-ios-sm transition-transform duration-200",
                    isActive ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
              <input type="hidden" {...register('is_active')} />
            </div>

          </div>
        </section>

        {/* Section: Informasi Dasar */}
        <section>
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Informasi Dasar</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden px-4 py-2 space-y-3 pb-4">
            <Input
              label="Nama Toko"
              {...register('name')}
              error={errors.name?.message}
              onChange={(e) => {
                register('name').onChange(e);
                setValue('slug', sanitizeSlug(e.target.value));
              }}
              className="bg-[#EEECEA]"
            />
            <Input
              label="URL Toko (slug)"
              {...register('slug')}
              error={errors.slug?.message}
              hint={`Katalog: ${window.location.origin}/c/${watch('slug') || store?.slug}`}
              className="bg-[#EEECEA]"
            />
            <Input
              label="Nomor WhatsApp"
              type="tel"
              {...register('wa_number')}
              error={errors.wa_number?.message}
              hint="Format: 628xxxxxxxxx"
              className="bg-[#EEECEA]"
            />
            <Input
              label="Alamat Toko"
              icon={<MapPin className="w-4 h-4" />}
              placeholder="Misal: Jl. Kenangan No. 123, Jakarta"
              {...register('address')}
              className="bg-[#EEECEA]"
            />
            <Input
              label="Jam Operasional"
              icon={<Clock className="w-4 h-4" />}
              placeholder="Misal: Setiap Hari, 08:00 - 21:00"
              {...register('operating_hours')}
              className="bg-[#EEECEA]"
            />
            <Textarea 
              label="Deskripsi Toko (Bio)" 
              {...register('description')} 
              className="bg-[#EEECEA]"
              placeholder="Ceritakan tentang tokomu kepada pelanggan..."
            />
            </div>
            </section>

            {/* Section: Sosial Media */}
            <section>
            <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Sosial Media</h2>
            <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden px-4 py-2 space-y-3 pb-4">
            <Input
              label="Instagram"
              icon={<Instagram className="w-4 h-4" />}
              placeholder="username_instagram"
              {...register('instagram_username')}
              className="bg-[#EEECEA]"
            />
            <Input
              label="TikTok"
              icon={<MessageSquare className="w-4 h-4" />}
              placeholder="username_tiktok"
              {...register('tiktok_username')}
              className="bg-[#EEECEA]"
            />
            </div>
            </section>

            {/* Section: Pengumuman Toko */}
            <section>
            <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Banner Pengumuman</h2>
            <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden px-4 py-3">
            <Input
              label="Teks Pengumuman"
              icon={<Megaphone className="w-4 h-4" />}
              placeholder="Misal: Diskon 20% khusus hari ini!"
              {...register('announcement')}
              className="bg-[#EEECEA]"
              maxLength={100}
            />
            <p className="text-[10px] text-[#A8A29E] mt-2 px-1">Muncul di bagian paling atas katalog publik.</p>
            </div>
            </section>

            {/* Section: Paket Langganan */}
        <section>
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Paket Langganan</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1C1917]">Paket Gratis</p>
              <p className="text-xs text-[#78716C] mt-0.5">Berlaku selamanya</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/upgrade')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform"
            >
              Upgrade Paket
            </button>
          </div>
        </section>

        {/* Section: Pembayaran */}
        <section>
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Pembayaran</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden">
            <div 
              onClick={() => qrisRef.current?.click()}
              className="flex items-center justify-between py-3 px-4 cursor-pointer active:bg-[#EEECEA] transition-colors"
            >
              <span className="text-sm font-medium text-[#1C1917]">QRIS Pembayaran</span>
              <div className="flex items-center gap-2">
                {qrisPreview ? (
                  <img src={qrisPreview} alt="QRIS" className="h-8 object-contain rounded-[4px]" />
                ) : (
                  <span className="text-sm text-[#78716C]">Upload</span>
                )}
                <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
              </div>
              <input ref={qrisRef} type="file" accept="image/*" onChange={handleQrisChange} className="hidden" />
            </div>
          </div>
        </section>

        <Button type="submit" loading={isSubmitting} className="w-full py-3.5 shadow-ios-sm mt-4">
          <Save className="w-4 h-4" /> Simpan Perubahan
        </Button>

        {/* Section: Akun */}
        <section className="mt-8">
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Akun</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between py-3.5 px-4 cursor-pointer active:bg-[#EEECEA] transition-colors border-b border-black/[0.04]"
            >
              <div className="flex items-center text-[#1C1917]">
                <Lock className="w-4 h-4 mr-3 text-[#A8A29E]" />
                <span className="text-sm font-medium">Ganti Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="w-full flex items-center py-3.5 px-4 cursor-pointer active:bg-[#EEECEA] transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500" />
              <span className="text-sm font-medium text-red-500">Keluar Akun</span>
            </button>
          </div>
        </section>

        {/* Section: Danger Zone */}
        <section className="mt-8">
          <h2 className="text-ios-caption uppercase tracking-widest text-red-500 mb-1.5 px-3">Danger Zone</h2>
          <div className="bg-red-50/50 rounded-[18px] border border-red-100 shadow-ios-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full flex items-center justify-between py-3.5 px-4 cursor-pointer active:bg-red-100 transition-colors"
            >
              <div className="flex items-center text-red-600">
                <Trash2 className="w-4 h-4 mr-3" />
                <span className="text-sm font-bold">Hapus Akun & Toko</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#A8A29E] mt-2 px-3 leading-relaxed">
            Menghapus akun akan menghapus seluruh data produk, pengaturan, dan katalog Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
        </section>

      </form>
      )}

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <Modal
            open={isPasswordModalOpen}
            onClose={() => {
              setIsPasswordModalOpen(false);
              resetPasswordForm();
            }}
            title="Ganti Password"
          >
            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div className="relative">
                <Input
                  label="Password Baru"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-[#A8A29E] hover:text-[#1C1917] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                label="Konfirmasi Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ulangi password baru"
                {...registerPassword('confirmPassword')}
                error={passwordErrors.confirmPassword?.message}
              />
              <div className="pt-2">
                <Button type="submit" loading={isSubmittingPassword} className="w-full py-3.5 shadow-ios-sm">
                  Simpan Password
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <Modal
            open={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setDeleteConfirmText('');
            }}
            title="Hapus Akun"
          >
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <p className="text-sm text-red-800 leading-relaxed font-medium">
                  Apakah Anda yakin ingin menghapus akun? Seluruh produk dan data toko <strong>{store?.name}</strong> akan hilang selamanya.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Ketik <span className="text-[#1C1917] select-all">"{store?.slug}"</span> untuk konfirmasi:
                </label>
                <input 
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Ketik slug tokomu..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F4F0] border border-black/[0.06] text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleDeleteAccount} 
                  disabled={deleteConfirmText !== store?.slug}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/20 disabled:bg-red-200"
                >
                  Hapus Permanen
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}