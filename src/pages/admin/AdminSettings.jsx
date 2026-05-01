import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, ShieldCheck, Truck, Globe, Share2, CreditCard, Wallet, Percent, BellRing, Mail, Smartphone } from 'lucide-react';
import { adminService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminService.getSettings().then(r => r.data.data),
  });

  const [formData, setFormData] = useState({
    store: { name: '', email: '', phone: '', address: '', gstin: '' },
    payment: { onlineEnabled: true, codEnabled: true, codCharges: 50, codThreshold: 50000 },
    shipping: { flatRateTN: 50, flatRateOut: 100, freeShippingThreshold: 999 },
    notifications: {
      email: { host: '', port: 587, user: '', password: '', alertEmail: '' },
      whatsapp: { adminPhone: '' },
      lowStockAlert: { enabled: true, method: 'whatsapp' }
    },
    seo: { metaTitle: '', metaDescription: '' }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...formData,
        ...settings,
        store: { ...formData.store, ...(settings.store || {}) },
        payment: { ...formData.payment, ...(settings.payment || {}) },
        shipping: { ...formData.shipping, ...(settings.shipping || {}) },
        notifications: { 
          email: { 
            host: settings.notifications?.email?.host || '', 
            port: settings.notifications?.email?.port || 587, 
            user: settings.notifications?.email?.user || '', 
            password: '' // Always keep password field empty in UI for security
          },
          whatsapp: { 
            adminPhone: settings.notifications?.whatsapp?.adminPhone || settings.store?.phone || '' 
          },
          lowStockAlert: {
            enabled: settings.notifications?.lowStockAlert?.enabled ?? true,
            method: settings.notifications?.lowStockAlert?.method || 'whatsapp'
          }
        },
        seo: { ...formData.seo, ...(settings.seo || {}) },
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data) => adminService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => toast.error('Failed to update settings'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading || !formData) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-premium-gold" size={48} />
    </div>
  );

  const updateStore = (k, v) => setFormData({ ...formData, store: { ...formData.store, [k]: v } });
  const updatePayment = (k, v) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...(prev.payment || {}), [k]: v }
    }));
  };
  const updateShipping = (k, v) => setFormData({ ...formData, shipping: { ...formData.shipping, [k]: v } });
  const updateEmail = (k, v) => setFormData({ ...formData, notifications: { ...formData.notifications, email: { ...formData.notifications.email, [k]: v } } });
  const updateWhatsApp = (k, v) => setFormData({ ...formData, notifications: { ...formData.notifications, whatsapp: { ...formData.notifications.whatsapp, [k]: v } } });

  return (
    <div className="space-y-8">
      <Helmet><title>Store Settings — Admin</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">Store Settings</h1>
          <p className="text-text-muted font-medium">Configure your global store preferences and logic.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="bg-charcoal text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest shadow-2xl shadow-charcoal/20 hover:bg-premium-gold transition-all flex items-center gap-3"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save All Changes</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'General Info', icon: Globe },
            { id: 'payment', label: 'Payment & COD', icon: Wallet },
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'notifications', label: 'Notifications', icon: BellRing },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-premium-gold text-charcoal shadow-lg shadow-premium-gold/20' : 'bg-white text-text-muted hover:bg-light-bg'}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-border-light p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Store Name</span>
                    <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" value={formData.store.name} onChange={e => updateStore('name', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Support Email</span>
                    <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" value={formData.store.email} onChange={e => updateStore('email', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Store Phone</span>
                    <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" value={formData.store.phone} onChange={e => updateStore('phone', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Store GSTIN</span>
                    <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" value={formData.store.gstin} onChange={e => updateStore('gstin', e.target.value)} />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Store Address</span>
                  <textarea rows="3" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-medium resize-none" value={formData.store.address} onChange={e => updateStore('address', e.target.value)} />
                </label>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                {/* Online Payment Switch */}
                <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => updatePayment('onlineEnabled', !formData.payment?.onlineEnabled)}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 flex items-center p-1 ${formData.payment?.onlineEnabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-300'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 transform ${formData.payment?.onlineEnabled ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                      </button>
                      <div>
                        <h3 className="font-black text-charcoal uppercase tracking-tighter">Enable Online Payments</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Master toggle for UPI/Card/NetBanking at checkout</p>
                      </div>
                    </div>
                    <CreditCard className={formData.payment?.onlineEnabled ? 'text-blue-600' : 'text-gray-300'} size={32} />
                  </div>
                </div>

                {/* COD Switch */}
                <div className="p-6 bg-gold-soft/30 rounded-[2rem] border border-premium-gold/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => updatePayment('codEnabled', !formData.payment?.codEnabled)}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 flex items-center p-1 ${formData.payment?.codEnabled ? 'bg-premium-gold shadow-lg shadow-premium-gold/30' : 'bg-gray-300'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 transform ${formData.payment?.codEnabled ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                      </button>
                      <div>
                        <h3 className="font-black text-charcoal uppercase tracking-tighter">Enable Cash on Delivery (COD)</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Toggle to allow/disallow COD globally at checkout</p>
                      </div>
                    </div>
                    <Wallet className={formData.payment?.codEnabled ? 'text-premium-gold' : 'text-gray-300'} size={32} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">COD Extra Charges (₹)</span>
                    <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.payment.codCharges} onChange={e => updatePayment('codCharges', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Max Order Amount for COD (₹)</span>
                    <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.payment.codThreshold} onChange={e => updatePayment('codThreshold', e.target.value)} />
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Tamil Nadu Shipping (Local) (₹)</span>
                    <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.shipping.flatRateTN} onChange={e => updateShipping('flatRateTN', e.target.value)} />
                    <p className="text-[9px] text-premium-gold mt-2 font-bold uppercase">Applied for orders within Tamil Nadu</p>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Other States Shipping (National) (₹)</span>
                    <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.shipping.flatRateOut} onChange={e => updateShipping('flatRateOut', e.target.value)} />
                    <p className="text-[9px] text-text-muted mt-2 font-bold uppercase">Applied for all other states in India</p>
                  </label>
                </div>
                
                <label className="block max-w-md">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Free Shipping Above (₹)</span>
                  <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-lg" value={formData.shipping.freeShippingThreshold} onChange={e => updateShipping('freeShippingThreshold', e.target.value)} />
                </label>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                {/* WhatsApp Section */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 border-b border-border-light pb-4">
                      <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center text-[#25D366]">
                         <Smartphone size={20} />
                      </div>
                      <div>
                         <h3 className="font-black text-charcoal uppercase tracking-tighter">WhatsApp Notifications</h3>
                         <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Admin alerts and order updates</p>
                      </div>
                   </div>
                   <label className="block max-w-md">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Admin Notification Number</span>
                      <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#25D366]/30 font-black text-lg" 
                        value={formData.notifications.whatsapp.adminPhone} 
                        onChange={e => updateWhatsApp('adminPhone', e.target.value)} 
                        placeholder="7358885452" />
                      <p className="text-[9px] text-text-muted mt-2 font-bold uppercase">This number will receive all order and contact alerts</p>
                   </label>
                </div>

                {/* Email Section */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 border-b border-border-light pb-4">
                      <div className="w-10 h-10 bg-premium-gold/10 rounded-xl flex items-center justify-center text-premium-gold">
                         <Mail size={20} />
                      </div>
                      <div>
                         <h3 className="font-black text-charcoal uppercase tracking-tighter">Email SMTP Settings</h3>
                         <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Configure outgoing mail server</p>
                      </div>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                      <label className="block">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">SMTP Host</span>
                         <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" 
                           value={formData.notifications.email.host} 
                           onChange={e => updateEmail('host', e.target.value)} 
                           placeholder="smtp.gmail.com" />
                      </label>
                      <label className="block">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">SMTP Port</span>
                         <input type="number" className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" 
                           value={formData.notifications.email.port} 
                           onChange={e => updateEmail('port', e.target.value)} 
                           placeholder="587" />
                      </label>
                      <label className="block">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">SMTP User</span>
                         <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" 
                           value={formData.notifications.email.user} 
                           onChange={e => updateEmail('user', e.target.value)} 
                           placeholder="your-email@gmail.com" />
                      </label>
                      <label className="block">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">SMTP Password</span>
                         <input type="password" title="SMTP Password" name="smtp-password"
                           className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" 
                           value={formData.notifications.email.password} 
                           onChange={e => updateEmail('password', e.target.value)} 
                           placeholder="••••••••••••" />
                      </label>
                   </div>
                    <div className="p-4 bg-light-bg rounded-2xl border border-dashed border-border-dark/20 text-center">
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">Note: For Gmail, use an "App Password" if 2FA is enabled.</p>
                    </div>
                 </div>

                 {/* Low Stock Section */}
                 <div className="space-y-6 pt-6 border-t border-border-light">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                             <Percent size={20} />
                          </div>
                          <div>
                             <h3 className="font-black text-charcoal uppercase tracking-tighter">Low Stock Auto Alerts</h3>
                             <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Get notified when inventory is low</p>
                          </div>
                       </div>
                       <button 
                         type="button"
                         onClick={() => setFormData({ ...formData, notifications: { ...formData.notifications, lowStockAlert: { ...formData.notifications.lowStockAlert, enabled: !formData.notifications.lowStockAlert?.enabled } } })}
                         className={`w-14 h-8 rounded-full relative transition-all duration-300 flex items-center p-1 ${formData.notifications.lowStockAlert?.enabled ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-gray-300'}`}
                       >
                         <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 transform ${formData.notifications.lowStockAlert?.enabled ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                       </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <label className="block">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Alert Email</span>
                          <input className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-bold" 
                            value={formData.notifications.email.alertEmail || ''} 
                            onChange={e => setFormData({ ...formData, notifications: { ...formData.notifications, email: { ...formData.notifications.email, alertEmail: e.target.value } } })} 
                            placeholder="alerts@magizhchi.in" />
                       </label>
                       <label className="block">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Notification Method</span>
                          <select className="w-full bg-light-bg border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-premium-gold/30 font-black text-sm appearance-none" 
                            value={formData.notifications.lowStockAlert?.method || 'whatsapp'} 
                            onChange={e => setFormData({ ...formData, notifications: { ...formData.notifications, lowStockAlert: { ...formData.notifications.lowStockAlert, method: e.target.value } } })}>
                             <option value="whatsapp">WhatsApp Only</option>
                             <option value="email">Email Only</option>
                             <option value="both">Both WhatsApp & Email</option>
                          </select>
                       </label>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => toast.promise(adminService.updateSettings({...formData, testAlert: true}), {
                        loading: 'Sending test alert...',
                        success: 'Test alert triggered!',
                        error: 'Failed to send test alert'
                      })}
                      className="px-6 py-3 bg-light-bg text-charcoal border border-border-light rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-premium-gold transition-all"
                    >
                      Send Test Alert
                    </button>
                 </div>
               </motion.div>
            )}


          </form>
        </div>
      </div>
    </div>
  );
}
