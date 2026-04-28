import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Download, Calendar, Filter, Loader2, IndianRupee, PieChart as PieChartIcon, Layers, Sparkles, Users, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminService } from '../../services';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Custom hook for ultra-reliable element measurement
function useMeasure() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const update = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();
        setDimensions(prev => {
          if (Math.abs(prev.width - width) < 0.1 && Math.abs(prev.height - height) < 0.1) return prev;
          return { width, height };
        });
      }
    };

    const observer = new ResizeObserver(update);
    observer.observe(ref.current);
    
    // Immediate update for initial paint
    requestAnimationFrame(update);

    return () => observer.disconnect();
  }, []);

  return [ref, dimensions];
}

const COLORS = ['#D4AF37', '#1A1A1A', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('monthly');
  const [hasMounted, setHasMounted] = useState(false);
  const [lineChartRef, { width: lineChartWidth }] = useMeasure();
  const [pieChartRef, { width: pieChartWidth }] = useMeasure();
  const [barChartRef, { width: barChartWidth }] = useMeasure();
  const [regionChartRef, { width: regionChartWidth }] = useMeasure();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminService.getSalesAnalytics({ period }).then(r => r.data.data),
  });

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return toast.error('No data to export');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-premium-gold" size={40} /></div>;

  const chartData = analytics?.data || [];
  const categoryData = analytics?.categoryData || [];
  const paymentData = analytics?.paymentData || [];
  const topProducts = analytics?.topProducts || [];
  const topCustomers = analytics?.topCustomers || [];
  const locationData = analytics?.locationData || [];
  const summary = analytics?.summary || { totalRevenue: 0, totalOrders: 0, growth: 0 };

  return (
    <div className="space-y-10 pb-20">
      <Helmet><title>Analytics Command Center — Admin</title></Helmet>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-8 rounded-[3rem] border border-border-light shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-premium-gold/10 rounded-2xl flex items-center justify-center text-premium-gold">
               <TrendingUp size={22} />
            </div>
            <h1 className="text-3xl font-black text-charcoal tracking-tight">Business Intelligence</h1>
          </div>
          <p className="text-text-muted text-sm font-medium">Real-time performance tracking & sales analytics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-light-bg p-1.5 rounded-2xl flex gap-1">
            {['daily', 'monthly', 'yearly'].map(p => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-charcoal text-white shadow-xl' : 'text-text-muted hover:text-charcoal'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={() => downloadCSV(chartData, `magizhchi_sales_${period}`)}
            className="flex items-center gap-2 bg-premium-gold text-charcoal px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-premium-gold/20"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: `₹${summary.totalRevenue.toLocaleString()}`, growth: `${summary.growth}%`, icon: IndianRupee, color: 'text-premium-gold', bg: 'bg-premium-gold/5' },
          { label: 'Total Orders', value: summary.totalOrders, growth: 'Stable', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Order Value', value: `₹${Math.round(summary.totalRevenue / summary.totalOrders || 0).toLocaleString()}`, growth: 'Live', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Customer Growth', value: topCustomers.length, growth: '+2.4%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-border-light shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${parseFloat(stat.growth) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {parseFloat(stat.growth) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.growth}
              </div>
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h2 className="text-3xl font-black text-charcoal tracking-tighter">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-border-light shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3 uppercase text-[12px] tracking-[0.2em]">
               <Calendar size={18} className="text-premium-gold" /> Revenue Over Time
             </h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-premium-gold" />
                   <span className="text-[10px] font-black uppercase text-text-muted">Revenue</span>
                </div>
             </div>
          </div>
          <div ref={lineChartRef} className="h-[400px] w-full">
            {hasMounted && lineChartWidth > 0 && (
              <LineChart width={lineChartWidth} height={400} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fontWeight: 900, fill: '#1A1A1A' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#999' }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={5} dot={{ fill: '#D4AF37', r: 6, strokeWidth: 3, stroke: '#FFF' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-10 rounded-[3rem] border border-border-light shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3 uppercase text-[12px] tracking-[0.2em] mb-10">
             <PieChartIcon size={18} className="text-premium-gold" /> Payment Split
          </h3>
          <div ref={pieChartRef} className="h-[250px] w-full flex items-center justify-center">
            {hasMounted && pieChartWidth > 0 && (
              <PieChart width={pieChartWidth} height={250}>
                <Pie data={paymentData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="revenue" stroke="none">
                  {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </div>
          <div className="w-full space-y-3 mt-8">
            {paymentData.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-light-bg rounded-2xl border border-transparent hover:border-premium-gold/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">{p._id || 'COD'}</span>
                </div>
                <span className="text-xs font-black text-charcoal">₹{p.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* Category Performance */}
         <div className="bg-white p-10 rounded-[3rem] border border-border-light shadow-sm">
            <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3 uppercase text-[12px] tracking-[0.2em] mb-10">
               <Layers size={18} className="text-premium-gold" /> Category Performance
            </h3>
            <div ref={barChartRef} className="h-[300px] w-full">
               {hasMounted && barChartWidth > 0 && (
                  <BarChart width={barChartWidth} height={300} data={categoryData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" vertical={false} />
                     <XAxis dataKey="_id" tick={{ fontSize: 10, fontWeight: 900, fill: '#1A1A1A' }} axisLine={false} tickLine={false} />
                     <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#999' }} axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontWeight: 900 }} />
                     <Bar dataKey="revenue" fill="#D4AF37" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
               )}
            </div>
         </div>

         {/* Regional Performance */}
         <div className="bg-white p-10 rounded-[3rem] border border-border-light shadow-sm">
            <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3 uppercase text-[12px] tracking-[0.2em] mb-10">
               <MapPin size={18} className="text-premium-gold" /> Geographical Sales
            </h3>
            <div ref={regionChartRef} className="h-[300px] w-full">
               {hasMounted && regionChartWidth > 0 && (
                  <BarChart width={regionChartWidth} height={300} data={locationData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="_id" type="category" tick={{ fontSize: 10, fontWeight: 900, fill: '#1A1A1A' }} width={100} axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontWeight: 900 }} />
                     <Bar dataKey="revenue" fill="#1A1A1A" radius={[0, 10, 10, 0]} barSize={30} />
                  </BarChart>
               )}
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* VIP Customers */}
         <div className="bg-white p-10 rounded-[3rem] border border-border-light shadow-sm">
            <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3 uppercase text-[12px] tracking-[0.2em] mb-10">
               <Users size={18} className="text-premium-gold" /> VIP Customers
            </h3>
            <div className="space-y-4">
               {topCustomers.map((customer, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-light-bg/50 rounded-3xl border border-border-light hover:bg-white transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-charcoal text-white rounded-2xl flex items-center justify-center font-black">
                           {customer.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-charcoal uppercase tracking-tight">{customer.name}</p>
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-0.5">{customer.orders} Successful Orders</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-charcoal">₹{customer.totalSpent.toLocaleString()}</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">High Value</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Bestselling Products */}
         <div className="bg-white p-10 rounded-[3rem] border border-border-light shadow-sm">
            <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3 uppercase text-[12px] tracking-[0.2em] mb-10">
               <Sparkles size={18} className="text-premium-gold" /> Product Leaderboard
            </h3>
            <div className="space-y-4">
               {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-light-bg/50 rounded-3xl border border-border-light hover:bg-white transition-all group hover:shadow-xl">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-premium-gold border border-border-light shadow-sm group-hover:scale-110 transition-transform">
                           #{i + 1}
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-charcoal uppercase tracking-tight line-clamp-1">{p._id}</p>
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-0.5">{p.sales} Units Sold</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-charcoal">₹{p.revenue.toLocaleString()}</p>
                        <div className="w-24 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-premium-gold rounded-full" style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }} />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
