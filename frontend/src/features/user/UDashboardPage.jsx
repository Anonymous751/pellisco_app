import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Star, ShieldCheck, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { clearErrors, fetchMyOrders } from '../admin/order/orderSlice';


const UDashboardPage = () => {
  const dispatch = useDispatch();

  // Get data from Auth and Order slices
  const { user } = useSelector((state) => state.auth);
  const { totalOrders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1 }));
    return () => dispatch(clearErrors());
  }, [dispatch]);

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-10">
      {/* 1. MINIMALIST HEADER */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif text-[var(--color-primary)] font-medium">
            Bonjour, <span className="italic">{user?.name?.split(' ')[0] || 'Ritualist'}</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">Tracking your progress and skincare rituals.</p>
        </div>
      </section>

      {/* 2. CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatTile
          label="Skin Points"
          value={user?.points || 0}
          icon={<Star size={18} />}
          description="Ready to redeem"
        />
        <StatTile
          label="Archive Count"
          value={loading ? <Loader2 className="animate-spin" size={20} /> : totalOrders || 0}
          icon={<Package size={18} />}
          description="Total rituals completed"
        />
        <StatTile
          label="Current Tier"
          value={user?.tier || "Brown"}
          icon={<ShieldCheck size={18} />}
          description={user?.role === 'admin' ? 'Administrator Access' : 'Loyalty Status'}
          highlight
        />
      </div>

      {/* 3. LOYALTY PROGRESS (Informative Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-[var(--color-accent)] p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp size={14} /> Tier Progression
            </h3>
          </div>
          <TierProgressBar totalSpent={user?.totalSpent || 0} />
        </div>

        {/* 4. IDENTITY SUMMARY */}
        <div className="bg-[var(--color-primary)] text-white rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-8">Verified Ritualist</h3>

          <div className="space-y-6">
            <ProfileRow label="Email" value={user?.email} />
            <ProfileRow label="Member Since" value={new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
            <div className="pt-4 flex items-center gap-2 text-[var(--color-secondary)] font-bold text-xs cursor-pointer hover:gap-3 transition-all">
              Update Profile <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const TierProgressBar = ({ totalSpent }) => {
  // Logic to determine next tier and progress
  const tiers = [
    { name: 'Brown', min: 0, max: 10000 },
    { name: 'Silver', min: 10000, max: 50000 },
    { name: 'Gold', min: 50000, max: 100000 },
    { name: 'Platinum', min: 100000, max: Infinity }
  ];

  const currentTier = tiers.find(t => totalSpent >= t.min && totalSpent < t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];

  const progress = nextTier
    ? ((totalSpent - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-serif font-bold text-[var(--color-primary)] italic">₹{totalSpent.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Total Investment</p>
        </div>
        {nextTier && (
          <p className="text-[10px] text-gray-400 font-bold uppercase text-right">
            ₹{(nextTier.min - totalSpent).toLocaleString()} to {nextTier.name}
          </p>
        )}
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[var(--color-secondary)] h-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

const StatTile = ({ label, value, icon, description, highlight }) => (
  <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${
    highlight ? 'bg-[var(--color-lightGray)] border-[var(--color-secondary)]' : 'bg-white border-[var(--color-accent)]'
  }`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-[var(--color-lightGray)] rounded-xl text-[var(--color-secondary)]">
        {icon}
      </div>
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <div className="text-3xl font-serif font-bold text-[var(--color-primary)] mt-1">{value}</div>
    <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{description}</p>
  </div>
);

const ProfileRow = ({ label, value }) => (
  <div className="border-b border-white/10 pb-3">
    <p className="text-[9px] font-bold opacity-40 uppercase tracking-tighter mb-1">{label}</p>
    <p className="text-sm font-medium">{value || 'Not Provided'}</p>
  </div>
);

export default UDashboardPage;
