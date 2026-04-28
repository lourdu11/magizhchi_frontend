import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, X, Loader2, Tag } from 'lucide-react';
import { categoryService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const EMPTY = { name: '', description: '', image: '', displayOrder: 0 };

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: cats, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories().then(r => r.data.data?.categories || r.data.data || []),
  });


  const saveMutation = useMutation({
    mutationFn: (data) => editing ? categoryService.updateCategory(editing, data) : categoryService.createCategory(data),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success(editing ? 'Category updated' : 'Category created'); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Category deleted'); },
  });

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };
  const startEdit = (cat) => { setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', displayOrder: cat.displayOrder || 0 }); setEditing(cat._id); setShowForm(true); };

  return (
    <div className="space-y-6">
      <Helmet><title>Categories — Admin</title></Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Product Categories</h1>
          <p className="text-text-muted text-sm">{cats?.length || 0} categories configured</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">{editing ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={resetForm} className="p-1.5 hover:bg-light-bg rounded-lg"><X size={18} /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-text-muted uppercase mb-1 block">Category Name *</span>
              <input required className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-premium-gold" placeholder="e.g. T-Shirts" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-text-muted uppercase mb-1 block">Display Order</span>
              <input type="number" className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: Number(e.target.value)})} />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-text-muted uppercase mb-1 block">Image URL</span>
              <input className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="https://..." value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-text-muted uppercase mb-1 block">Description</span>
              <textarea rows="2" className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="Short description for this category" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </label>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saveMutation.isLoading} className="btn-dark flex items-center gap-2 px-6 py-2.5">
                {saveMutation.isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> {editing ? 'Update' : 'Create'} Category</>}
              </button>
              <button type="button" onClick={resetForm} className="text-sm text-text-muted hover:text-text-primary px-4">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-premium-gold" size={36} /></div>}
        {cats?.length === 0 && <div className="col-span-full py-12 text-center text-text-muted"><Tag size={36} className="mx-auto mb-2 text-border-light" /><p>No categories yet. Add your first category.</p></div>}
        {cats?.map(cat => (
          <div key={cat._id} className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm group">
            <div className="h-32 bg-light-bg relative">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag size={36} className="text-border-light" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => startEdit(cat)} className="p-2.5 bg-white/90 rounded-full text-text-primary hover:bg-premium-gold hover:text-charcoal transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => { if (window.confirm(`Delete "${cat.name}"? This may affect products.`)) deleteMutation.mutate(cat._id); }} className="p-2.5 bg-white/90 rounded-full text-text-primary hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary">{cat.name}</h4>
                <span className="text-xs text-text-muted bg-light-bg px-2 py-0.5 rounded-full">Order: {cat.displayOrder || 0}</span>
              </div>
              {cat.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{cat.description}</p>}
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-2">{cat.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
