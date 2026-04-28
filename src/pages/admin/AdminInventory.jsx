import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, AlertTriangle, Plus, Minus, History, Loader2, Save } from 'lucide-react';
import { adminService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';

export default function AdminInventory() {
  const [adjusting, setAdjusting] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'add', quantity: 1, reason: '', size: '', color: '' });
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => adminService.getAdminProducts({ limit: 100 }).then(r => r.data.data?.products || r.data.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: () => api.get('/admin/inventory/low-stock').then(r => r.data.data),
  });

  const adjustMutation = useMutation({
    mutationFn: (data) => adminService.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-inventory']);
      queryClient.invalidateQueries(['admin-low-stock']);
      toast.success('Stock adjusted successfully');
      setAdjusting(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to adjust stock'),
  });

  const totalValue = products?.reduce((sum, p) => sum + (p.totalStock || 0) * (p.costPrice || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Helmet><title>Inventory Management — Admin</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Inventory Management</h1>
        <p className="text-text-muted text-sm">Monitor stock levels and adjust inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase mb-1">Total Products</p>
          <p className="text-2xl font-bold text-text-primary">{products?.length || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-stock-low">{lowStock?.length || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase mb-1">Stock Value</p>
          <p className="text-2xl font-bold text-premium-gold">Rs.{totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-stock-out">{products?.filter(p => (p.totalStock || 0) === 0).length || 0}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-amber-500" size={20} />
            <h3 className="font-black text-amber-900 uppercase tracking-tight">{lowStock.length} Products Need Urgent Restocking</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.slice(0, 8).map(p => (
              <span key={p._id} className="bg-white border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">{p.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjusting && (
        <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-text-primary mb-4">Adjust Stock — {adjusting.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAdjustForm({...adjustForm, type: 'add'})} className={`py-2 rounded-xl text-sm font-bold transition-all ${adjustForm.type === 'add' ? 'bg-green-600 text-white' : 'bg-light-bg text-text-muted'}`}>
                    <Plus size={14} className="inline mr-1" /> Add Stock
                  </button>
                  <button type="button" onClick={() => setAdjustForm({...adjustForm, type: 'remove'})} className={`py-2 rounded-xl text-sm font-bold transition-all ${adjustForm.type === 'remove' ? 'bg-red-500 text-white' : 'bg-light-bg text-text-muted'}`}>
                    <Minus size={14} className="inline mr-1" /> Remove Stock
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Size</label>
                  <input className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="e.g. M" value={adjustForm.size} onChange={e => setAdjustForm({...adjustForm, size: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Color</label>
                  <input className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="e.g. Black" value={adjustForm.color} onChange={e => setAdjustForm({...adjustForm, color: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Quantity</label>
                <input type="number" min="1" className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" value={adjustForm.quantity} onChange={e => setAdjustForm({...adjustForm, quantity: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Reason</label>
                <input className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="e.g. Purchase, Damage, Return" value={adjustForm.reason} onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    if (!adjustForm.reason) return toast.error('Please provide a reason for the adjustment');
                    adjustMutation.mutate({ productId: adjusting._id, ...adjustForm });
                  }} 
                  disabled={adjustMutation.isLoading} 
                  className="flex-1 btn-dark flex items-center justify-center gap-2"
                >
                  {adjustMutation.isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Adjustment</>}
                </button>
                <button onClick={() => setAdjusting(null)} className="px-4 text-text-muted hover:text-text-primary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Stock Table */}
      <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-light-bg border-b border-border-light">
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">SKU</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Total Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Stock Value</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {isLoading && <tr><td colSpan="5" className="py-12 text-center"><Loader2 className="animate-spin text-premium-gold inline-block" /></td></tr>}
            {products?.map(p => {
              const totalPhysical = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
              const totalAvailable = p.totalStock || 0;
              const stockStatus = totalAvailable === 0 ? 'out' : totalAvailable < (p.lowStockThreshold || 10) ? 'low' : 'in';
              return (
                <tr key={p._id} className="hover:bg-light-bg/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover bg-light-bg shrink-0" />
                      <p className="font-semibold text-text-primary text-sm">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-bold text-text-muted tracking-widest uppercase">{p.sku}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted font-bold">Physical:</span>
                        <span className="font-black text-sm text-charcoal">{totalPhysical}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted font-bold">Available:</span>
                        <span className={`font-black text-sm ${stockStatus === 'out' ? 'text-stock-out' : stockStatus === 'low' ? 'text-stock-low' : 'text-premium-gold'}`}>{totalAvailable}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-charcoal">Rs.{(totalPhysical * (p.costPrice || 0)).toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setAdjusting(p); setAdjustForm({ type: 'add', quantity: 1, reason: '', size: p.variants?.[0]?.size || '', color: p.variants?.[0]?.color || '' }); }} className="bg-charcoal text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-premium-gold transition-all shadow-lg shadow-charcoal/20">
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
