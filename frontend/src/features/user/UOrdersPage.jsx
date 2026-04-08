  import React, { useState, useEffect } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import {
    Search, Package, ChevronLeft, ChevronRight,
    Eye, ChevronsLeft, ChevronsRight, Filter, X,
    MapPin, ShoppingBag, Trash2, Copy, Check
  } from 'lucide-react';
import { clearErrors, fetchMyOrders } from '../admin/order/orderSlice';


  const UOrdersPage = () => {
    const dispatch = useDispatch();

    // --- REDUX STATE ---
    const { orders = [], loading, totalPages } = useSelector((state) => state.orders);

    // --- LOCAL UI STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null); // Added for feedback

    // --- FETCH LOGIC ---
    useEffect(() => {
      // We send the keyword to the backend for partial ID/Name matching
      dispatch(fetchMyOrders({ page: currentPage, keyword }));
      return () => dispatch(clearErrors());
    }, [dispatch, currentPage, keyword]);

    // --- HANDLERS ---
    const handleSearchChange = (e) => {
      setKeyword(e.target.value);
      setCurrentPage(1); // Reset to page 1 on search
    };

    const handleCopyId = (id) => {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    };

    const openOrderModal = (order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
    };

    const handleDeleteOrder = (id) => {
      if (window.confirm("Are you sure you want to remove this order from your history?")) {
        console.log("Delete request for:", id);
        // dispatch(deleteOrder(id));
      }
    };

    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">

        {/* --- HEADER & SEARCH SECTION --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-[var(--color-secondary)] uppercase">Pellisco History</span>
            </div>
            <h2 className="text-4xl font-serif text-[var(--color-primary)] font-bold">My Orders</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" size={16} />
              <input
                type="text"
                value={keyword}
                onChange={handleSearchChange}
                placeholder="Search ID (e.g. 69bc) or Product..."
                className="pl-10 pr-10 py-3 bg-white border border-[var(--color-accent)] rounded-2xl text-sm focus:ring-2 focus:ring-[var(--color-secondary)]/10 outline-none w-full transition-all shadow-sm"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button className="p-3 bg-white border border-[var(--color-accent)] rounded-2xl text-[var(--color-primary)] hover:border-[var(--color-secondary)] transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* --- ORDERS TABLE --- */}
        <div className="bg-white border border-[var(--color-accent)] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-lightGray)]/50 border-b border-[var(--color-accent)]">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Id</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Total Amount</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-accent)]">
                {orders && orders.length > 0 ? orders.map((order) => (
                  <tr key={order._id} className="group hover:bg-[var(--color-lightGray)]/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-[var(--color-accent)] overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm">
                          {order.thumbnail ? (
                            <img src={order.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--color-primary)] text-sm tracking-tight font-mono uppercase">
                              {order._id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={() => handleCopyId(order._id)}
                              className="text-gray-300 hover:text-[var(--color-secondary)] transition-colors"
                              title="Copy Full ID"
                            >
                              {copiedId === order._id ? <Check size={14} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'Product' : 'Products'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-[var(--color-primary)]">Rs. {order.totalPrice?.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="p-2.5 rounded-xl bg-white border border-[var(--color-accent)] text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all shadow-sm"
                          title="View Full Details"
                        >
                          <Eye size={16} />
                        </button>

                        {(order.orderStatus === "Cancelled" || order.orderStatus === "Processing") && (
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-2.5 rounded-xl bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : !loading && (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Package size={48} strokeWidth={1} />
                        <p className="font-medium">No orders found matching "{keyword}"</p>
                        <button onClick={() => setKeyword("")} className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-widest hover:underline">Clear Search</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 px-4">
          <div className="px-4 py-2 bg-white border border-[var(--color-accent)] rounded-full shadow-sm">
            <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">
              Page <span className="text-[var(--color-secondary)]">{currentPage}</span> of {totalPages || 1}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NavBtn onClick={goToFirst} disabled={currentPage === 1} icon={<ChevronsLeft size={16} />} />
            <NavBtn onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} icon={<ChevronLeft size={16} />} />

            <div className="flex items-center gap-1.5 mx-2">
              {renderPaginationNumbers(currentPage, totalPages, setCurrentPage)}
            </div>

            <NavBtn onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} icon={<ChevronRight size={16} />} />
            <NavBtn onClick={goToLast} disabled={currentPage === totalPages || totalPages === 0} icon={<ChevronsRight size={16} />} />
          </div>
        </div>

        {/* --- ORDER DETAIL MODAL --- */}
        <OrderModal
          isOpen={isModalOpen}
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  };

  /* --- SHARED COMPONENTS --- */

  const OrderModal = ({ isOpen, order, onClose }) => {
    if (!isOpen || !order) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[var(--color-primary)]/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
        <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">

          {/* MODAL HEADER */}
          <div className="px-10 py-8 border-b border-[var(--color-accent)] flex items-center justify-between bg-[var(--color-lightGray)]/30">
            <div>
              <h3 className="text-3xl font-serif font-bold text-[var(--color-primary)]">Order Details</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">REF: {order._id}</span>
                <button onClick={() => navigator.clipboard.writeText(order._id)} className="text-gray-300 hover:text-[var(--color-secondary)] transition-colors">
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl border border-[var(--color-accent)] transition-all shadow-sm">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">

            {/* ITEMS LIST */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em]">
                <ShoppingBag size={14} />
                <span>Your Selection</span>
              </div>
              <div className="bg-[var(--color-lightGray)]/40 rounded-[2rem] p-6 space-y-5 border border-[var(--color-accent)]">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-5">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-[var(--color-primary)] text-sm">{item.name}</p>
                      <p className="text-xs text-[var(--color-secondary)] font-bold mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[var(--color-primary)] text-sm">Rs. {item.price?.toLocaleString()}</span>
                  </div>
                ))}

                <div className="border-t border-dashed border-gray-200 pt-5 mt-5 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Shipping Fee</span>
                    <span>Rs. {order.shippingPrice || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Grand Total</span>
                    <span className="text-3xl font-serif font-bold text-[var(--color-secondary)]">Rs. {order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPPING DESTINATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em]">
                <MapPin size={14} />
                <span>Shipping Destination</span>
              </div>
              <div className="px-6 py-5 border border-[var(--color-accent)] rounded-2xl text-sm text-gray-600 leading-relaxed bg-white shadow-sm">
                {order.shippingInfo ? (
                  <>
                    <p className="font-bold text-[var(--color-primary)] text-base mb-1">{order.shippingInfo.fullName}</p>
                    <p>{order.shippingInfo.address}</p>
                    <p>{order.shippingInfo.city}, {order.shippingInfo.state} - {order.shippingInfo.postalCode}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-lightGray)] rounded-lg font-bold text-[var(--color-secondary)] text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                      {order.shippingInfo.phoneNo}
                    </div>
                  </>
                ) : (
                  <p className="italic text-gray-400">No shipping information found for this order.</p>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-8 bg-[var(--color-lightGray)]/30 border-t border-[var(--color-accent)] flex justify-between items-center">
            <StatusBadge status={order.orderStatus} />
            <button onClick={onClose} className="px-10 py-3.5 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">
              Close Summary
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* --- UTILITIES & MINI-COMPONENTS --- */

  const renderPaginationNumbers = (current, total, setter) => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        pages.push(
          <button
            key={i}
            onClick={() => setter(i)}
            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
              current === i
                ? 'bg-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-primary)]/20 scale-110'
                : 'bg-white text-gray-400 border border-[var(--color-accent)] hover:border-[var(--color-secondary)]'
            }`}
          >{i}</button>
        );
      } else if (i === current - delta - 1 || i === current + delta + 1) {
        pages.push(<span key={i} className="px-1 text-gray-300 font-bold">...</span>);
      }
    }
    return pages;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      "Delivered": "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500",
      "Processing": "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500",
      "Cancelled": "bg-red-50 text-red-600 border-red-100 ring-red-500",
      "Shipped": "bg-purple-50 text-purple-600 border-purple-100 ring-purple-500"
    };
    const activeClass = config[status] || "bg-gray-50 text-gray-600 border-gray-100 ring-gray-400";

    return (
      <span className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all ${activeClass}`}>
        <span className={`w-2 h-2 rounded-full animate-pulse ${activeClass.split(' ').find(c => c.startsWith('ring-')).replace('ring-', 'bg-')}`} />
        {status || "Pending"}
      </span>
    );
  };

  const NavBtn = ({ onClick, disabled, icon }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-xl border transition-all ${
        disabled
          ? 'opacity-20 cursor-not-allowed border-gray-200'
          : 'border-[var(--color-accent)] bg-white text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] active:scale-90 shadow-sm'
      }`}
    >{icon}</button>
  );

  export default UOrdersPage;
