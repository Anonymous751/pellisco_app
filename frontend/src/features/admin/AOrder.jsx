import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingBag,
  Eye,
  Truck,
  CheckCircle,
  FileText,
  Search,
  Loader2,
  Edit3,
  User,
  MapPin,
  ChevronRight,
  RefreshCw,
  X,
  Package,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  clearErrors,
  fetchAdminOrders,
  fetchOrderStats,
  updateAdminOrder,
  updateReset,
} from "./order/orderSlice";

const AOrder = () => {
  const dispatch = useDispatch();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const orderState = useSelector((state) => state.orders);
  const {
    orders = [],
    loading = false,
    error = null,
    totalOrders = 0,
    isUpdated = false,
    stats: reduxStats = {},
  } = orderState || {};

  useEffect(() => {
    dispatch(fetchAdminOrders());
    dispatch(fetchOrderStats());
  }, [dispatch]);

  useEffect(() => {
    if (isUpdated) {
      dispatch(fetchAdminOrders());
      dispatch(fetchOrderStats());
      dispatch(updateReset());
    }
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch, isUpdated]);

  // --- LOGIC ---
  const getTabCount = (tabName) => {
    if (tabName === "All") return orders.length;
    if (tabName === "Pending")
      return orders.filter((o) =>
        ["Processing", "Confirmed", "Packed"].includes(o.orderStatus)
      ).length;
    return orders.filter((o) => o.orderStatus === tabName).length;
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const resultAction = await dispatch(
      updateAdminOrder({ id, status: newStatus })
    );
    if (updateAdminOrder.fulfilled.match(resultAction)) {
      toast.success(
        <div className="flex flex-col">
          <span className="font-black text-[11px] tracking-widest">
            STATUS UPDATED
          </span>
          <span className="text-[10px] opacity-90 uppercase">
            Order #{id.slice(-4)} is {newStatus}
          </span>
        </div>,
        {
          icon: <RefreshCw size={16} className="text-secondary animate-spin" />,
          style: {
            borderRadius: "12px",
            background: "#2D2424",
            color: "#FDFDFB",
            padding: "12px",
          },
        }
      );
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "text-emerald-700 bg-emerald-50 border-emerald-100";
      case "Shipped":
        return "text-secondary bg-accent border-mutedGreen";
      case "Processing":
        return "text-amber-700 bg-amber-50 border-amber-100";
      case "Cancelled":
        return "text-danger bg-red-50 border-red-100";
      case "Returned":
        return "text-purple-700 bg-purple-50 border-purple-100";
      default:
        return "text-darkGray bg-lightGray border-mutedGreen";
    }
  };

  const exportToPDF = () => {
    try {
      console.log("Generating PDF...");
      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(18);
      doc.setTextColor(45, 36, 36);
      doc.text("PELLISCO | ORDER MANIFEST", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Report Date: ${new Date().toLocaleString()}`, 14, 28);

      const tableColumn = ["Order ID", "Customer", "Status", "City", "Total"];
      const tableRows = filteredOrders.map((order) => [
        order._id.toUpperCase(),
        order.user?.name || "Guest",
        order.orderStatus.toUpperCase(),
        order.shippingInfo?.city || "N/A",
        `Rs. ${order.totalPrice.toLocaleString()}`,
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",
        headStyles: {
          fillColor: [45, 36, 36],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
        },
        styles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });

      doc.save(`Pellisco_Orders_${new Date().getTime()}.pdf`);
      toast.success("PDF Manifest Downloaded");
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error("Could not generate PDF. Check console.");
    }
  };
  // --- FILTERING & PAGINATION ---
  const filteredOrders = orders.filter((order) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch =
      order._id?.toLowerCase().includes(searchStr) ||
      order.user?.name?.toLowerCase().includes(searchStr) ||
      order.shippingInfo?.address?.toLowerCase().includes(searchStr);

    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Pending")
      return (
        matchesSearch &&
        ["Processing", "Confirmed", "Packed"].includes(order.orderStatus)
      );
    return matchesSearch && order.orderStatus === activeTab;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = [
    {
      label: "Total Volume",
      value: reduxStats?.totalOrders || totalOrders || 0,
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-accent",
    },
    {
      label: "In Transit",
      value: reduxStats?.inTransitCount || 0,
      icon: Truck,
      color: "text-secondary",
      bg: "bg-white",
    },
    {
      label: "Completed",
      value: reduxStats?.completedCount || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 font-sans p-6 relative min-h-screen bg-lightGray text-darkGray">
      {loading && (
        <div className="fixed inset-0 bg-primary/10 z-999 flex items-center justify-center backdrop-blur-4px">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-mutedGreen flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-secondary" size={40} />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              Botanical Syncing...
            </p>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight font-serif">
            Order Management
          </h1>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mt-1">
            Pellisco Logistics Hub
          </p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-lightGray rounded-2xl text-[11px] font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
        >
          <FileText size={14} /> Export PDF
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-4xl border border-mutedGreen/40 shadow-sm flex items-center justify-between group hover:border-secondary transition-all"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110 shadow-inner`}
              >
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-mutedGreen uppercase tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-primary">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
            </div>
            <ChevronRight size={20} className="text-mutedGreen" />
          </div>
        ))}
      </div>

      {/* --- MAIN TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] border border-mutedGreen/50 shadow-sm overflow-hidden transition-all">
        {/* TABLE TOOLBAR */}
        <div className="p-6 border-b border-mutedGreen/20 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white">
          <div className="flex bg-accent p-1.5 rounded-2xl gap-1 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {[
              "All",
              "Pending",
              "Shipped",
              "Delivered",
              "Cancelled",
              "Returned",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none px-4 py-2.5 text-[9px] font-black rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-secondary text-white shadow-lg scale-[1.02]"
                    : "text-primary hover:bg-white/50"
                }`}
              >
                {tab.toUpperCase()}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[8px] ${
                    activeTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-mutedGreen/30 text-primary"
                  }`}
                >
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-mutedGreen group-focus-within:text-secondary transition-colors"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-lightGray border border-mutedGreen/30 rounded-2xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-secondary/5 focus:bg-white focus:border-secondary transition-all text-darkGray"
              placeholder="Search by Order ID or Customer Name"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/30 text-[10px] uppercase tracking-[0.2em] text-primary font-black border-b border-mutedGreen/20">
                <th className="px-10 py-6 italic font-serif">
                  Order Breakdown
                </th>
                <th className="px-6 py-6">Destination</th>
                <th className="px-6 py-6">Investment</th>
                <th className="px-6 py-6">Logistics Status</th>
                <th className="px-10 py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mutedGreen/10">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => {
                  const totalQty =
                    order.orderItems?.reduce(
                      (acc, item) => acc + item.quantity,
                      0
                    ) || 0;
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-accent/40 transition-all duration-300 group border-b border-mutedGreen/5 last:border-0 cursor-default"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-mutedGreen overflow-hidden group-hover:border-secondary transition-colors shadow-sm">
                              {order.orderItems?.[0]?.image ? (
                                <img
                                  src={order.orderItems[0].image}
                                  alt="product"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-mutedGreen bg-lightGray">
                                  <ShoppingBag size={20} />
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              {totalQty}
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-black text-primary tracking-tight font-serif uppercase italic">
                              #{order._id?.slice(-6)}
                            </span>
                            <div className="flex items-center gap-1">
                              <User size={10} className="text-secondary" />
                              <p className="text-[10px] font-bold text-darkGray/70 uppercase tracking-tighter">
                                {order.user?.name || "Guest"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex gap-3 items-start max-w-60">
                          <MapPin size={14} className="mt-1 text-mutedGreen" />
                          <div>
                            <p className="text-[11px] font-black text-primary leading-[1.4] line-clamp-1 uppercase">
                              {order.shippingInfo?.city}
                            </p>
                            <p className="text-[10px] font-bold text-mutedGreen mt-1 truncate">
                              {order.shippingInfo?.address}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <span className="text-sm font-black text-primary">
                          ₹{order.totalPrice?.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mt-1 italic">
                          {order.paymentMethod || "Prepaid"}
                        </p>
                      </td>

                      <td className="px-6 py-6">
                        <div className="relative group/select w-full max-w-40">
                          <select
                            disabled={loading}
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            className={`w-full text-[10px] font-black border-2 rounded-2xl pl-4 pr-10 py-2.5 outline-none appearance-none cursor-pointer transition-all shadow-sm ${getStatusStyle(
                              order.orderStatus
                            )} hover:border-primary disabled:opacity-50`}
                          >
                            {[
                              "Processing",
                              "Shipped",
                              "Out for Delivery",
                              "Delivered",
                              "Cancelled",
                              "Returned",
                            ].map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-white text-primary font-bold"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          <Edit3
                            size={12}
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
                          />
                        </div>
                      </td>

                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-3 text-secondary bg-white border border-mutedGreen/40 hover:bg-secondary hover:text-white rounded-2xl transition-all shadow-sm"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-24 text-center text-mutedGreen font-black uppercase text-[10px] tracking-[0.4em]"
                  >
                    Botanical void: No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-8 border-t border-mutedGreen/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
          <p className="text-[10px] text-mutedGreen font-black uppercase tracking-[0.2em]">
            Curating{" "}
            <span className="text-primary">{currentOrders.length}</span> of{" "}
            {filteredOrders.length} Results
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-5 py-2.5 text-[10px] font-black bg-accent border border-mutedGreen/30 rounded-xl text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30"
            >
              PREVIOUS
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-primary text-lightGray"
                      : "bg-lightGray text-secondary hover:bg-accent"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-5 py-2.5 text-[10px] font-black bg-primary text-lightGray rounded-xl hover:shadow-lg shadow-primary/20 transition-all disabled:opacity-30"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-mutedGreen/20 flex justify-between items-center bg-accent/20">
              <div>
                <h2 className="text-2xl font-black text-primary font-serif italic">
                  Order Details
                </h2>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">
                  Ref: #{selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-red-50 hover:text-danger rounded-2xl transition-all text-mutedGreen"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-lightGray p-6 rounded-3xl border border-mutedGreen/20">
                  <div className="flex items-center gap-2 mb-3 text-secondary">
                    <User size={14} />{" "}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Customer
                    </span>
                  </div>
                  <p className="text-sm font-black text-primary uppercase">
                    {selectedOrder.user?.name}
                  </p>
                  <p className="text-[11px] text-mutedGreen mt-1">
                    {selectedOrder.user?.email}
                  </p>
                </div>
                <div className="bg-lightGray p-6 rounded-3xl border border-mutedGreen/20">
                  <div className="flex items-center gap-2 mb-3 text-secondary">
                    <Package size={14} />{" "}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Status
                    </span>
                  </div>
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusStyle(
                      selectedOrder.orderStatus
                    )}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-mutedGreen/20"></div> Order
                  Items <div className="h-px flex-1 bg-mutedGreen/20"></div>
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl border border-mutedGreen/10 hover:border-secondary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-sm"
                        />
                        <div>
                          <p className="text-[12px] font-black text-primary truncate max-w-50 uppercase tracking-tighter">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-mutedGreen font-bold tracking-widest">
                            QTY: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <span className="text-[12px] font-black text-secondary">
                        ₹{item.quantity * item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-accent/30 rounded-4xl">
                  <MapPin className="text-secondary shrink-0" size={20} />
                  <div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                      Shipping Sanctuary
                    </h4>
                    {/* Updated to show Country beside address */}
                    <p className="text-[12px] text-darkGray/80 leading-relaxed italic">
                      {selectedOrder.shippingInfo?.address},{" "}
                      {selectedOrder.shippingInfo?.city},{" "}
                      {selectedOrder.shippingInfo?.state} -{" "}
                      {selectedOrder.shippingInfo?.pinCode}
                    </p>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-1">
                      {selectedOrder.shippingInfo?.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-primary text-lightGray rounded-4xl">
                  <CreditCard className="text-accent shrink-0" size={20} />
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">
                      Payment Summary
                    </h4>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[10px] font-bold opacity-70 uppercase">
                        {selectedOrder.paymentMethod} •{" "}
                        {selectedOrder.isPaid ? "CONFIRMED" : "PENDING"}
                      </p>
                      <p className="text-xl font-black italic font-serif tracking-tight">
                        ₹{selectedOrder.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-mutedGreen/20">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-4 bg-primary text-lightGray rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:opacity-95 transition-all shadow-xl"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AOrder;
