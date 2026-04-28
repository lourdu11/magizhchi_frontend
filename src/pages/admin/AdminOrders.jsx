import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Search, Filter, Download, ChevronDown, Loader2 } from 'lucide-react';
import { adminService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const STATUS_OPTIONS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-amber-50 text-amber-700',
  out_for_delivery: 'bg-orange-50 text-orange-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-purple-50 text-purple-700',
};

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: () => adminService.getAllOrders({ search, status: statusFilter }).then(r => r.data),
  });

  const orders = data?.data?.orders || data?.data || [];
  const total = data?.pagination?.total || orders.length;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => adminService.updateOrderStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin-orders']); toast.success('Order status updated'); setUpdatingId(null); },
    onError: () => toast.error('Failed to update status'),
  });

  const downloadCSV = () => {
    if (!orders.length) return;
    const headers = ['Order #', 'Customer', 'Email', 'Amount', 'Status', 'Payment', 'Date'];
    const rows = orders.map(o => [o.orderNumber, o.userId?.name || 'Guest', o.userId?.email || o.guestDetails?.email || '-', o.pricing?.totalAmount, o.orderStatus, o.paymentMethod, new Date(o.createdAt).toLocaleDateString('en-IN')]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Orders — Admin</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ShoppingBag size={22} className="text-premium-gold" /> All Orders
          </h1>
          <p className="text-text-muted text-sm">{total} total orders</p>
        </div>
        <button onClick={downloadCSV} className="btn-dark flex items-center gap-2 self-start py-2 px-4 text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input className="w-full bg-white border border-border-light rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-premium-gold text-sm" placeholder="Search by order # or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <select className="appearance-none bg-white border border-border-light rounded-xl pl-9 pr-8 py-2.5 focus:outline-none text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
        </div>
      </div>

      {/* Status Summary Chips */}
      <div className="flex gap-2 flex-wrap">
        {['placed', 'shipped', 'delivered', 'cancelled'].map(s => {
          const count = orders.filter(o => o.orderStatus === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${statusFilter === s ? 'bg-charcoal text-white' : STATUS_COLORS[s]}`}>
              {s}: {count}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-light-bg border-b border-border-light">
                {['Order #', 'Customer', 'Items', 'Amount', 'Status', 'Payment', 'Date', 'Update Status'].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-bold text-text-muted uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading && (
                <tr><td colSpan="8" className="px-5 py-12 text-center"><Loader2 className="animate-spin text-premium-gold inline-block" /></td></tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr><td colSpan="8" className="px-5 py-12 text-center text-text-muted">No orders found.</td></tr>
              )}
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-light-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-premium-gold text-sm">#{o.orderNumber}</p>
                    <p className="text-[10px] text-text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-text-primary text-sm">{o.userId?.name || 'Guest'}</p>
                    <p className="text-xs text-text-muted truncate max-w-[160px]">{o.userId?.email || o.guestDetails?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-muted">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-text-primary">Rs.{o.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_COLORS[o.orderStatus] || 'bg-gray-50 text-gray-600'}`}>
                      {o.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-text-muted capitalize">{o.paymentMethod}</span>
                    <span className={`ml-1 text-[10px] font-bold ${o.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                      · {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    {!['delivered', 'cancelled', 'returned'].includes(o.orderStatus) ? (
                      <div className="relative">
                        <select
                          className="appearance-none bg-light-bg border border-border-light rounded-lg px-3 py-1.5 text-xs focus:outline-none pr-6 cursor-pointer"
                          value={o.orderStatus}
                          disabled={updateStatus.isLoading && updatingId === o._id}
                          onChange={e => { setUpdatingId(o._id); updateStatus.mutate({ id: o._id, status: e.target.value }); }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" size={10} />
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted italic">Finalized</span>
                    )}
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
