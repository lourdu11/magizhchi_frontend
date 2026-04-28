import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Loader2, X, Save, Mail, Phone } from 'lucide-react';
import { adminService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';

export default function AdminStaff() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => api.get('/admin/staff').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminService.createStaff({ ...data, role: 'staff' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-staff']);
      toast.success('Staff account created');
      setShowAdd(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create staff'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/staff/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-staff']); toast.success('Staff removed'); },
  });

  return (
    <div className="space-y-6">
      <Helmet><title>Staff Management — Admin</title></Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Staff Management</h1>
          <p className="text-text-muted text-sm">Manage offline billing staff accounts</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          {showAdd ? <X size={18} /> : <><UserPlus size={18} /> Add Staff</>}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
          <h3 className="font-bold text-text-primary mb-4">Create Staff Account</h3>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Full Name</label>
              <input required className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="Ravi Kumar" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Email</label>
              <input required type="email" className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="ravi@magizhchi.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Phone</label>
              <input type="tel" className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="+91 9XXXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Password</label>
              <input required type="password" minLength="6" className="w-full bg-light-bg border border-border-light rounded-xl px-4 py-2.5 focus:outline-none" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex gap-3">
              <button type="submit" disabled={createMutation.isLoading} className="btn-dark flex items-center gap-2 px-6 py-2.5">
                {createMutation.isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Create Account</>}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-text-muted hover:text-text-primary px-4">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-premium-gold" size={32} /></div>}
        {staff?.length === 0 && <div className="col-span-full py-12 text-center text-text-muted">No staff accounts found. Add your first staff member.</div>}
        {staff?.map(s => (
          <div key={s._id} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-xl bg-dark-gradient flex items-center justify-center text-premium-gold font-bold text-xl shrink-0">
              {s.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text-primary">{s.name}</p>
              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><Mail size={10} /> {s.email}</p>
              {s.phone && <p className="text-xs text-text-muted flex items-center gap-1"><Phone size={10} /> {s.phone}</p>}
              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">STAFF</span>
            </div>
            <button
              onClick={() => { if (window.confirm(`Delete ${s.name}'s account?`)) deleteMutation.mutate(s._id); }}
              className="p-2 text-text-muted hover:text-stock-out hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
