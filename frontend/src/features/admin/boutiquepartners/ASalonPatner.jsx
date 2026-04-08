import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Mail,
  Clock,
  Inbox,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  RefreshCw // Added for the sync button
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ASalonPartner = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInquiries = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setIsRefreshing(true);
    try {
      const { data } = await axios.get('http://localhost:1551/api/v1/admin/partnerships', { withCredentials: true });
      if (data.success) setInquiries(data.inquiries);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const loadingToast = toast.loading(`Updating to ${newStatus}...`);
    try {
      const { data } = await axios.patch(
        `http://localhost:1551/api/v1/admin/partnership/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(`Application ${newStatus}`, { id: loadingToast });
        setInquiries(prev => prev.map(item =>
          item._id === id ? {
            ...item,
            status: newStatus,
            user: newStatus === 'verified' ? { ...item.user, partnershipRequestCount: 0, isPartnershipBlocked: false } : item.user
          } : item
        ));
      }
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.error(message, { id: loadingToast });

      // 🛑 STALE DATA FIX: If the backend says 404, remove the ghost record from UI
      if (error.response?.status === 404) {
        setInquiries(prev => prev.filter(item => item._id !== id));
        console.warn(`Removed deleted record ${id} from UI state.`);
      }
    }
  };

  const filteredInquiries = inquiries.filter(item =>
    filter === 'all' ? true : item.status === filter
  );

  if (loading) return (
    <div className="flex h-96 items-center justify-center text-[#6B705C] animate-pulse font-serif italic">
      Synchronizing clinical records...
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-[#FAF9F6] min-h-screen">
      <Toaster />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <ShieldAlert className="text-[#6B705C]" size={20}/>
             <h1 className="text-3xl font-serif text-black">Partnership Board</h1>
          </div>
          <p className="text-sm text-gray-500 italic font-serif">Gatekeeping the Pellisco Pro ecosystem.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* REFRESH BUTTON */}
          <button
            onClick={() => fetchInquiries(true)}
            className={`p-2 rounded-full hover:bg-black/5 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Records"
          >
            <RefreshCw size={18} className="text-[#6B705C]" />
          </button>

          <div className="flex bg-white border border-black/5 p-1 rounded-sm shadow-sm">
            {['all', 'pending', 'verified', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-1.5 text-[9px] uppercase tracking-[0.2em] transition-all font-bold ${
                  filter === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black/5 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF9F6] border-b border-black/5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-600">
              <th className="px-6 py-4">Clinic Profile</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Inquiry History</th>
              <th className="px-6 py-4">Clinical Philosophy</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <Inbox className="mx-auto mb-4 text-gray-200" size={32} />
                  <p className="text-xs text-gray-400 font-serif italic">No applications in this category.</p>
                </td>
              </tr>
            ) : (
              filteredInquiries.map((item) => (
                <tr key={item._id} className={`hover:bg-[#FAF9F6]/50 transition-colors group ${item.user?.isPartnershipBlocked ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-6">
                    <div className="font-serif text-sm text-black">{item.salonName}</div>
                    <a href={item.website} target="_blank" rel="noreferrer" className="text-[10px] text-[#6B705C] flex items-center gap-1 mt-1 hover:underline">
                      View Portfolio <ExternalLink size={10} />
                    </a>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold border rounded-full ${
                      item.status === 'verified' ? 'bg-green-50 text-green-700 border-green-100' :
                      item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Mail size={12} className="text-gray-400" /> {item.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium">
                       <Clock size={12} className="text-gray-400"/>
                       <span className={item.user?.partnershipRequestCount >= 4 ? 'text-red-600 font-bold' : 'text-gray-500'}>
                         Attempt {item.user?.partnershipRequestCount || 1} of 5
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 max-w-xs">
                    <p className="text-[11px] text-gray-500 italic line-clamp-2 leading-relaxed">
                      "{item.philosophy}"
                    </p>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'verified')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[9px] uppercase tracking-widest hover:bg-[#6B705C] transition-colors"
                          >
                            <UserCheck size={12} /> Verify
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'rejected')}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-700 text-[9px] uppercase tracking-widest hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 opacity-30 select-none">
                          <CheckCircle size={12} className={item.status === 'verified' ? 'text-green-600' : 'text-red-600'}/>
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest italic font-medium">
                            Processed
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ASalonPartner;
