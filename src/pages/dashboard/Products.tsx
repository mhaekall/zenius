import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Search, GripVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Textarea, Card, Modal, Badge } from '../../components/ui';
import { cn, formatRupiah } from '../../lib/utils';
import { ProductsGridSkeleton } from '../../components/ui/Skeleton';
import { ProductPlaceholder } from '../../components/ui/ProductPlaceholder';
import type { Product } from '../../types';

const productSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  description: z.string().optional(),
  price: z.coerce.number().min(100, 'Harga minimal Rp 100'),
  category: z.string().min(1, 'Pilih atau tulis kategori'),
  is_available: z.boolean().default(true),
});
type ProductFormData = z.infer<typeof productSchema>;

export default function Products() {
  const { store } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  
  // Custom categories state
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['Makanan', 'Minuman', 'Cemilan', 'Paket']);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;
  const [totalCount, setTotalCount] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  // Cleanup blob URL to prevent memory leak
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
    setLoading(true);
    
    // First get total count for pagination
    let query = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id);
    
    if (selectedCategory !== 'Semua') {
      query = query.eq('category', selectedCategory);
    }
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    
    const { count } = await query;
    setTotalCount(count || 0);
    
    // Then fetch paginated data
    const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;
    let dataQuery = supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order')
      .range(offset, offset + PRODUCTS_PER_PAGE - 1);
    
    if (selectedCategory !== 'Semua') {
      dataQuery = dataQuery.eq('category', selectedCategory);
    }
    if (searchQuery) {
      dataQuery = dataQuery.ilike('name', `%${searchQuery}%`);
    }
    
    const { data } = await dataQuery;
    setProducts(data || []);

    // Update dynamic categories from existing products
    if (data) {
      const existingCats = Array.from(new Set(data.map(p => p.category)));
      setDynamicCategories(prev => Array.from(new Set([...prev, ...existingCats])));
    }

    setLoading(false);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (store) {
      fetchProducts();
    } else {
      const timer = setTimeout(() => {
        if (!store) setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [store, currentPage, selectedCategory, searchQuery]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openAdd();
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openAdd = () => {
    if (totalCount >= 15) {
      toast.error('Batas 15 produk tercapai untuk paket Gratis. Silakan upgrade paket Anda.');
      return;
    }
    setEditProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setIsAvailable(true);
    setIsAddingCustomCategory(false);
    reset({ name: '', description: '', price: 0, category: 'Makanan', is_available: true });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setImageFile(null);
    setImagePreview(product.image_url);
    setIsAvailable(product.is_available);
    setIsAddingCustomCategory(!['Makanan', 'Minuman', 'Cemilan', 'Paket'].includes(product.category));
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
      // Revoke old URL if exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for snappy UX
    setProducts(items);

    // Prepare batch update for database
    const updates = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
      // Need to include required fields for upsert or just use a loop for updates
    }));

    // Perform updates in background
    try {
      // Supabase JS doesn't have a bulk update for different rows easily without RPC, 
      // so we do it one by one but don't await each to block UI
      for (const update of updates) {
        supabase
          .from('products')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
          .then(); // fire and forget
      }
    } catch (err) {
      console.error('Failed to save order', err);
      toast.error('Gagal menyimpan urutan');
      // Ideally revert state here on failure, but keeping it simple for now
    }
  };

  const filteredProducts = (products || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!store && !loading) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h1 className="text-ios-title2 text-[#1C1917]">Produk</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#F5F4F0] rounded-full border border-black/[0.06] text-xs font-bold text-[#78716C] shadow-ios-sm">
            <span className={totalCount >= 15 ? 'text-red-500' : 'text-[#1C1917]'}>{totalCount}</span> / 15 Limit
          </div>
        </div>
      </div>

      {/* Merged Search & Filter Block */}
      <div className="bg-[#F5F4F0] rounded-[18px] p-2 mb-6 shadow-ios-sm border border-black/[0.06]">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
          <input 
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#EEECEA] rounded-[14px] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide text-nowrap">
          {['Semua', ...dynamicCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ios-press",
                selectedCategory === cat 
                  ? "bg-[#1C1917] text-white shadow-ios-sm" 
                  : "bg-[#EEECEA] text-[#78716C] hover:bg-[#E8E6E1]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? <ProductsGridSkeleton /> : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mb-4 shadow-ios-sm border border-black/[0.06]">
            <Package className="w-8 h-8 text-[#A8A29E]" />
          </div>
          <p className="text-sm font-medium text-[#78716C] mb-4">
            {searchQuery || selectedCategory !== 'Semua' ? 'Tidak ditemukan' : 'Belum ada produk'}
          </p>
          <Button size="sm" onClick={openAdd}>Tambah Produk</Button>
        </div>
      ) : (
        <>
          {searchQuery || selectedCategory !== 'Semua' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  >
                  <div className="bg-[#F5F4F0] rounded-[18px] overflow-hidden border border-black/[0.06] shadow-ios-sm h-full flex flex-col">
                    <div className="aspect-[4/3] bg-[#EEECEA] relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <ProductPlaceholder 
                          name={product.name}
                          themeColor={store?.theme_color || '#F59E0B'}
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={product.is_available ? 'gray' : 'red'}>
                          {product.is_available ? 'Ada' : 'Habis'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col">
                      <p className="text-xs text-[#78716C] mb-0.5">{product.category}</p>
                      <h3 className="font-semibold text-[#1C1917] text-sm leading-tight flex-1 line-clamp-2">{product.name}</h3>
                      <p className="text-[#1C1917] font-bold text-sm mt-1">{formatRupiah(product.price)}</p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/[0.04]">
                        <button onClick={() => toggleAvailable(product)} className="text-[#A8A29E] hover:text-[#1C1917] transition-colors ios-press">
                          {product.is_available ? <ToggleRight className="w-5 h-5 text-[#1C1917]" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(product)} className="text-[#A8A29E] hover:text-[#1C1917] p-1 bg-[#EEECEA] rounded-[8px] transition-colors ios-press">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="text-[#A8A29E] hover:text-red-500 p-1 bg-[#EEECEA] rounded-[8px] transition-colors ios-press">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="products-list">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="flex flex-col gap-3"
                  >
                    {filteredProducts.map((product, index) => (
                      <Draggable key={product.id} draggableId={product.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "bg-white rounded-[18px] border border-black/[0.06] p-3 flex items-center gap-3 transition-shadow",
                              snapshot.isDragging ? "shadow-ios-lg z-50 ring-2 ring-[#F59E0B]/20" : "shadow-sm"
                            )}
                            style={provided.draggableProps.style}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="w-8 h-10 flex items-center justify-center text-[#A8A29E] active:text-[#1C1917] active:bg-[#EEECEA] rounded-lg transition-colors"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                            
                            <div className="w-14 h-14 rounded-[12px] bg-[#EEECEA] overflow-hidden flex-shrink-0 relative">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ProductPlaceholder name={product.name} themeColor={store?.theme_color || '#F59E0B'} size="sm" />
                              )}
                              {!product.is_available && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-semibold truncate", !product.is_available ? "text-[#A8A29E]" : "text-[#1C1917]")}>
                                {product.name}
                              </p>
                              <p className="text-[11px] text-[#A8A29E] font-medium">{formatRupiah(product.price)}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => toggleAvailable(product)} className="text-[#A8A29E] hover:text-[#1C1917] p-1 ios-press">
                                {product.is_available ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                              <button onClick={() => openEdit(product)} className="text-[#A8A29E] hover:text-[#1C1917] p-1.5 bg-[#F5F4F0] rounded-[8px] ios-press">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        
        {/* Pagination Controls */}
        {totalCount > PRODUCTS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-[#F5F4F0] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Sebelumnya
            </button>
            <span className="text-sm text-[#78716C]">
              Halaman {currentPage} dari {Math.ceil(totalCount / PRODUCTS_PER_PAGE)}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(totalCount / PRODUCTS_PER_PAGE)}
              className="px-4 py-2 rounded-lg bg-[#F5F4F0] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya →
            </button>
          </div>
        )}
        </>
      )}

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {modalOpen && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Media Upload Area */}
              <div>
                <label className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-2 block px-1">Foto Produk</label>
                <div className="border border-black/[0.06] rounded-[18px] p-2 text-center cursor-pointer hover:border-gray-300 relative bg-[#F5F4F0] hover:bg-[#EEECEA] transition-all duration-300 group shadow-ios-sm">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="" className="h-40 w-full object-cover rounded-[14px] mx-auto" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 rounded-[14px] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <p className="text-white text-xs font-bold px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/20">Ganti Foto</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="w-12 h-12 bg-[#EEECEA] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-[#A8A29E]" />
                      </div>
                      <p className="text-sm text-[#78716C] font-medium">Ketuk untuk upload</p>
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
                    <label className="text-sm font-medium text-[#78716C]">Kategori</label>
                    {!isAddingCustomCategory ? (
                      <select 
                        {...register('category')} 
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingCustomCategory(true);
                            setValue('category', '');
                          } else {
                            register('category').onChange(e);
                          }
                        }}
                        className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                      >
                        {dynamicCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                        <option value="ADD_NEW">+ Kategori Baru...</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <input 
                          {...register('category')}
                          placeholder="Nama kategori..."
                          autoFocus
                          className="w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => setIsAddingCustomCategory(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-600 uppercase"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Textarea label="Deskripsi Singkat" placeholder="Ceritakan rasa atau keunikan produk ini..." {...register('description')} />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm">
                <div>
                  <p className="text-sm font-semibold text-[#1C1917]">Status Stok</p>
                  <p className="text-xs text-[#78716C]">Tampilkan produk di katalog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ios-press",
                    isAvailable ? "bg-[#34C759]" : "bg-[#EEECEA]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow-ios-sm transition-transform duration-200",
                      isAvailable ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={isSubmitting} className="w-full py-3.5 rounded-[14px] shadow-ios-md text-base">
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