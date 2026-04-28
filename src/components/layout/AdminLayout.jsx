import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart2, Settings, FileText, Tag, Image, UserCog, Boxes, LogOut, ChevronLeft, ChevronRight, Menu, RefreshCcw, Star } from 'lucide-react';

import { useState } from 'react';
import { useAuthStore } from '../../store';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Boxes, label: 'Inventory', path: '/admin/inventory' },
  { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
  { icon: FileText, label: 'Offline Bills', path: '/admin/bills' },

  { icon: Users, label: 'Customers', path: '/admin/users' },
  { icon: UserCog, label: 'Staff', path: '/admin/staff' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },


  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-light-bg flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} shrink-0 bg-charcoal flex flex-col transition-all duration-300 fixed h-full z-30`}>
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-white/10`}>
          {!collapsed && (
            <div>
              <div className="font-display text-lg font-bold text-white tracking-widest">MAGIZHCHI</div>
              <div className="text-[9px] text-white/30 tracking-[0.4em]">ADMIN</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/40 hover:text-premium-gold transition-colors">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, path }) => { // eslint-disable-line no-unused-vars
            const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-150 group ${active ? 'bg-premium-gold/20 border-r-2 border-premium-gold text-premium-gold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`border-t border-white/10 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="mb-3">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-white/40 text-xs">Administrator</p>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 hover:text-stock-out transition-colors">
            <LogOut size={16} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-56'} transition-all duration-300 min-h-screen`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
