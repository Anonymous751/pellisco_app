import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Users, UserPlus, Search, Download,
  MapPin, Calendar, Award, ShieldCheck,
  Edit3, Trash2, ExternalLink,
  ChevronLeft, ChevronRight,
  RefreshCcwDot, ChevronDown,
  Mail, CheckCircle2
} from 'lucide-react';

// External PDF Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import CreateCustomerModal from './Customer/CreateCustomerModal';
import ViewCustomerModal from './Customer/ViewCustomerModal';
import EditCustomerModal from './Customer/EditCustomerModal';

import {
  fetchAllCustomers,
  fetchCustomerStats,
  fetchCustomerDetails,
  deleteCustomer,
  verifyCustomerEmail,
  resetStatusFlags,
  clearErrors,
  updateCustomerByAdmin
} from './Customer/CustomerSlice/customerSlice';

const ACustomer = () => {
  const dispatch = useDispatch();
  const {
    users,
    totalUsers,
    totalPages: apiTotalPages,
    stats,
    loading,
    deleteSuccess,
    updateSuccess,
    verifySuccess,
    error
  } = useSelector((state) => state.customer);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Create
  const [isViewOpen, setIsViewOpen] = useState(false);   // Read
  const [isEditOpen, setIsEditOpen] = useState(false);   // Edit

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // --- FETCHING LOGIC ---
  useEffect(() => {
    dispatch(fetchCustomerStats());
    dispatch(fetchAllCustomers({ page: currentPage, limit: usersPerPage }));
  }, [dispatch, currentPage]);

  // --- SUCCESS & ERROR HANDLING ---
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (deleteSuccess) {
      toast.success("Ritualist deleted successfully");
      dispatch(resetStatusFlags());
    }
    if (updateSuccess) {
      toast.success("Account updated successfully");
      dispatch(resetStatusFlags());
    }
    if (verifySuccess) {
      toast.success("Ritualist verified successfully");
      dispatch(resetStatusFlags());
    }
  }, [error, deleteSuccess, updateSuccess, verifySuccess, dispatch]);

  // --- ACTION HANDLERS ---
  const handleAction = (id, type) => {
    dispatch(fetchCustomerDetails(id));
    if (type === 'view') setIsViewOpen(true);
    if (type === 'edit') setIsEditOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this ritualist? This action cannot be undone.")) {
      dispatch(deleteCustomer(id));
    }
  };

  const handleStatusUpdate = (userId, accountStatus) => {
  // Change 'userId' to 'id' to match the thunk's destructuring
  dispatch(updateCustomerByAdmin({
    id: userId,
    userData: { accountStatus } // Also ensure this matches 'userData' in the thunk
  }));
};

  const handleVerifyEmail = (userId, isVerified) => {
    if (isVerified) {
      toast.info("This Ritualist is already verified.");
    } else {
      dispatch(verifyCustomerEmail(userId));
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    dispatch(fetchCustomerStats());
    dispatch(fetchAllCustomers({ page: 1, limit: usersPerPage }));
    setCurrentPage(1);
  };

  // --- PDF EXPORT LOGIC ---
  const handleExportPDF = () => {
  const doc = new jsPDF();
  const tableColumn = ["ID", "Name", "Email", "Tier", "Verified", "Orders", "LTV"];
  const tableRows = [];

  filteredCustomers.forEach(customer => {
    const customerData = [
      String(customer._id).slice(-6),
      customer.name,
      customer.email,
      customer.tier || 'Brown',
      customer.isVerified ? "Yes" : "No",
      customer.numOfOrders || 0,
      `Rs. ${(customer.totalSpent || 0).toLocaleString()}`
    ];
    tableRows.push(customerData);
  });

  // Header branding
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text("PELLISCO RITUALIST DIRECTORY", 14, 22);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);

  // 2. USE THE IMPORTED autoTable FUNCTION INSTEAD OF doc.autoTable
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    headStyles: {
      fillColor: [197, 163, 134], // Pellisco Brand Color
      textColor: [255, 255, 255],
      fontSize: 10
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  doc.save(`Pellisco_Users_Report_${new Date().getTime()}.pdf`);
  toast.success("PDF Report Exported Successfully");
};

  const getTierStyles = (tier) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Gold': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Silver': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'Brown': return 'bg-orange-50 text-orange-800 border-orange-200';
      default: return 'bg-lightGray text-mutedGreen border-mutedGreen/20';
    }
  };

  // --- DATA LOGIC ---
  const displayCustomers = users || [];
  const filteredCustomers = displayCustomers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      String(c._id || '').toLowerCase().includes(term)
    );
  });

  const totalPages = apiTotalPages || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">User Directory</h1>
          <p className="text-xs text-mutedGreen mt-1 font-medium">Manage your community of Pellisco ritualists.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/10"
        >
          <UserPlus size={16} />
          ADD NEW USER
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Ritualists', val: stats?.total || '0', trend: stats?.recentGrowth || '+0%', icon: Users },
          { label: 'Gold Members', val: stats?.gold || '0', trend: '+0%', icon: Award },
          { label: 'Avg. Lifetime Value', val: `₹${(stats?.averageLTV || 0).toLocaleString()}/-`, trend: '+0%', icon: ShieldCheck },
          { label: 'Retention Rate', val: `${stats?.retentionRate || '0.0'}%`, trend: '+0%', icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-mutedGreen/20 shadow-sm hover:border-secondary/30 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-accent rounded-lg text-secondary"><stat.icon size={18} /></div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-lg font-bold text-primary mt-1">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-mutedGreen/20 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mutedGreen" size={16} />
          <input
            type="text"
            placeholder="Search by User name or Email or ID..."
            className="w-full pl-12 pr-4 py-2.5 bg-lightGray border border-mutedGreen/30 rounded-xl text-xs focus:ring-1 focus:ring-secondary outline-none placeholder:text-mutedGreen text-darkGray"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleRefresh} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-mutedGreen/30 rounded-xl text-[11px] font-bold text-primary hover:bg-accent transition-all">
            <RefreshCcwDot size={14} /> Reset
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-mutedGreen/30 rounded-xl text-[11px] font-bold text-primary hover:bg-accent transition-all"
          >
            <Download size={14} /> EXPORT PDF
          </button>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <div className={`bg-white rounded-2xl border border-mutedGreen/20 shadow-sm overflow-hidden ${loading ? 'opacity-50' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightGray border-b border-mutedGreen/10 text-[10px] uppercase tracking-widest text-mutedGreen font-bold">
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Tier</th>
                <th className="px-6 py-5">Verification</th>
                <th className="px-6 py-5">Orders & LTV</th>
                <th className="px-6 py-5">Account Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mutedGreen/10">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-accent/20 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent border border-mutedGreen/30 flex items-center justify-center overflow-hidden text-secondary font-bold text-xs uppercase">
                        {customer.avatar?.url ? (
                          <img src={customer.avatar.url} alt={customer.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{(customer.name || 'U').charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono bg-lightGray px-1.5 py-0.5 rounded text-mutedGreen">#{String(customer._id).slice(-4)}</span>
                          <span className="text-xs font-bold text-primary">{customer.name}</span>

                        </div>
                        <span className="text-[10px] text-mutedGreen">{customer.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold border ${getTierStyles(customer.tier)} uppercase tracking-wider`}>
                      {customer.tier || 'Brown'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleVerifyEmail(customer._id, customer.isVerified)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all uppercase tracking-wider cursor-pointer
                        ${customer.isVerified
                          ? 'bg-blue-50 text-blue-600 border-blue-200 cursor-default'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-500'
                        }`}
                    >
                      {customer.isVerified ? (
                        <>
                          <CheckCircle2 size={12} className="text-blue-500" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Mail size={12} />
                          Unverified
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary">{customer.numOfOrders || 0} Orders</span>
                      <span className="text-[10px] text-secondary font-medium">₹{(customer.totalSpent || 0).toLocaleString()}/-</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="relative inline-block w-32">
                      <select
                        value={customer.accountStatus}
                        onChange={(e) => handleStatusUpdate(customer._id, e.target.value)}
                        className={`appearance-none w-full px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer outline-none
                          ${customer.accountStatus === 'active' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                          ${customer.accountStatus === 'blocked' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                          ${customer.accountStatus === 'suspended' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                        `}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAction(customer._id, 'view')}
                        className="p-2 text-secondary hover:bg-accent rounded-lg transition-all"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() => handleAction(customer._id, 'edit')}
                        className="p-2 text-secondary hover:bg-accent rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 text-danger hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-6 bg-lightGray border-t border-mutedGreen/10 flex justify-between items-center">
          <p className="text-[11px] text-mutedGreen font-medium tracking-wide">
            Showing {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers}
          </p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border border-mutedGreen/20 rounded-lg text-mutedGreen hover:text-primary disabled:opacity-30 transition-all">
              <ChevronLeft size={14} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setCurrentPage(n)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === n ? 'bg-secondary text-white shadow-md shadow-secondary/20' : 'text-mutedGreen hover:text-primary border border-transparent hover:border-mutedGreen/20'}`}>
                  {n}
                </button>
              ))}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border border-mutedGreen/20 rounded-lg text-mutedGreen hover:text-primary disabled:opacity-30 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={handleRefresh}
      />
      <ViewCustomerModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
      <EditCustomerModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
};

export default ACustomer;
