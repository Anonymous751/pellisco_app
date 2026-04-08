import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Truck,
  Package,
  MapPin,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Warehouse,
  Box,
  Printer,
  ArrowUpRight,
  Layers,
  Info,
  FilterX,
  FileDown,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getAllShipments,
  getShippingStats,
  updateShipmentStatus,
} from "./Shipping/shippingSlice/shippingSlice";
import CreateShipmentModal from "./Shipping/CreateShipmentModal";
// Import your new separate component here


/* --- MAIN LOGISTICS DASHBOARD --- */
const AShipping = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const [isUpdating, setIsUpdating] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    shipments = [],
    stats = {},
    loading,
    pages,
  } = useSelector((state) => state.shipping);

  useEffect(() => {
    dispatch(getShippingStats());
  }, [dispatch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(
        getAllShipments({
          keyword: searchTerm,
          page: currentPage,
          status: viewMode === "warehouse" ? "Processing" : "",
        })
      );
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchTerm, currentPage, viewMode]);

  const displayShipments = useMemo(
    () =>
      viewMode === "warehouse"
        ? shipments.filter((s) => s.status === "Processing")
        : shipments,
    [shipments, viewMode]
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = displayShipments.map((s) => s._id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setViewMode("all");
    setCurrentPage(1);
    setSelectedIds([]);
    toast.success("Logistics View Reset");
  };

  const exportSelectedOrdersPDF = () => {
    if (selectedIds.length === 0) {
      return toast.error("Please select orders to export");
    }

    try {
      const selectedData = shipments.filter((s) => selectedIds.includes(s._id));
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(40, 68, 55);
      doc.text("PELLISCO LOGISTICS REPORT", 14, 20);
      doc.setFontSize(10);
      doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Shipment ID",
            "Customer",
            "Carrier",
            "City",
            "Full Address",
            "Status",
          ],
        ],
        body: selectedData.map((s) => [
          s.shipmentId,
          s.user?.name || "N/A",
          s.carrier,
          s.destination?.city || "N/A",
          s.destination?.address || s.order?.shippingAddress?.address || "N/A",
          s.status,
        ]),
        theme: "striped",
        headStyles: { fillColor: [40, 68, 55] },
        styles: { fontSize: 8 },
      });

      doc.save(`Pellisco_Logistics_FullReport_${Date.now()}.pdf`);
      toast.success(`Exported ${selectedIds.length} Full Address Records`);
    } catch (err) {
      toast.error("Export Failed");
    }
  };

  const generatePackingSlip = (ship) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("PACKING SLIP", 14, 20);

    doc.setFontSize(10);
    doc.text(`Fulfillment ID: ${ship.shipmentId}`, 14, 30);
    doc.text(`Customer: ${ship.user?.name || "Guest"}`, 14, 35);
    doc.text(`Phone: ${ship.order?.shippingAddress?.phone || "N/A"}`, 14, 40);

    doc.text("DELIVERY TO:", 14, 55);
    doc.setFontSize(12);
    doc.text(`${ship.destination?.address || "N/A"}`, 14, 62);
    doc.text(
      `${ship.destination?.city || ""}, ${
        ship.order?.shippingAddress?.state || ""
      }`,
      14,
      68
    );

    doc.save(`Slip_${ship.shipmentId}.pdf`);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setIsUpdating(id);
    dispatch(updateShipmentStatus({ id, status: newStatus }))
      .unwrap()
      .then(() => {
        setIsUpdating(null);
        toast.success(`Updated to ${newStatus}`);
        dispatch(getShippingStats());
      })
      .catch(() => setIsUpdating(null));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:p-12 space-y-8 font-sans text-primary">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Logistics Hub <ArrowUpRight className="text-mutedGreen" size={20} />
          </h1>
          <div className="mt-2 flex bg-gray-200/50 p-1 rounded-xl w-fit border border-gray-100">
            {["all", "warehouse"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setViewMode(m);
                  setCurrentPage(1);
                  setSelectedIds([]);
                }}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                  viewMode === m
                    ? "bg-white shadow-sm text-primary"
                    : "text-primary/30 hover:text-primary/60"
                }`}
              >
                {m === "all"
                  ? "Global Fleet"
                  : `Warehouse (${
                      shipments.filter((s) => s.status === "Processing").length
                    })`}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-2xl text-xs font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={18} /> INITIALIZE FULFILLMENT
        </button>
      </div>

      {/* OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Warehouse Load",
            val: stats?.activeShipments,
            icon: Warehouse,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Successful Drops",
            val: stats?.deliveredToday,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Route Alerts",
            val: stats?.delayedAlerts,
            icon: AlertCircle,
            color: "text-rose-500",
            bg: "bg-rose-50",
          },
          {
            label: "Stock Sync",
            val: `${stats?.successRate || 0}%`,
            icon: Layers,
            color: "text-sky-500",
            bg: "bg-sky-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-primary/10 transition-colors group"
          >
            <div
              className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black mt-1">{stat.val || 0}</h3>
          </div>
        ))}
      </div>

      {/* DATA TABLE CONTAINER */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="p-7 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50">
          <div className="flex items-center gap-3 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                placeholder="Search Order ID..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-xs outline-none focus:bg-white border border-transparent focus:border-gray-100 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="p-3.5 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
            >
              <FilterX size={18} />
            </button>
          </div>
          <button
            onClick={exportSelectedOrdersPDF}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group shadow-sm active:scale-95 ${
              selectedIds.length > 0
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100"
            }`}
          >
            <FileDown size={16} /> Export{" "}
            {selectedIds.length > 0 ? `(${selectedIds.length})` : ""} Orders
          </button>
        </div>

        <div className="overflow-x-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-50">
                <th className="px-8 py-5 w-10">
                  <input
                    type="checkbox"
                    className="accent-primary rounded"
                    onChange={handleSelectAll}
                    checked={
                      displayShipments.length > 0 &&
                      selectedIds.length === displayShipments.length
                    }
                  />
                </th>
                <th className="px-6 py-5">Fulfillment & Order</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Logistics</th>
                <th className="px-6 py-5">Destination</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-primary/10"
                      size={40}
                    />
                  </td>
                </tr>
              ) : (
                displayShipments.map((ship) => (
                  <tr
                    key={ship._id}
                    className="group hover:bg-gray-50/80 transition-colors relative hover:z-[50]"
                  >
                    <td className="px-8 py-6">
                      <input
                        type="checkbox"
                        className="accent-primary rounded"
                        checked={selectedIds.includes(ship._id)}
                        onChange={() => handleToggleSelect(ship._id)}
                      />
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-2xl text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm relative">
                          <Box size={18} />
                          <span className="absolute -top-2 -right-2 bg-mutedGreen text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {ship.order?.totalQuantity || 0}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-primary">
                            {ship.shipmentId}
                          </p>
                          <p className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">
                            Ref:{" "}
                            {ship.order?.orderId ||
                              ship.order?._id?.slice(-6) ||
                              "N/A"}
                          </p>
                          <p className="text-[10px] font-bold text-mutedGreen mt-0.5">
                            Order Value - ₦
                            {(
                              (ship.order?.totalPrice || 0) * 1.13
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-black text-gray-700">
                            {ship.user?.name || "Admin User"}
                          </p>
                          <p className="text-[9px] text-gray-400 truncate max-w-[120px]">
                            {ship.user?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-gray-700">
                        {ship.carrier}
                      </p>
                      <p className="text-[9px] text-mutedGreen font-black flex items-center gap-1.5 uppercase mt-1">
                        <Truck size={12} /> {ship.shippingMethod}
                      </p>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin size={12} className="text-rose-400" />
                          <p className="text-xs font-black text-gray-700 uppercase tracking-tight">
                            {ship.destination?.city || "Unknown City"}
                          </p>
                        </div>
                        <p className="text-[10px] leading-relaxed text-gray-400 font-medium max-w-[180px]">
                          {ship.destination?.address || <span className="italic opacity-50 text-[9px]">Full Address Pending...</span>}
                        </p>
                        {ship.order?.shippingAddress?.phone && (
                          <p className="text-[9px] text-mutedGreen font-bold mt-1 tabular-nums">
                            {ship.order.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6 relative">
                      {isUpdating === ship._id ? (
                        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-primary animate-pulse">
                          <Loader2 size={12} className="animate-spin" /> SYNCING...
                        </div>
                      ) : (
                        <div className="relative group/status flex flex-col items-center">
                          <div
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center ring-1 ring-inset cursor-help flex items-center gap-1.5 ${
                              ship.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                                : ship.status === "Cancelled"
                                ? "bg-rose-50 text-rose-600 ring-rose-100"
                                : "bg-amber-50 text-amber-600 ring-amber-100"
                            }`}
                          >
                            {ship.status}
                            <Info size={10} className="opacity-40" />
                          </div>

                          {/* Logistics History Tooltip */}
                          <div className="absolute bottom-full mb-3 w-56 p-3 bg-gray-900 text-white rounded-2xl shadow-2xl invisible group-hover/status:visible opacity-0 group-hover/status:opacity-100 transition-all duration-300 z-[100] pointer-events-none">
                            <p className="text-[9px] font-black border-b border-gray-700 pb-1.5 mb-2 uppercase text-gray-400">Logistics History</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                              {ship.logs?.length > 0 ? ship.logs.map((log, i) => (
                                <div key={i} className="flex flex-col border-l-2 border-primary/30 pl-2">
                                  <span className="text-[10px] font-bold text-mutedGreen">{log.status}</span>
                                  <span className="text-[8px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              )) : <p className="text-[9px] text-gray-500 italic">No history available</p>}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => generatePackingSlip(ship)}
                          className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-primary rounded-xl transition-all shadow-sm"
                        >
                          <Printer size={15} />
                        </button>

                        <div className="relative group/menu">
                          <button className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <ExternalLink size={15} />
                          </button>

                          <div className="absolute right-0 bottom-full mb-3 w-48 bg-white border border-gray-200 rounded-[1.5rem] shadow-2xl z-[110] opacity-0 invisible translate-y-2 group-hover/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-y-0 transition-all duration-300 ease-out overflow-hidden">
                            <div className="p-2 bg-gray-50 text-[8px] font-black text-gray-400 uppercase text-center border-b">Pipeline Status</div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                              {["Processing", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateStatus(ship._id, st)}
                                  className={`w-full text-left px-5 py-3 text-[10px] font-bold transition-colors ${
                                    ship.status === st ? "bg-primary/5 text-primary pointer-events-none" : "text-primary/70 hover:bg-gray-50 hover:text-mutedGreen"
                                  }`}
                                >
                                  Mark as {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-8 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            Deployment Page {currentPage} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(1); setSelectedIds([]); }}
              className="p-2.5 text-gray-300 hover:text-primary transition-colors disabled:opacity-20"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage((p) => p - 1); setSelectedIds([]); }}
              className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage >= pages}
              onClick={() => { setCurrentPage((p) => p + 1); setSelectedIds([]); }}
              className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <CreateShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AShipping;
