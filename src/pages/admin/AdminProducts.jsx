import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit, Edit3, Trash2, Package, Tag, IndianRupee, Layers, Eye, Image as ImageIcon, Loader2, X, Save, Sparkles, ShoppingBag, Shield } from 'lucide-react';
import { adminService, productService, categoryService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, inventory, media, seo
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const debouncedSearch = useDebounce(search, 500);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', debouncedSearch, filterCategory, sortOrder],
    queryFn: () => adminService.getAdminProducts({ 
      search: debouncedSearch, 
      category: filterCategory === 'all' ? undefined : filterCategory,
      sort: sortOrder 
    }).then(r => r.data),
  });
  
  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories().then(r => r.data.data),
  });
  const categories = catsData?.categories || catsData || [];


  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', brand: 'Magizhchi', description: '',
    costPrice: '', sellingPrice: '', discountPercentage: 0,
    variants: [{ size: 'M', color: 'Black', stock: 10 }],
    images: [], tags: [], seo: { metaTitle: '', metaDescription: '' }
  });

  const upsertMutation = useMutation({
    mutationFn: ({ id, data }) => id ? productService.updateProduct(id, data) : productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editingId ? 'Product updated' : 'Product created');
      resetForm();
    },
    onError: (err) => {
      console.error('DEBUG: Mutation Error:', err);
      toast.error(err.response?.data?.message || 'Action failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Manual Validation for better UX
    if (!formData.name) return toast.error('Product name is required');
    if (!formData.category) return toast.error('Please select a category');
    if (formData.sellingPrice === '' || formData.sellingPrice === undefined) return toast.error('Selling price is required');
    if (formData.costPrice === '' || formData.costPrice === undefined) return toast.error('Cost price is required (internal use)');
    if (!formData.variants || formData.variants.length === 0) return toast.error('Add at least one variant');
    if (!formData.images || formData.images.length === 0) return toast.error('Add at least one image');
    
    // Clean data for backend
    const cleanData = { ...formData };
    
    // Ensure category is only the ID string (not an object)
    if (cleanData.category && typeof cleanData.category === 'object') {
      cleanData.category = cleanData.category._id;
    }

    delete cleanData._id;
    delete cleanData.id;
    delete cleanData.__v;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;
    delete cleanData.totalStock;
    delete cleanData.availableStock;

    // Ensure numeric types and clean subdocuments
    cleanData.sellingPrice = Number(cleanData.sellingPrice);
    cleanData.costPrice = Number(cleanData.costPrice);
    cleanData.discountPercentage = Number(cleanData.discountPercentage || 0);
    cleanData.variants = cleanData.variants.map(v => {
      const cv = { 
        ...v, 
        stock: Math.max(0, Number(v.stock || 0)), 
        reservedStock: Math.max(0, Number(v.reservedStock || 0)) 
      };
      delete cv._id; // Prevent Mongoose casting errors on subdocs
      return cv;
    });

    console.log('DEBUG: Frontend Final Payload:', JSON.stringify(cleanData, null, 2));
    console.log('DEBUG: Editing ID:', editingId);
    upsertMutation.mutate({ id: editingId, data: cleanData });
  };

  const resetForm = () => {
    setFormData({
      name: '', sku: '', category: '', brand: 'Magizhchi', description: '',
      costPrice: '', sellingPrice: '', discountPercentage: 0,
      variants: [{ size: 'M', color: 'Black', stock: 10 }],
      images: [], tags: [], seo: { metaTitle: '', metaDescription: '' }
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addVariant = () => setFormData({...formData, variants: [...formData.variants, { size: '', color: '', stock: 0 }]});
  const removeVariant = (index) => setFormData({...formData, variants: formData.variants.filter((_, i) => i !== index)});

  const addImage = () => {
    if (!imageUrl) return;
    setFormData({...formData, images: [...formData.images, imageUrl]});
    setImageUrl('');
  };

  const removeImage = (index) => {
    setFormData({...formData, images: formData.images.filter((_, i) => i !== index)});
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large (Maximum 5MB allowed)');
    }
    
    setIsUploading(true);
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await adminService.uploadImage(fd);
      if (res.data.success) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, res.data.url] 
        }));
        toast.success('Image uploaded successfully to Cloudinary');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error(err.response?.data?.message || 'Upload failed. Please check your connection.');
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be uploaded again if deleted
      e.target.value = '';
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-premium-gold" size={40} /></div>;

  return (
    <div className="space-y-6">
      <Helmet><title>Manage Products — Admin</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products Management</h1>
          <p className="text-text-muted text-sm">
            {pagination?.total || 0} products found in your inventory
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            className="w-full bg-white border border-border-light rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-premium-gold font-medium"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm font-bold text-charcoal outline-none focus:border-premium-gold"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select 
            className="bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm font-bold text-charcoal outline-none focus:border-premium-gold"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-charcoal/40 backdrop-blur-md" onClick={resetForm} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-border-light"
          >
            <div className="flex-none p-8 flex items-center justify-between border-b border-border-light bg-light-bg/50">
              <div>
                <h2 className="text-2xl font-black text-charcoal tracking-tight">{editingId ? 'Refine Product' : 'Create New Product'}</h2>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Magizhchi Admin Dashboard</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-white rounded-full transition-colors text-text-muted hover:text-charcoal"><X size={24} /></button>
            </div>

            <div className="flex-none flex items-center gap-1 px-8 py-4 bg-white border-b border-border-light overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', label: 'Basic Info', icon: Sparkles },
                { id: 'inventory', label: 'Inventory', icon: ShoppingBag },
                { id: 'media', label: 'Media & Gallery', icon: ImageIcon },
                { id: 'seo', label: 'SEO & Tags', icon: Search }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-charcoal text-white shadow-xl shadow-charcoal/20' : 'text-text-muted hover:bg-light-bg'}`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col">
              <div className="flex-1">
                <div className="max-w-4xl mx-auto space-y-10">
                  {activeTab === 'basic' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Product Name</span>
                            <input required className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Category</span>
                              <select required className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                              </select>
                            </label>
                            <label className="block">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">SKU Code</span>
                              <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-bold" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} />
                            </label>
                          </div>
                        </div>
                        <label className="block">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Description</span>
                          <textarea rows="6" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-medium resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-light-bg/50 rounded-[2rem] border border-border-light">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isFeatured ? 'bg-premium-gold' : 'bg-gray-300'}`}>
                            <input type="checkbox" className="hidden" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} />
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isFeatured ? 'left-5' : 'left-1'}`} />
                          </div>
                          <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">Featured</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isBestSeller ? 'bg-premium-gold' : 'bg-gray-300'}`}>
                            <input type="checkbox" className="hidden" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} />
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isBestSeller ? 'left-5' : 'left-1'}`} />
                          </div>
                          <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">Best Seller</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <input type="checkbox" className="hidden" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-5' : 'left-1'}`} />
                          </div>
                          <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">Active</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'inventory' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                      <div className="grid md:grid-cols-3 gap-6">
                        <label className="block">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Selling Price</span>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                            <input type="number" required className="w-full bg-light-bg border-none rounded-2xl pl-10 pr-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Discount %</span>
                          <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Cost Price</span>
                          <input type="number" required className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                        </label>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Product Variants</span>
                          <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[10px] font-black text-premium-gold uppercase tracking-widest hover:translate-x-1 transition-transform"><Plus size={14} /> Add New Size/Color</button>
                        </div>
                        <div className="grid gap-3">
                          {formData.variants.map((v, i) => (
                            <div key={i} className="flex gap-4 items-center bg-light-bg/50 p-4 rounded-[1.5rem] border border-border-light group hover:bg-white transition-all">
                              <input placeholder="Size" className="w-24 bg-white border-none rounded-xl px-4 py-2 text-sm font-bold shadow-sm" value={v.size} onChange={e => {
                                const newV = [...formData.variants]; newV[i].size = e.target.value; setFormData({...formData, variants: newV});
                              }} />
                              <input placeholder="Color" className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm font-medium shadow-sm" value={v.color} onChange={e => {
                                const newV = [...formData.variants]; newV[i].color = e.target.value; setFormData({...formData, variants: newV});
                              }} />
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-text-muted uppercase">Stock</span>
                                <input type="number" className="w-24 bg-white border-none rounded-xl px-4 py-2 text-sm font-black shadow-sm text-center" value={v.stock} onChange={e => {
                                  const newV = [...formData.variants]; newV[i].stock = e.target.value; setFormData({...formData, variants: newV});
                                }} />
                              </div>
                              <button type="button" onClick={() => removeVariant(i)} className="text-stock-out hover:bg-stock-out/10 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'media' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="p-10 border-2 border-dashed border-border-light rounded-[3rem] bg-light-bg/30 text-center">
                        <div className="max-w-md mx-auto">
                          <ImageIcon size={48} className="mx-auto mb-6 text-text-muted/30" />
                          <h3 className="text-lg font-black text-charcoal mb-2">Build Your Gallery</h3>
                          <p className="text-sm text-text-muted mb-8">Add high-quality images. The first image will be your main cover.</p>
                          
                          <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                              <input 
                                placeholder="Paste Image URL here..." 
                                className="flex-1 bg-white shadow-xl shadow-black/5 rounded-2xl px-6 py-4 outline-none border border-border-light focus:border-premium-gold transition-all" 
                                value={imageUrl} 
                                onChange={e => setImageUrl(e.target.value)} 
                              />
                              <button type="button" onClick={addImage} className="bg-charcoal text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-premium-gold transition-colors">Add URL</button>
                            </div>

                            <div className="relative">
                              <input 
                                type="file" 
                                id="product-upload" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                disabled={isUploading}
                              />
                              <label 
                                htmlFor="product-upload" 
                                className={`flex items-center justify-center gap-3 w-full bg-light-bg border-2 border-dashed border-border-light hover:border-premium-gold p-4 rounded-2xl cursor-pointer transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                              >
                                {isUploading ? (
                                  <Loader2 size={20} className="animate-spin text-premium-gold" />
                                ) : (
                                  <ImageIcon size={20} className="text-text-muted group-hover:text-premium-gold transition-colors" />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-charcoal transition-colors">
                                  {isUploading ? 'Uploading to Cloudinary...' : 'Upload from Computer'}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative group aspect-[3/4] rounded-[2rem] overflow-hidden bg-light-bg border border-border-light shadow-md">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            {i === 0 && <div className="absolute top-4 left-4 bg-premium-gold text-charcoal text-[8px] font-black uppercase px-3 py-1 rounded-full">Cover</div>}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeImage(i)} className="bg-white text-stock-out p-3 rounded-2xl hover:scale-110 transition-transform shadow-xl"><Trash2 size={20} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'seo' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Search Optimization</span>
                          <label className="block">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Meta Title</span>
                            <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-medium" value={formData.seo.metaTitle} onChange={e => setFormData({...formData, seo: {...formData.seo, metaTitle: e.target.value}})} />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Meta Description</span>
                            <textarea rows="4" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-medium resize-none" value={formData.seo.metaDescription} onChange={e => setFormData({...formData, seo: {...formData.seo, metaDescription: e.target.value}})} />
                          </label>
                        </div>
                        <div className="space-y-6">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Categorization & Discovery</span>
                          <label className="block">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Search Tags (Comma separated)</span>
                            <textarea rows="7" placeholder="Summer, Casual, Men, Blue, Cotton..." className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-medium resize-none" value={formData.tags.join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex-none p-8 bg-light-bg/80 backdrop-blur-md border-t border-border-light flex items-center justify-between mt-8">
                <button type="button" onClick={resetForm} className="text-xs font-black text-text-muted uppercase tracking-widest hover:text-charcoal transition-colors">Discard Changes</button>
                <div className="flex gap-4">
                  <button type="submit" disabled={upsertMutation.isPending} className="bg-charcoal text-white px-12 py-4 rounded-[1.5rem] font-black text-sm tracking-widest shadow-2xl shadow-charcoal/20 hover:bg-premium-gold transition-all flex items-center gap-3">
                    {upsertMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {editingId ? 'Push Updates' : 'Publish Product'}</>}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-light-bg/50 border-b border-border-light">
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Product Essence</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Market Class</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Availability</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Visibility</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-light-bg/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={p.images?.[0] || '/placeholder.jpg'} alt="" className="w-14 h-18 rounded-2xl object-cover bg-light-bg shadow-sm group-hover:scale-105 transition-transform" />
                        {!p.isActive && <div className="absolute inset-0 bg-charcoal/60 rounded-2xl flex items-center justify-center text-[8px] text-white font-black uppercase">Draft</div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-charcoal tracking-tight group-hover:text-premium-gold transition-colors">{p.name}</span>
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{p.sku || 'NO-SKU'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-light-bg rounded-full text-[10px] font-black uppercase tracking-widest text-charcoal">{p.category?.name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-charcoal text-base tracking-tighter">₹{p.sellingPrice}</span>
                      {p.discountPercentage > 0 && <span className="text-[10px] text-stock-out font-black uppercase tracking-widest">-{p.discountPercentage}% OFF</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${p.totalStock > 0 ? 'text-green-600' : 'text-stock-out'}`}>
                        {p.totalStock > 0 ? `${p.totalStock} in stock` : 'Out of Stock'}
                      </span>
                      <span className="text-[9px] text-text-muted font-bold uppercase mt-1">{p.variants?.length} VARIANTS</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      {p.isFeatured && <span className="p-1.5 bg-premium-gold/10 text-premium-gold rounded-lg" title="Featured"><Sparkles size={14} /></span>}
                      {p.isBestSeller && <span className="p-1.5 bg-charcoal/10 text-charcoal rounded-lg" title="Best Seller"><ShoppingBag size={14} /></span>}
                      {p.isActive ? <span className="p-1.5 bg-green-50 text-green-600 rounded-lg" title="Active"><Shield size={14} /></span> : <span className="p-1.5 bg-red-50 text-red-600 rounded-lg" title="Inactive"><X size={14} /></span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { 
                          setFormData({
                            ...p, 
                            category: p.category?._id || p.category,
                            tags: p.tags || [],
                            seo: p.seo || { metaTitle: '', metaDescription: '' },
                            variants: p.variants?.length ? p.variants : [{ size: 'M', color: 'Black', stock: 10 }],
                            images: p.images || []
                          }); 
                          setEditingId(p._id); 
                          setShowForm(true); 
                          setActiveTab('basic'); 
                        }} 
                        className="p-3 bg-light-bg text-charcoal rounded-2xl hover:bg-premium-gold hover:text-white transition-all shadow-sm"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(p._id)} 
                        className="p-3 bg-light-bg text-stock-out rounded-2xl hover:bg-stock-out hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
