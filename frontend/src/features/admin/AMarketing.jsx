import React, { useState, useEffect } from 'react';
import {
  Tag, Sparkles, Send, Plus,
  MoreHorizontal, Calendar, MousePointerClick,
  Copy, Edit3, Trash2, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios'; // Or use your custom API utility

const PromoCard = ({ coupon, onToggle, onDelete }) => (
  <div className="bg-white p-5 rounded-2xl border border-[var(--color-mutedGreen)]/20 shadow-sm hover:border-[var(--color-secondary)]/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 bg-[var(--color-accent)] text-[var(--color-secondary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-secondary)]/10">
          {coupon.code}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Copied!"); }}
          className="text-slate-300 hover:text-[var(--color-secondary)] transition-colors"
        >
          <Copy size={12} />
        </button>
      </div>
      <button
        onClick={() => onToggle(coupon._id)}
        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter transition-colors ${
          coupon.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
        }`}
      >
        {coupon.isActive ? 'Active' : 'Disabled'}
      </button>
    </div>
    <div className="space-y-1 mb-4">
      <h4 className="text-lg font-bold text-[var(--color-primary)]">
        {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹ ${coupon.discountAmount} OFF`}
      </h4>
      <p className="text-[10px] text-slate-400 font-medium truncate">{coupon.description}</p>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="text-[10px] font-bold text-slate-400">
        <span className="text-[var(--color-secondary)]">{coupon.usedCount}</span> / {coupon.usageLimit} USES
      </div>
      <div className="flex gap-2">
        <button className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400"><Edit3 size={14} /></button>
        <button
          onClick={() => onDelete(coupon._id)}
          className="p-1.5 hover:bg-red-50 rounded-md text-[var(--color-danger)]/60"
        ><Trash2 size={14} /></button>
      </div>
    </div>
  </div>
);

const AMarketing = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountAmount: '',
    minOrderAmount: 0,
    expiryDate: '',
    usageLimit: 1000
  });

  // 1. Fetch Coupons on Load
  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get('/api/v1/admin/coupons'); // Adjust URL to your route
      setCoupons(data.coupons);
    } catch (err) {
      toast.error("Failed to load promotions");
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  // 2. Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/v1/admin/coupon/new', formData);
      toast.success(`${formData.code} launched successfully!`);
      setShowModal(false);
      fetchCoupons(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating coupon");
    } finally {
      setLoading(false);
    }
  };

  // 3. Toggle Status & Delete
  const handleToggle = async (id) => {
    try {
      await axios.put(`/api/v1/admin/coupon/${id}`);
      fetchCoupons();
    } catch (err) { toast.error("Update failed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this campaign?")) return;
    try {
      await axios.delete(`/api/v1/admin/coupon/${id}`);
      toast.dark("Campaign removed");
      fetchCoupons();
    } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Marketing & Growth</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Manage campaigns and storefront assets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20"
        >
          <Plus size={14} /> Create New Campaign
        </button>
      </div>

      {/* CREATE COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C2C55]/20 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300 relative my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary)]">New Promotion</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coupon Code</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 ring-[var(--color-secondary)]/20 outline-none" placeholder="E.g. PELLISCO20" onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" onChange={(e) => setFormData({...formData, discountType: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</label>
                  <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" placeholder="20" onChange={(e) => setFormData({...formData, discountAmount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Uses</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" placeholder="1000" onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min. Order (₹)</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" placeholder="0" onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry</label>
                  <input type="date" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm min-h-[80px] outline-none" placeholder="What is this offer for?" onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 shadow-lg mt-4 disabled:bg-slate-300">
                {loading ? 'Processing...' : 'Launch Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE PROMOTIONS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[var(--color-secondary)] flex items-center gap-2">
            <Tag size={14} /> Active Promotions
          </h3>
          <button className="text-[10px] font-bold text-slate-400 hover:text-[var(--color-primary)]">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.length > 0 ? (
            coupons.slice(0, 3).map(coupon => (
              <PromoCard
                key={coupon._id}
                coupon={coupon}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 text-xs font-bold uppercase tracking-widest">
              No Active Campaigns Found
            </div>
          )}
        </div>
      </section>

      {/* Banner & Newsletter UI (Existing) */}
      {/* ... keeping your original banner/newsletter code here ... */}

    </div>
  );
};

export default AMarketing;  
