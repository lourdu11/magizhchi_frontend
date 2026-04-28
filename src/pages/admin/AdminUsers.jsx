import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, ShieldOff, Download, Eye, Loader2, Mail, Phone } from 'lucide-react';
import { adminService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminService.getAllUsers({ search }).then(r => r.data.data),
  });
  const users = usersData?.users || usersData || [];


  const blockMutation = useMutation({
    mutationFn: (id) => adminService.toggleBlockUser(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-users']); toast.success('User status updated'); },
  });

  const downloadCSV = () => {
    if (!users?.length) return;
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'];
    const rows = users.map(u => [u.name, u.email, u.phone || '-', u.role, u.isBlocked ? 'Blocked' : 'Active', new Date(u.createdAt).toLocaleDateString('en-IN')]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Customers — Admin</title></Helmet>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-text-muted text-sm">{users?.length || 0} registered customers</p>
        </div>
        <button onClick={downloadCSV} className="btn-dark flex items-center gap-2 self-start py-2 px-4 text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          className="w-full bg-white border border-border-light rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-premium-gold"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-light-bg border-b border-border-light">
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase hidden md:table-cell">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {isLoading && <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="animate-spin inline-block text-premium-gold" /></td></tr>}
            {users?.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-text-muted">No customers found.</td></tr>}
            {users?.map(user => (
              <tr key={user._id} className="hover:bg-light-bg/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-gradient flex items-center justify-center text-premium-gold font-bold text-sm shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{user.name}</p>
                      <p className="text-xs text-text-muted">{user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-1 text-text-muted"><Mail size={10} /> {user.email}</p>
                    <p className="text-xs flex items-center gap-1 text-text-muted"><Phone size={10} /> {user.phone || '—'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <p className="text-sm text-text-muted">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${user.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { if (window.confirm(`${user.isBlocked ? 'Unblock' : 'Block'} ${user.name}?`)) blockMutation.mutate(user._id); }}
                      className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                      title={user.isBlocked ? 'Unblock User' : 'Block User'}
                    >
                      {user.isBlocked ? <Shield size={16} /> : <ShieldOff size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
