import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Textarea, Card, Modal, Badge } from '../../components/ui';
import { cn, formatRupiah } from '../../lib/utils';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // FIX: Track is_available manually karena checkbox HTML tidak reliable dengan react-hook-form boolean
  const [isAvailable, setIsAvailable] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ 
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_available: true,
    }
  });

  const fetchProducts = async () => {
    if (!store) return;
    setLoading(true); // FIX: Selalu set loading true saat mulai fetch
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order');
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // FIX: Jika store belum ada (sedang rehydrate dari localStorage), tunggu dulu
    // Jika store null dan authStore sudah selesai loading, baru set loading false
    if (store) {
      fetchProducts();
    } else {
      // Berikan grace period singkat untuk Zustand rehydrate
      const timer = setTimeout(() => {
        if (!store) setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [store]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openAdd();
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openAdd = () => {
    setEditProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setIsAvailable(true); // FIX: Reset state manual
    reset({ name: '', description: '', price: 0, category: 'Lainnya', is_available: true });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setImageFile(null);
    setImagePreview(product.image_url);
    setIsAvailable(product.is_available); // FIX: Sync state manual dengan data produk
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      is_available: product.is_available,
    });
    setModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const toastId = toast.loading('Mengompres gambar...');
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        setImageFile(compressedFile);
        setImagePreview(URL.createObjectURL(compressedFile));
        toast.success('Gambar dioptimalkan!', { id: toastId });
      } catch (error) {
        toast.error('Gagal memproses gambar', { id: toastId });
      }
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!store) return;

    // FIX: Gunakan state is_available yang dikelola manual, bukan dari form
    const finalData = { ...data, is_available: isAvailable };

    let image_url = editProduct?.image_url || null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `products/${store.id}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(path, imageFile, { upsert: true });
        
      if (uploadError) {
        toast.error(`Gagal upload foto: ${uploadError.message}`);
        return;
      }
      
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }

    if (editProduct) {
      const { error } = await supabase
        .from('products')
        .update({ ...finalData, image_url, updated_at: new Date().toISOString() })
        .eq('id', editProduct.id);
        
      if (error) {
        toast.error(`Gagal menyimpan produk: ${error.message}`);
        return;
      }
      toast.success('Produk diperbarui!');
    } else {
      const { error } = await supabase.from('products').insert({
        ...finalData,
        store_id: store.id,
        image_url,
        sort_order: products.length,
      });
      
      if (error) {
        toast.error(`Gagal menambah produk: ${error.message}`);
        return;
      }
      toast.success('Produk ditambahkan!');
    }

    setModalOpen(false);
    fetchProducts();
  };

  const toggleAvailable = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id);
      
    if (error) {
      toast.error('Gagal mengubah status');
      return;
    }
    
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p))
    );
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Yakin hapus produk ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Dihapus');
  };

  const filteredProducts = (products || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!store && !loading) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Produk</h1>
          <p className="text-sm text-gray-500">Kelola daftar menu Anda</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {['Semua', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'Semua' ? 'Tidak ditemukan' : 'Belum ada produk'}
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {searchQuery || selectedCategory !== 'Semua' ? 'Coba ganti kata kunci' : 'Mulai tambahkan produk Anda'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
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
                      <Badge variant={product.is_available ? 'gray' : 'red'}>
                        {product.is_available ? 'Tersedia' : 'Habis'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <Badge variant="gray" >{product.category}</Badge>
                    <h3 className="font-semibold text-gray-900 text-sm mt-1.5">{product.name}</h3>
                    <p className="text-gray-900 font-bold text-sm mt-0.5">{formatRupiah(product.price)}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => toggleAvailable(product)} className="text-gray-400 hover:text-gray-900 transition-colors">
                        {product.is_available ? <ToggleRight className="w-5 h-5 text-gray-900" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(product)} className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
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
      <AnimatePresence>
        {modalOpen && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Media Upload Area */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Foto Produk</label>
                <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-2 text-center cursor-pointer hover:border-gray-300 relative bg-gray-50/50 hover:bg-gray-100 transition-all duration-300 group">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="" className="h-48 w-full object-cover rounded-[1.75rem] mx-auto" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 rounded-[1.75rem] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <p className="text-white text-xs font-bold px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/20">Ganti Foto</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-bold">Ketuk untuk upload</p>
                      <p className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG, atau WebP</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-4">
                <Input label="Nama Produk" placeholder="Misal: Es Kopi Susu Aren" {...register('name')} error={errors.name?.message} />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Harga (Rp)" type="number" placeholder="15000" {...register('price')} error={errors.price?.message} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Kategori</label>
                    <select {...register('category')} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all">
                      {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>

                <Textarea label="Deskripsi Singkat" placeholder="Ceritakan rasa atau keunikan produk ini..." {...register('description')} />
              </div>

              {/* FIX: Toggle is_available dikelola dengan state manual, bukan register */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Status Stok</p>
                  <p className="text-xs text-gray-500">Tampilkan produk di katalog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                    isAvailable ? "bg-black" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform duration-200 shadow-sm",
                      isAvailable ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={isSubmitting} className="w-full py-4 rounded-2xl shadow-xl shadow-gray-200 text-base">
                  {editProduct ? 'Simpan Perubahan' : 'Terbitkan Produk'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}