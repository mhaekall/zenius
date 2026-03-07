import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Input, Textarea, Card } from '../../components/ui';
import { sanitizeSlug } from '../../lib/utils';
import type { Store } from '../../types';

const settingsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan dash'),
  wa_number: z.string().min(8).regex(/^[0-9]+$/),
  theme_color: z.string(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { store, setStore } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logo_url || null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(store?.qris_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const qrisRef = useRef<HTMLInputElement>(null);

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
      theme_color: store?.theme_color || '#6366f1',
    },
  });

  const storeName = watch('name');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrisFile(file);
      setQrisPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (data) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return urlData.publicUrl;
    }
    return null;
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!store) return;
    let logo_url = store.logo_url;
    let qris_url = store.qris_url;

    if (logoFile) {
      logo_url = await uploadFile(logoFile, 'store-assets', `logos/${store.id}/logo.${logoFile.name.split('.').pop()}`);
    }
    if (qrisFile) {
      qris_url = await uploadFile(qrisFile, 'store-assets', `qris/${store.id}/qris.${qrisFile.name.split('.').pop()}`);
    }

    const { data: updated, error } = await supabase
      .from('stores')
      .update({ ...data, logo_url, qris_url, updated_at: new Date().toISOString() })
      .eq('id', store.id)
      .select()
      .single();

    if (!error && updated) {
      setStore(updated as Store);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <DashboardLayout activeHref="/dashboard/settings">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Toko</h1>
        <p className="text-sm text-gray-500">Kelola informasi dan tampilan toko</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        {/* Logo */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Logo Toko</h2>
          <div className="flex items-center gap-4">
            <div
              onClick={() => logoRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative flex items-center justify-center"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="text-sm text-violet-600 font-medium hover:underline"
              >
                Ganti Logo
              </button>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG • Maks 2MB</p>
            </div>
          </div>
          <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
        </Card>

        {/* Informasi Toko */}
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Informasi Toko</h2>
          <Input
            label="Nama Toko"
            {...register('name')}
            error={errors.name?.message}
            onChange={(e) => {
              register('name').onChange(e);
              setValue('slug', sanitizeSlug(e.target.value));
            }}
          />
          <Textarea label="Deskripsi (opsional)" {...register('description')} placeholder="Ceritakan tentang toko kamu..." />
          <div>
            <Input
              label="URL Toko (slug)"
              {...register('slug')}
              error={errors.slug?.message}
              hint={`Katalog: ${window.location.origin}/c/${watch('slug') || store?.slug}`}
            />
          </div>
          <Input
            label="Nomor WhatsApp"
            type="tel"
            {...register('wa_number')}
            error={errors.wa_number?.message}
            hint="Format: 628xxxxxxxxx atau 08xxxxxxxxx"
          />
        </Card>

        {/* Tampilan */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Warna Tema Katalog</h2>
          <div className="flex items-center gap-3">
            <input type="color" {...register('theme_color')} className="w-10 h-10 rounded-xl cursor-pointer" />
            <span className="text-sm text-gray-600">Warna aksen utama katalog publik</span>
          </div>
        </Card>

        {/* QRIS */}
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">Gambar QRIS Pembayaran</h2>
          <p className="text-xs text-gray-400 mb-4">Upload gambar QRIS milikmu. Pelanggan bisa scan untuk bayar.</p>
          <div
            onClick={() => qrisRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-violet-300 transition-colors text-center"
          >
            {qrisPreview ? (
              <img src={qrisPreview} alt="QRIS" className="h-32 object-contain mx-auto rounded-lg" />
            ) : (
              <div className="py-4">
                <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Klik untuk upload QRIS</p>
              </div>
            )}
          </div>
          <input ref={qrisRef} type="file" accept="image/*" onChange={handleQrisChange} className="hidden" />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </Button>
          {success && (
            <span className="text-sm text-green-600 font-medium">✓ Tersimpan!</span>
          )}
        </div>
      </form>
    </DashboardLayout>
  );
}
