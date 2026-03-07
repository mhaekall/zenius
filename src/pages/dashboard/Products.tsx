import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Input, Textarea, Card, Modal, Badge } from '../../components/ui';
import { formatRupiah } from '../../lib/utils';
import type { Product } from '../../types';

const productSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  description: z.string().optional(),
  price: z.coerce.number().min(100, 'Harga minimal Rp 100'),
  category: z.string().default('Lainnya'),
  is_available: z.boolean().default(true),
});
type ProductFormData = z.infer<typeof productSchema>;

const CATEGORIES = ['Makanan', 'Minuman', 'Cemilan', 'Paket', 'Lainnya'];

export default function Products() {
  const { store } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  const fetchProducts = async () => {
    if (!store) return;
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order');
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [store]);

  const openAdd = () => {
    setEditProduct(null);
    setImageFile(null);
    setImagePreview(null);
    reset({ name: '', description: '', price: 0, category: 'Lainnya', is_available: true });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setImageFile(null);
    setImagePreview(product.image_url);
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      is_available: product.is_available,
    });
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!store) return;

    let image_url = editProduct?.image_url || null;

    // Upload image if changed
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${store.id}/${Date.now()}.${ext}`;
      const { data: uploadData } = await supabase.storage
        .from('products')
        .upload(path, imageFile, { upsert: true });
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }

    if (editProduct) {
      await supabase
        .from('products')
        .update({ ...data, image_url, updated_at: new Date().toISOString() })
        .eq('id', editProduct.id);
    } else {
      await supabase.from('products').insert({
        ...data,
        store_id: store.id,
        image_url,
        sort_order: products.length,
      });
    }

    setModalOpen(false);
    fetchProducts();
  };

  const toggleAvailable = async (product: Product) => {
    await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p))
    );
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Yakin hapus produk ini?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout activeHref="/dashboard/products">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500">{products.length} produk terdaftar</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Belum ada produk</h3>
          <p className="text-sm text-gray-500 mb-5">Mulai tambahkan produk untuk katalog digitalmu</p>
          <Button onClick={openAdd}>+ Tambah Produk Pertama</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="overflow-hidden">
                  <div className="h-40 bg-gray-100 relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={product.is_available ? 'green' : 'red'}>
                        {product.is_available ? 'Tersedia' : 'Habis'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <Badge variant="gray" >{product.category}</Badge>
                    <h3 className="font-semibold text-gray-900 text-sm mt-1.5">{product.name}</h3>
                    <p className="text-violet-600 font-bold text-sm mt-0.5">{formatRupiah(product.price)}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => toggleAvailable(product)} className="text-gray-400 hover:text-violet-600 transition-colors">
                        {product.is_available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(product)} className="text-gray-400 hover:text-violet-600 p-1.5 hover:bg-violet-50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Produk' : 'Tambah Produk'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Foto Produk</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-violet-300 transition-colors relative">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-32 object-cover rounded-lg mx-auto" />
              ) : (
                <div className="py-4">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Klik untuk upload foto</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <Input label="Nama Produk" placeholder="contoh: Kopi Susu" {...register('name')} error={errors.name?.message} />
          <Textarea label="Deskripsi (opsional)" placeholder="Ceritakan produk ini..." {...register('description')} />
          <Input label="Harga (Rp)" type="number" placeholder="15000" {...register('price')} error={errors.price?.message} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_available')} className="rounded" />
            <span className="text-sm text-gray-700">Produk tersedia sekarang</span>
          </label>

          <Button type="submit" loading={isSubmitting} className="w-full">
            {editProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
