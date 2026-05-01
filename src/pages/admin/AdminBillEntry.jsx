import { useState, useEffect } from 'react';
import { 
  Save, Plus, Trash2, Calculator, Calendar, Clock, User, 
  Store, Receipt, IndianRupee, Tag, FileText, ShoppingBag,
  Printer, Download, CheckCircle2, AlertCircle, Info, ChevronRight, X
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { billService, productService, categoryService } from '../../services';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AdminBillEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- Initial State ---
  const [billData, setBillData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    billTime: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
    customerDetails: { name: 'Walk-in Customer', phone: '', email: '' },
    taxType: 'composition', // Default from user prompt
    paymentMethod: 'cash',
    notes: 'Goods once sold can\'t be taken back. No exchange and refund.',
    shopInfo: {
      name: 'Infinity Fashions',
      address: 'Old Bus Stand, Thanjavur - 613006',
      gst: '33FZWPD8703E1Z8'
    },
    items: [
      { productName: '', quantity: 1, price: 0, total: 0 }
    ],
    pricing: {
      subtotal: 0,
      discount: 0,
      discountType: 'offer',
      roundOff: 0,
      totalAmount: 0
    }
  });

  // --- Calculations ---
  useEffect(() => {
    const subtotal = billData.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    
    let discAmt = Number(billData.pricing.discount);
    if (billData.pricing.discountType === 'percentage') {
      discAmt = (subtotal * discAmt) / 100;
    } else if (billData.pricing.discountType === 'offer') {
      // In "Offer" mode, if discount is 0 or matches subtotal, it might mean 100% off as per sample
      if (discAmt === 0 && subtotal > 0) discAmt = subtotal; 
    }

    const total = subtotal - discAmt + Number(billData.pricing.roundOff);

    setBillData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, subtotal, totalAmount: total > 0 ? total : 0 }
    }));
  }, [billData.items, billData.pricing.discount, billData.pricing.discountType, billData.pricing.roundOff]);

  // --- Handlers ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...billData.items];
    newItems[index][field] = value;
    if (field === 'price' || field === 'quantity') {
      newItems[index].total = Number(newItems[index].price) * Number(newItems[index].quantity);
    }
    setBillData({ ...billData, items: newItems });
  };

  const addItem = () => {
    setBillData({
      ...billData,
      items: [...billData.items, { productName: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (billData.items.length === 1) return;
    const newItems = billData.items.filter((_, i) => i !== index);
    setBillData({ ...billData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (billData.items.some(i => !i.productName || i.price <= 0)) {
      return toast.error('Please fill all item details correctly');
    }

    setLoading(true);
    try {
      // Combine date and time
      const finalDate = new Date(`${billData.billDate}T${billData.billTime}`);
      
      const payload = {
        ...billData,
        billDate: finalDate,
        discount: billData.pricing.discount,
        discountType: billData.pricing.discountType,
        roundOff: billData.pricing.roundOff
      };

      await billService.createBill(payload);
      toast.success('Manual bill entry saved successfully!');
      navigate('/admin/bills');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  // --- Auto-fill Sample Data for Demo ---
  const autofillSample = () => {
    setBillData({
      ...billData,
      billNumber: '1852',
      billDate: '2026-04-14',
      billTime: '11:05',
      items: [
        { productName: 'OFFER Shirt', quantity: 1, price: 650, total: 650 },
        { productName: 'Jeans Pant 900', quantity: 1, price: 900, total: 900 }
      ],
      pricing: {
        ...billData.pricing,
        discount: 1550,
        discountType: 'offer',
        roundOff: 0
      }
    });
    toast.success('Sample bill data loaded!');
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <Helmet><title>Manual Bill Entry — Admin</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-charcoal tracking-tighter uppercase mb-2">Manual Bill Entry</h1>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-premium-gold" /> Record Printed Receipts & Historical Sales
          </p>
        </div>
        <div className="flex gap-3">
           <button onClick={autofillSample} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2">
              <Sparkles size={14} /> Load Sample (1852)
           </button>
           <button onClick={() => navigate('/admin/bills')} className="px-6 py-3 bg-light-bg text-charcoal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all border border-border-light shadow-sm">
              View History
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bill & Customer Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shop & Bill Info Card */}
          <div className="bg-white rounded-[2.5rem] border border-border-light p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-premium-gold/10 text-premium-gold rounded-2xl flex items-center justify-center">
                  <Store size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-charcoal uppercase tracking-tight">Bill Identity</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Shop & Invoice Numbers</p>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Manual Bill Number</label>
                    <input 
                      required 
                      className="w-full bg-light-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-black text-sm" 
                      placeholder="e.g. 1852" 
                      value={billData.billNumber}
                      onChange={e => setBillData({...billData, billNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Bill Date</label>
                      <input 
                        type="date" 
                        required 
                        className="w-full bg-light-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-bold text-sm" 
                        value={billData.billDate}
                        onChange={e => setBillData({...billData, billDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Bill Time</label>
                      <input 
                        type="time" 
                        required 
                        className="w-full bg-light-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-bold text-sm" 
                        value={billData.billTime}
                        onChange={e => setBillData({...billData, billTime: e.target.value})}
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Shop Name (Override)</label>
                    <input 
                      className="w-full bg-light-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-premium-gold/30 transition-all font-bold text-sm" 
                      value={billData.shopInfo.name}
                      onChange={e => setBillData({...billData, shopInfo: {...billData.shopInfo, name: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Tax Type / GST Note</label>
                    <select 
                      className="w-full bg-light-bg border-none rounded-2xl px-6 py-4 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-premium-gold/30"
                      value={billData.taxType}
                      onChange={e => setBillData({...billData, taxType: e.target.value})}
                    >
                       <option value="regular">Regular GST (5%)</option>
                       <option value="composition">Composition Scheme</option>
                       <option value="none">Non-GST / Cash Bill</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          {/* Product Items Table Card */}
          <div className="bg-white rounded-[2.5rem] border border-border-light p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-charcoal/5 text-charcoal rounded-2xl flex items-center justify-center">
                      <ShoppingBag size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-charcoal uppercase tracking-tight">Product Breakdown</h3>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Add items from receipt</p>
                   </div>
                </div>
                <button type="button" onClick={addItem} className="px-5 py-2 bg-charcoal text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-premium-gold hover:text-charcoal transition-all flex items-center gap-2">
                   <Plus size={14} /> Add Row
                </button>
             </div>

             <div className="space-y-4">
                {billData.items.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={index} 
                    className="grid grid-cols-12 gap-4 items-end bg-light-bg/30 p-4 rounded-2xl border border-transparent hover:border-border-light transition-all group"
                  >
                     <div className="col-span-12 md:col-span-5 space-y-1.5">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Product Description</label>
                        <input 
                          required 
                          className="w-full bg-white border border-border-light rounded-xl px-4 py-3 focus:ring-2 focus:ring-premium-gold/30 transition-all font-bold text-sm" 
                          placeholder="Item Name" 
                          value={item.productName}
                          onChange={e => handleItemChange(index, 'productName', e.target.value)}
                        />
                     </div>
                     <div className="col-span-4 md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Qty</label>
                        <input 
                          type="number" 
                          required 
                          className="w-full bg-white border border-border-light rounded-xl px-4 py-3 focus:ring-2 focus:ring-premium-gold/30 transition-all font-black text-sm" 
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                        />
                     </div>
                     <div className="col-span-4 md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Rate (₹)</label>
                        <input 
                          type="number" 
                          required 
                          className="w-full bg-white border border-border-light rounded-xl px-4 py-3 focus:ring-2 focus:ring-premium-gold/30 transition-all font-black text-sm" 
                          value={item.price}
                          onChange={e => handleItemChange(index, 'price', Number(e.target.value))}
                        />
                     </div>
                     <div className="col-span-3 md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Total</label>
                        <div className="w-full bg-white border border-border-light rounded-xl px-4 py-3 font-black text-sm text-charcoal">
                           ₹{item.total || 0}
                        </div>
                     </div>
                     <div className="col-span-1 flex justify-center pb-2">
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)} 
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </motion.div>
                ))}
             </div>

             <div className="mt-8 flex items-center justify-between p-6 bg-charcoal text-white rounded-3xl shadow-xl shadow-charcoal/10">
                <div className="flex gap-8">
                   <div>
                      <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1">Items Count</p>
                      <p className="text-xl font-black">{billData.items.length}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1">Total Qty</p>
                      <p className="text-xl font-black">{billData.items.reduce((s, i) => s + i.quantity, 0)}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Subtotal (Gross)</p>
                   <p className="text-3xl font-black tracking-tighter">₹{billData.pricing.subtotal.toLocaleString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Customer & Summary */}
        <div className="space-y-8">
          
          {/* Customer Info */}
          <div className="bg-white rounded-[2.5rem] border border-border-light p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                   <User size={20} />
                </div>
                <h3 className="text-sm font-black text-charcoal uppercase tracking-tight">Customer Context</h3>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Client Name</label>
                  <input 
                    className="w-full bg-light-bg border-none rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-sm" 
                    value={billData.customerDetails.name}
                    onChange={e => setBillData({...billData, customerDetails: {...billData.customerDetails, name: e.target.value}})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Contact Number</label>
                  <input 
                    className="w-full bg-light-bg border-none rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-sm" 
                    placeholder="Optional"
                    value={billData.customerDetails.phone}
                    onChange={e => setBillData({...billData, customerDetails: {...billData.customerDetails, phone: e.target.value}})}
                  />
                </div>
             </div>
          </div>

          {/* Payment & Adjustments */}
          <div className="bg-white rounded-[2.5rem] border border-border-light p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                   <IndianRupee size={20} />
                </div>
                <h3 className="text-sm font-black text-charcoal uppercase tracking-tight">Adjustments</h3>
             </div>

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Disc Type</label>
                      <select 
                        className="w-full bg-light-bg border-none rounded-xl px-4 py-3.5 font-black text-[10px] uppercase tracking-widest"
                        value={billData.pricing.discountType}
                        onChange={e => setBillData({...billData, pricing: {...billData.pricing, discountType: e.target.value}})}
                      >
                         <option value="flat">Flat Amount</option>
                         <option value="percentage">% Percentage</option>
                         <option value="offer">Special Offer</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Value</label>
                      <input 
                        type="number"
                        className="w-full bg-light-bg border-none rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-premium-gold/30 transition-all font-black text-sm" 
                        value={billData.pricing.discount}
                        onChange={e => setBillData({...billData, pricing: {...billData.pricing, discount: Number(e.target.value)}})}
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Round Off (+/-)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-light-bg border-none rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-premium-gold/30 transition-all font-black text-sm" 
                    value={billData.pricing.roundOff}
                    onChange={e => setBillData({...billData, pricing: {...billData.pricing, roundOff: Number(e.target.value)}})}
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                   <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Settlement Method</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['cash', 'upi', 'card'].map(m => (
                        <button 
                          key={m}
                          type="button"
                          onClick={() => setBillData({...billData, paymentMethod: m})}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${billData.paymentMethod === m ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-text-muted border-border-light hover:border-premium-gold'}`}
                        >
                           {m}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Final Summary Card */}
          <div className="bg-charcoal rounded-[2.5rem] p-10 text-white shadow-2xl shadow-charcoal/30 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
             
             <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center text-white/50">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Gross Subtotal</span>
                   <span className="font-black">₹{billData.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-stock-out">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Discount Applied</span>
                   <span className="font-black">-₹{(billData.pricing.subtotal - billData.pricing.totalAmount + billData.pricing.roundOff).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-white/50">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Round Off</span>
                   <span className="font-black">{billData.pricing.roundOff >= 0 ? '+' : ''}{billData.pricing.roundOff.toFixed(2)}</span>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                   <p className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.3em] mb-2">Net Payable Amount</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">₹{billData.pricing.totalAmount.toLocaleString()}</span>
                      <span className="text-xs font-bold text-white/40 uppercase">Paid</span>
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-6 bg-white text-charcoal py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-premium-gold transition-all flex items-center justify-center gap-3"
                >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Authorize & Save</>}
                </button>
             </div>
          </div>

          {/* Bill Notes */}
          <div className="bg-white rounded-[2.5rem] border border-border-light p-8 shadow-sm">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                   <FileText size={12} /> Bill Footnotes & Policy
                </label>
                <textarea 
                  rows="4" 
                  className="w-full bg-light-bg border-none rounded-2xl px-6 py-6 focus:ring-2 focus:ring-premium-gold/30 transition-all font-medium text-xs resize-none" 
                  value={billData.notes}
                  onChange={e => setBillData({...billData, notes: e.target.value})}
                />
             </div>
          </div>

        </div>
      </form>
    </div>
  );
}

function Loader2({ size, className }) {
  return <Clock size={size} className={`animate-spin ${className}`} />;
}
