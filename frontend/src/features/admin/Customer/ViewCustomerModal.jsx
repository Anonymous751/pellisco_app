import React from 'react';
import {
  X, Mail, Phone, MapPin, Calendar, Award,
  ShieldCheck, ShoppingBag, Fingerprint, Activity,
  UserCircle, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { useSelector } from 'react-redux';

const ViewCustomerModal = ({ isOpen, onClose }) => {
  const { user, loading } = useSelector((state) => state.customer);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">

        {/* Header with Background & Close */}
        <div className="relative h-40 bg-gradient-to-br from-accent to-lightGray">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all z-10"
          >
            <X size={18} className="text-primary" />
          </button>
        </div>

        {/* Profile Identity Section */}
        <div className="px-10 pb-10 -mt-20 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <img
              src={user.avatar?.url || '/default-avatar.png'}
              className="w-40 h-40 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl bg-white"
              alt={user.name}
            />
            <div className="pb-4 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">{user.name}</h2>
                {user.isVerified && <CheckCircle2 size={20} className="text-blue-500" />}
              </div>
              <p className="text-mutedGreen font-mono text-[11px] font-bold">ID: {user._id}</p>

              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge label={`${user.tier || 'Brown'} Member`} color="bg-secondary text-white" />
                <Badge label={user.role || 'User'} color="bg-primary text-white" />
                <StatusBadge status={user.accountStatus} />
              </div>
            </div>
          </div>

          <hr className="my-8 border-mutedGreen/10" />

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

            {/* Contact & Location */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 opacity-50">Contact Details</h3>
              <DetailItem icon={Mail} label="Email Address" value={user.email} />
              <DetailItem icon={Phone} label="Contact Number" value={user.phone || 'Not Linked'} />
              <DetailItem icon={MapPin} label="Residential City" value={user.city || 'Global User'} />
              <DetailItem icon={Activity} label="Login Method" value={user.twoFactorEnabled ? "2FA Secured" : "Standard OTP"} />
            </section>

            {/* Account & Activity */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 opacity-50">Ritualist Activity</h3>
              <DetailItem icon={ShoppingBag} label="Total Orders" value={`${user.numOfOrders || 0} Successful Orders`} />
              <DetailItem icon={Award} label="Lifetime Value" value={`₹${(user.totalSpent || 0).toLocaleString()}/-`} />
              <DetailItem icon={Calendar} label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <DetailItem icon={Clock} label="Last Profile Update" value={new Date(user.updatedAt).toLocaleDateString()} />
            </section>

          </div>

          {/* Footer Branding */}
          <div className="mt-12 p-6 bg-lightGray rounded-[1.5rem] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-secondary" size={24} />
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Account Security</p>
                <p className="text-[9px] text-mutedGreen font-medium">This ritualist profile is managed via Pellisco Admin Global.</p>
              </div>
            </div>
            <img src="/logo-sm.png" alt="Pellisco" className="h-4 opacity-20 grayscale" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components for Cleanliness ---

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="p-3 bg-lightGray rounded-2xl text-mutedGreen group-hover:bg-accent group-hover:text-secondary transition-colors">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[9px] font-black text-mutedGreen uppercase tracking-widest">{label}</p>
      <p className="text-[13px] font-bold text-primary">{value}</p>
    </div>
  </div>
);

const Badge = ({ label, color }) => (
  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${color}`}>
    {label}
  </span>
);

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-amber-100 text-amber-700 border-amber-200',
    blocked: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.active}`}>
      {status || 'active'}
    </span>
  );
};

export default ViewCustomerModal;
