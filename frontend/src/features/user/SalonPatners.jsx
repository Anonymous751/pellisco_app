import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, Loader2, ChevronDown, ShieldCheck, AlertOctagon, ArrowRight, XCircle } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const SalonPartnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [status, setStatus] = useState('checking');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [formData, setFormData] = useState({
    salonName: '',
    website: '',
    email: user?.email || '',
    rooms: '',
    philosophy: ''
  });

  const fetchCurrentStatus = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:1551/api/v1/my-partnership-status', {
        withCredentials: true
      });

      // 1. Absolute Block
      if (data.isBlocked || data.requestCount >= 5) {
        setStatus('blocked');
        setAttemptsLeft(0);
        return;
      }

      // 2. Verified
      if (data.status === 'verified' && data.role === 'verified') {
        setStatus('verified');
        return;
      }

      // 3. Pending
      if (data.status === 'pending') {
        setStatus('success');
        return;
      }

      // 4. Rejected - We show the form but with an alert
      if (data.status === 'rejected') {
        setAttemptsLeft(Math.max(0, 5 - (data.requestCount || 0)));
        setStatus('rejected');
        return;
      }

      // 5. Idle/Initial
      setAttemptsLeft(Math.max(0, 5 - (data.requestCount || 0)));
      setStatus('idle');

    } catch (error) {
      if (error.response?.status === 403) setStatus('blocked');
      else setStatus('idle');
    }
  }, []);

  useEffect(() => {
    fetchCurrentStatus();
  }, [fetchCurrentStatus]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatus('loading');

    try {
      const { data } = await axios.post(
        'http://localhost:1551/api/v1/partnership-request',
        formData,
        { withCredentials: true }
      );

      toast.success("Application Received");
      if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);

      setTimeout(() => setStatus('success'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Submission failed";
      setStatus(attemptsLeft <= 1 ? 'blocked' : 'idle');
      toast.error(errorMsg);
    }
  };

  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-[#6B705C]" size={32} />
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C]">Verifying Clinical Status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <Toaster position="top-center" />

      <div className="mb-10">
        <h1 className="text-2xl font-serif text-[#1A1A1A] mb-2">Pellisco Pro Program</h1>
        <p className="text-sm text-[#8C8C8C] italic font-serif">Exclusive wholesale access for verified clinical specialists.</p>

        {/* ATTEMPTS COUNTER: Show for idle, rejected, or loading */}
        {['idle', 'rejected', 'loading'].includes(status) && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${attemptsLeft <= 1 ? 'bg-red-500 animate-pulse' : 'bg-[#6B705C]'}`} />
            <p className="text-[9px] text-[#6B705C] font-bold uppercase tracking-widest">
              Submission Opportunities Remaining: {attemptsLeft}
            </p>
          </div>
        )}
      </div>

      {/* 1. BLOCKED UI */}
      {status === 'blocked' && (
        <div className="bg-white border border-red-100 rounded-sm p-12 text-center shadow-sm">
          <AlertOctagon className="mx-auto mb-6 text-red-800" size={56} strokeWidth={1} />
          <h2 className="font-serif text-xl mb-3 text-black">Verification Locked</h2>
          <p className="text-[#8C8C8C] text-xs max-w-sm mx-auto leading-relaxed">
            Threshold reached. Contact <span className="text-black font-medium">concierge@pellisco.com</span>.
          </p>
        </div>
      )}

      {/* 2. VERIFIED UI */}
      {status === 'verified' && (
        <div className="bg-white border border-[#6B705C]/20 rounded-sm p-12 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-6 text-[#6B705C]" size={56} strokeWidth={1} />
          <h2 className="font-serif text-2xl mb-3 text-black">Partner Access Granted</h2>
          <button onClick={() => window.location.href = '/shop/pro'} className="mt-6 px-10 py-4 bg-black text-white uppercase tracking-[0.3em] text-[10px] hover:bg-[#6B705C] transition-all flex items-center gap-2 mx-auto">
            Enter Pro Catalog <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 3. PENDING UI */}
      {status === 'success' && (
        <div className="bg-white border border-black/5 rounded-sm p-12 text-center shadow-sm">
          <Loader2 className="mx-auto mb-6 text-[#6B705C] animate-spin" size={56} strokeWidth={1} />
          <h2 className="font-serif text-xl mb-3 text-black">Credentials Under Review</h2>
          <p className="text-[#8C8C8C] text-[10px] uppercase tracking-widest">Status: Pending Review</p>
        </div>
      )}

      {/* 4. FORM UI (Show if idle, loading, or REJECTED) */}
      {['idle', 'loading', 'rejected'].includes(status) && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">

          {/* REJECTION ALERT BOX */}
          {status === 'rejected' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 flex items-center gap-4 text-red-800 rounded-sm">
              <XCircle size={20} strokeWidth={1.5} />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold">Application Declined</p>
                <p className="text-[11px] opacity-80 font-serif italic">Your previous submission did not meet our current clinical criteria. You may re-apply below.</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-black/5 rounded-sm shadow-sm overflow-hidden">
            <div className="p-6 border-b border-black/5 bg-[#FAF9F6]/30 flex items-center gap-3">
              <Briefcase size={16} className="text-[#6B705C]" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/70">Partnership Application</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-[#8C8C8C]">Clinic Name</label>
                <input required name="salonName" value={formData.salonName} onChange={handleChange} className="border-b border-black/10 py-2 font-serif italic outline-none focus:border-black transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-[#8C8C8C]">Website</label>
                <input required name="website" value={formData.website} onChange={handleChange} className="border-b border-black/10 py-2 font-serif italic outline-none focus:border-black transition-all" />
              </div>
              <div className="relative flex flex-col gap-2 md:col-span-2">
                <label className="text-[9px] uppercase tracking-widest text-[#8C8C8C]">Treatment Rooms</label>
                <select required name="rooms" value={formData.rooms} onChange={handleChange} className="w-full border-b border-black/10 py-2 outline-none appearance-none bg-transparent font-serif italic">
                  <option value="" disabled>Select Scale</option>
                  <option value="1-3">1-3 Rooms</option>
                  <option value="4-10">4-10 Rooms</option>
                  <option value="10+">10+ Rooms</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 bottom-3 opacity-20 pointer-events-none" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[9px] uppercase tracking-widest text-[#8C8C8C]">Clinical Philosophy</label>
                <textarea required name="philosophy" value={formData.philosophy} onChange={handleChange} className="border border-black/5 p-4 h-32 outline-none focus:border-[#6B705C] bg-[#FAF9F6] font-serif italic resize-none text-sm" />
              </div>

              <button
                disabled={status === 'loading' || attemptsLeft === 0}
                type="submit"
                className="md:col-span-2 mt-4 py-5 bg-black text-white uppercase tracking-[0.5em] text-[10px] hover:bg-[#6B705C] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === 'loading' ? <><Loader2 className="animate-spin" size={14} /> Processing...</> : 'Request Access'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonPartnerDashboard;
