import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Textarea } from '../../components/ui';
import { SettingsSkeleton } from '../../components/ui/Skeleton';
import { sanitizeSlug, cn } from '../../lib/utils';
import type { Store } from '../../types';

const settingsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan dash'),
  wa_number: z.string()
    .min(8, 'Nomor WhatsApp minimal 8 digit')
    .regex(/^(0|62)?[0-9]{8,12}$/, 'Format nomor tidak valid (contoh: 628xxxxxxxxxx atau 08xxxxxxxxxx)'),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid'),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { user, store, setStore, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logo_url || null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(store?.qris_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const qrisRef = useRef<HTMLInputElement>(null);
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
    },
  });

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
            <div className="flex items-center justify-between py-3 px-4 cursor-pointer">
              <span className="text-sm font-medium text-[#1C1917]">Warna Aksen</span>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  {...register('theme_color')} 
                  className="w-8 h-8 rounded-[8px] cursor-pointer border-0 p-0 bg-transparent" 
                />
              </div>
            </div>

          </div>
        </section>

        {/* Section: Informasi Dasar */}
        <section>
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Informasi Dasar</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden px-4 py-2 space-y-3">
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
            <Textarea 
              label="Deskripsi (opsional)" 
              {...register('description')} 
              className="bg-[#EEECEA]"
            />
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
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center py-3.5 px-4 text-sm font-medium text-red-500 active:bg-[#EEECEA] transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" /> Keluar Akun
            </button>
          </div>
        </section>

      </form>
      )}
    </>
  );
}