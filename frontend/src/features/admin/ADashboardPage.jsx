import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  Loader2,
  Heart,
  ShieldCheck,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  clearAdminErrors,
  fetchCustomerStats,
} from "./adminSlices/AdminDashboardSlice";

const StatCard = ({ title, value, change, icon, trendUp }) => (
  <div className="bg-white p-5 rounded-2xl border border-[var(--color-mutedGreen)]/20 shadow-sm hover:border-[var(--color-secondary)]/30 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[var(--color-accent)] text-[var(--color-secondary)] rounded-lg">
        {React.cloneElement(icon, { size: 18, strokeWidth: 2 })}
      </div>
      <div
        className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          trendUp
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-[var(--color-danger)]"
        }`}
      >
        {trendUp ? "+" : ""}
        {change}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {title}
      </p>
      <h3 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

const AAdminDashboard = () => {
  const dispatch = useDispatch();
  const { customerStats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchCustomerStats());

    if (error) {
      toast.error(error);
      dispatch(clearAdminErrors());
    }
  }, [dispatch, error]);

  // --- REPORT DOWNLOAD LOGIC ---
  const handleDownloadReport = () => {
    if (!customerStats) return toast.error("Data not ready for download");

    // Create the rows for the tabular report
    const reportData = [
      ["Pellisco Admin Report", new Date().toLocaleString()],
      ["Metric", "Value"],
      ["Total Ritualists", customerStats.total],
      ["Platinum Members", customerStats.platinum],
      ["Gold Members", customerStats.gold],
      ["Silver Members", customerStats.silver],
      ["Brown Members", customerStats.brown],
      ["Average LTV", `INR ${customerStats.averageLTV}`],
      ["Retention Rate", customerStats.retentionRate],
      [
        "VVIP Total (Plat + Gold)",
        (customerStats.platinum || 0) + (customerStats.gold || 0),
      ],
    ];

    // Convert to CSV string
    const csvContent = reportData.map((row) => row.join(",")).join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Pellisco_Stats_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report Downloaded");
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2
          className="animate-spin text-[var(--color-secondary)]"
          size={40}
        />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Syncing Pellisco Intel...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Overview
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Monitoring real-time ritualist data
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity active:scale-95"
        >
          <Download size={14} />
          Download Report
        </button>
      </header>

      {/* DYNAMIC STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={customerStats?.total || 0}
          change="Live"
          icon={<Users />}
          trendUp={true}
        />
        <StatCard
          title="Platinum"
          value={customerStats?.platinum || 0}
          change="Elite"
          icon={<ShieldCheck className="text-indigo-600" />}
          trendUp={true}
        />
        <StatCard
          title="Avg. LTV"
          value={`₹${customerStats?.averageLTV?.toLocaleString() || 0}`}
          change="per user"
          icon={<Heart />}
          trendUp={true}
        />
        <StatCard
          title="Retention"
          value={customerStats?.retentionRate || "0%"}
          change="Repeat"
          icon={<TrendingUp />}
          trendUp={parseFloat(customerStats?.retentionRate) > 15}
        />
        <StatCard
          title="Gold Members"
          value={customerStats?.gold || 0}
          change="Premium"
          icon={<ShieldCheck className="text-yellow-500" />}
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TIER DISTRIBUTION BOX */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--color-mutedGreen)]/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Tier Distribution
            </h4>
            <div className="flex gap-2">
              <span className="text-[9px] font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded">
                Platinum
              </span>
              <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                Gold
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                Silver
              </span>
              <span className="text-[9px] font-bold text-orange-800 bg-orange-50 px-2 py-1 rounded">
                Brown
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end gap-6 px-4">
            <TierBar
              label="Platinum"
              count={customerStats?.platinum}
              total={customerStats?.total}
              color="bg-indigo-950"
            />
            <TierBar
              label="Gold"
              count={customerStats?.gold}
              total={customerStats?.total}
              color="bg-yellow-400"
            />
            <TierBar
              label="Silver"
              count={customerStats?.silver}
              total={customerStats?.total}
              color="bg-slate-300"
            />
            <TierBar
              label="Brown"
              count={customerStats?.brown}
              total={customerStats?.total}
              color="bg-orange-800"
            />
          </div>
        </div>

        {/* ENGAGEMENT SUMMARY */}
        <div className="bg-white rounded-2xl border border-[var(--color-mutedGreen)]/20 p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-6 text-center">
            Engagement Summary
          </h4>
          <div className="space-y-6">
            {/* 1. CALCULATE REPEAT CUSTOMERS: (Total * Retention %) */}
            <SummaryRow
              label="Repeat Ritualists"
              value={
                customerStats?.total > 0
                  ? Math.round(
                      (parseFloat(customerStats.retentionRate) / 100) *
                        customerStats.total
                    )
                  : 0
              }
            />

            {/* 2. VVIP SUM: Adds Platinum and Gold together */}
            <SummaryRow
              label="VVIP Community"
              value={
                (customerStats?.platinum || 0) + (customerStats?.gold || 0)
              }
            />

            {/* 3. DYNAMIC GROWTH: Uses the real percentage from your API */}
            <SummaryRow
              label="Recent Growth"
              value={customerStats?.recentGrowth || "0%"}
            />

            {/* DYNAMIC FOOTER MESSAGE */}
            <div className="pt-4 border-t border-dashed">
              <p className="text-[9px] text-center font-medium text-slate-400 italic">
                {customerStats?.platinum > 0
                  ? "Elite tier active - VVIPs are scaling"
                  : "Targeting first Platinum Ritualist"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */

const TierBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className="w-full bg-slate-50 rounded-t-lg relative h-full flex items-end">
        <div
          className={`w-full ${color} rounded-t-lg transition-all duration-1000 ease-out`}
          style={{ height: `${percentage}%` }}
        />
      </div>
      <span className="text-[9px] text-slate-400 font-bold uppercase">
        {label}
      </span>
      <span className="text-[11px] font-bold text-[var(--color-primary)]">
        {count || 0}
      </span>
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
      {label}
    </p>
    <p className="text-xs font-bold text-[var(--color-primary)]">{value}</p>
  </div>
);

export default AAdminDashboard;
