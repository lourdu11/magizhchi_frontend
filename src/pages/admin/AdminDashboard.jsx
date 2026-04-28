import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Eye } from 'lucide-react';
import { adminService } from '../../services';

function StatCard({ icon: Icon, label, value, sub, color = 'text-premium-gold' }) { // eslint-disable-line no-unused-vars

  return (
    <div className="bg-white rounded-xl border border-border-light p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text-muted font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gold-soft`}>
          <Icon size={18} className="text-premium-gold" />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboard().then(r => r.data.data),
    refetchInterval: 60000,
  });

  const { data: salesData } = useQuery({
    queryKey: ['admin-sales', 'monthly'],
    queryFn: () => adminService.getSalesAnalytics({ period: 'monthly' }).then(r => r.data.data.data),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    </div>
  );

  const d = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-xs text-text-muted bg-light-bg px-3 py-2 rounded-lg">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button onClick={() => window.location.href='/admin/products'} className="flex flex-col items-center justify-center p-4 bg-white border border-border-light rounded-xl hover:border-gold-primary hover:shadow-card-hover transition-all group">
          <div className="w-10 h-10 rounded-full bg-gold-soft flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Package size={20} className="text-premium-gold" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Add Product</span>
        </button>
        <button onClick={() => window.location.href='/admin/orders'} className="flex flex-col items-center justify-center p-4 bg-white border border-border-light rounded-xl hover:border-gold-primary hover:shadow-card-hover transition-all group">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag size={20} className="text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Manage Orders</span>
        </button>
        <button onClick={() => window.location.href='/admin/bills'} className="flex flex-col items-center justify-center p-4 bg-white border border-border-light rounded-xl hover:border-gold-primary hover:shadow-card-hover transition-all group">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <span className="text-xs font-semibold text-text-primary">New Bill</span>
        </button>
        <button onClick={() => window.location.href='/admin/users'} className="flex flex-col items-center justify-center p-4 bg-white border border-border-light rounded-xl hover:border-gold-primary hover:shadow-card-hover transition-all group">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Users size={20} className="text-purple-600" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Users</span>
        </button>
        <button onClick={() => window.location.href='/admin/staff'} className="flex flex-col items-center justify-center p-4 bg-white border border-border-light rounded-xl hover:border-gold-primary hover:shadow-card-hover transition-all group">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Users size={20} className="text-orange-600" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Staff</span>
        </button>
        <button onClick={() => window.location.href='/admin/settings'} className="flex flex-col items-center justify-center p-4 bg-white border border-border-light rounded-xl hover:border-gold-primary hover:shadow-card-hover transition-all group">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Eye size={20} className="text-slate-600" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Settings</span>
        </button>
      </div>


      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Today's Revenue" value={`Rs.${(d.revenue?.today || 0).toLocaleString('en-IN')}`} sub={`${d.orders?.todayCount || 0} orders`} />
        <StatCard icon={TrendingUp} label="This Month" value={`Rs.${(d.revenue?.month || 0).toLocaleString('en-IN')}`} sub={`${d.orders?.monthCount || 0} orders`} />
        <StatCard icon={TrendingUp} label="This Year" value={`Rs.${(d.revenue?.year || 0).toLocaleString('en-IN')}`} />
        <StatCard icon={Users} label="Total Customers" value={d.users || 0} />
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Pending" value={d.orders?.pending || 0} color="text-stock-low" />
        <StatCard icon={Package} label="Shipped" value={d.orders?.shipped || 0} color="text-info" />
        <StatCard icon={Package} label="Delivered" value={d.orders?.delivered || 0} color="text-stock-in" />
        <StatCard icon={Package} label="Cancelled" value={d.orders?.cancelled || 0} color="text-stock-out" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="font-semibold text-text-primary mb-4">Monthly Revenue (Rs.)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#999' }} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} />
              <Tooltip formatter={(v) => [`Rs.${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E5' }} />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} dot={{ fill: '#D4AF37', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="font-semibold text-text-primary mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#999' }} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E5' }} />
              <Bar dataKey="orders" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-stock-low" />
            <h3 className="font-semibold text-text-primary">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {d.lowStockProducts?.length === 0 && <p className="text-text-muted text-sm text-center py-4">No low stock items 🎉</p>}
            {d.lowStockProducts?.map(p => (
              <div key={p._id} className="flex items-center gap-3">
                <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-light-bg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.sku}</p>
                </div>
                <span className="badge-warning shrink-0">Low Stock</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="font-semibold text-text-primary mb-4">Recent Orders</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {d.recentOrders?.map(order => (
              <div key={order._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-gradient flex items-center justify-center text-premium-gold text-xs font-bold shrink-0">
                  {order.userId?.name?.[0] || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">#{order.orderNumber}</p>
                  <p className="text-xs text-text-muted">{order.userId?.name || 'Guest'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-premium-gold">Rs.{order.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                  <span className={`text-xs font-medium ${
                    order.orderStatus === 'delivered' ? 'text-stock-in' :
                    order.orderStatus === 'cancelled' ? 'text-stock-out' :
                    order.orderStatus === 'shipped' ? 'text-info' : 'text-stock-low'
                  }`}>{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
