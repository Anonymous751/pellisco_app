import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowUpRight, ArrowDownRight, Users,
  ShoppingBag, CreditCard, Activity,
  Calendar, Download, Truck, Loader2,
  Globe, Radio
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clearAnalyticsErrors, fetchAnalyticsIntelligence, fetchOrderLogistics } from './analyticsSlice/AnalyticsSlice';

// REUSABLE KPI COMPONENT
const KPICard = ({ title, value, change, trend, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-[var(--color-mutedGreen)]/20 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-[var(--color-accent)] text-[var(--color-secondary)] rounded-xl">
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[var(--color-danger)]'
      }`}>
        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-[var(--color-primary)]">{value}</h3>
    </div>
  </div>
);

const AAnalytics = () => {
  const dispatch = useDispatch();
  const { stats, logistics, loading, error } = useSelector((state) => state.adminAnalytics);

  // --- FIX 1: DATA FETCHING (Only runs once on mount) ---
  useEffect(() => {
    dispatch(fetchAnalyticsIntelligence());
    dispatch(fetchOrderLogistics());
  }, [dispatch]);

  // --- FIX 2: ERROR HANDLING (Runs only when 'error' exists) ---
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAnalyticsErrors());
    }
  }, [error, dispatch]);

  // --- NEW: CSV EXPORT HANDLER ---
  const handleExportCSV = () => {
    if (!stats || !logistics) {
      toast.info("Data is still loading...");
      return;
    }

    const rows = [
      ["Pellisco Analytics Report", new Date().toLocaleString()],
      [""],
      ["Metric", "Value"],
      ["Total Revenue", `₹ ${stats.totalRevenue}`],
      ["Total Orders", stats.totalOrders],
      ["Avg Order Value", `₹ ${stats.avgOrderValue}`],
      ["Conversion Rate", stats.conversionRate],
      ["Total Traffic", stats.totalVisitors],
      ["Live Users", stats.liveUsers || 0],
      ["Ritualists (Users)", stats.totalUsers],
      [""],
      ["Logistics Status", "Count"],
      ["Delivered", logistics.completedCount],
      ["In Transit", logistics.inTransitCount],
      ["Pending Action", logistics.pendingActionCount]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Pellisco_Analytics_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report Downloaded");
  };

  if (loading && !stats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[var(--color-secondary)]" size={40} />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Processing Pellisco Data...</p>
      </div>
    );
  }

  // --- CHART SCALING LOGIC ---
  const chartValues = stats?.weeklyChart?.map(d => d.amount) || [];
  const maxWeeklySales = chartValues.length > 0 ? Math.max(...chartValues) : 1000;

  const daysLayout = [
    { label: 'Mon', dbId: 2 },
    { label: 'Tue', dbId: 3 },
    { label: 'Wed', dbId: 4 },
    { label: 'Thu', dbId: 5 },
    { label: 'Fri', dbId: 6 },
    { label: 'Sat', dbId: 7 },
    { label: 'Sun', dbId: 1 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* PAGE ACTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">Analytics Intelligence</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Real-time performance metrics for Pellisco
            </p>
          </div>
          {/* LIVE INDICATOR BADGE */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">
              {stats?.liveUsers || 0} Live Now
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-mutedGreen)]/30 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--color-lightGray)] transition-colors shadow-sm">
            <Calendar size={14} /> Last 7 Days
          </button>
          <button
            onClick={handleExportCSV}
            className=" cursor-pointer flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* TIER 1: DYNAMIC KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`₹ ${stats?.totalRevenue?.toLocaleString() || 0}`}
          change="Live"
          trend="up"
          icon={CreditCard}
        />
        <KPICard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={`${logistics?.completedCount || 0} Done`}
          trend="up"
          icon={ShoppingBag}
        />
        <KPICard
          title="Avg. Order Value"
          value={`₹ ${stats?.avgOrderValue?.toLocaleString() || 0}`}
          change="AOV"
          trend="up"
          icon={Activity}
        />
        <KPICard
          title="Conversion Rate"
          value={stats?.conversionRate || "0%"}
          change={`${stats?.totalVisitors?.toLocaleString() || 0} Visits`}
          trend="up"
          icon={Activity}
        />
      </div>

      {/* TIER 2: PERFORMANCE VISUALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-[var(--color-mutedGreen)]/20 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-primary)]">Revenue Growth</h4>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Weekly Sales Distribution</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-end justify-between gap-4 px-2 border-b border-[var(--color-mutedGreen)]/20 pb-2">
            {daysLayout.map((day) => {
              const dayData = stats?.weeklyChart?.find(d => d._id === day.dbId);
              const amount = dayData ? dayData.amount : 0;
              const heightPercentage = amount > 0 ? (amount / maxWeeklySales) * 100 : 5;

              return (
                <div
                  key={day.label}
                  className="relative flex-1 bg-[var(--color-accent)] rounded-t-lg hover:bg-[var(--color-secondary)] transition-all cursor-pointer group"
                  style={{ height: `${heightPercentage}%` }}
                >
                  {amount > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl border border-white/10">
                      ₹{amount.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[9px] font-bold text-slate-300 tracking-widest uppercase">
            {daysLayout.map(day => <span key={day.label}>{day.label}</span>)}
          </div>
        </div>

        {/* Order Status Mix */}
        <div className="bg-white p-8 rounded-[2rem] border border-[var(--color-mutedGreen)]/20 shadow-sm">
          <h4 className="text-sm font-bold text-[var(--color-primary)] mb-8">Order Status Mix</h4>
          <div className="space-y-6">
            {[
              { label: 'Delivered', count: logistics?.completedCount || 0, color: 'var(--color-secondary)' },
              { label: 'In Transit', count: logistics?.inTransitCount || 0, color: 'var(--color-mutedGreen)' },
              { label: 'Pending', count: logistics?.pendingActionCount || 0, color: 'var(--color-accent)' },
            ].map((item, i) => {
              const total = (logistics?.completedCount || 0) + (logistics?.inTransitCount || 0) + (logistics?.pendingActionCount || 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                    <span>{item.label}</span>
                    <span className="text-slate-400">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 p-6 bg-[var(--color-accent)] rounded-2xl">
            <p className="text-[10px] text-[var(--color-secondary)] font-black uppercase tracking-widest mb-1">Logistics Insight</p>
            <p className="text-[11px] leading-relaxed text-[var(--color-primary)] font-medium">
              Currently, <span className="font-bold">{logistics?.pendingActionCount || 0}</span> orders require processing to reach customers.
            </p>
          </div>
        </div>
      </div>

      {/* TIER 3: EXTENDED LOGISTICS & REACH FOOTER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10">

        <div className="bg-white p-6 rounded-2xl border border-[var(--color-mutedGreen)]/20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h5 className="text-sm font-bold">Ritualists</h5>
              <p className="text-xs text-slate-400">Registered Accounts</p>
            </div>
          </div>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {stats?.totalUsers || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--color-mutedGreen)]/20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Globe size={22} />
            </div>
            <div>
              <h5 className="text-sm font-bold">Total Traffic</h5>
              <p className="text-xs text-slate-400">Site-wide Visitors</p>
            </div>
          </div>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {stats?.totalVisitors?.toLocaleString() || 0}
          </p>
        </div>

        {/* NEW: LIVE USERS CARD */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
             <Radio size={12} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <Activity size={22} className="animate-bounce duration-[3000ms]" />
            </div>
            <div>
              <h5 className="text-sm font-bold">Live Now</h5>
              <p className="text-xs text-slate-400">Active Sessions</p>
            </div>
          </div>
          <p className="text-lg font-bold text-emerald-600">
            {stats?.liveUsers || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--color-mutedGreen)]/20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold">Fulfillment</h5>
              <p className="text-xs text-slate-400">Delivered Orders</p>
            </div>
          </div>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {logistics?.completedCount || 0}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AAnalytics;
