import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { LayoutDashboard, LogOut, ShoppingBag, Settings, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Extract state from Redux
  const { user, loading } = useSelector((state) => state.auth);

  // 2. Protocol & Quality Fixer
  // Replaces http with https and handles the broken '/0' placeholder
  const rawUrl = user?.avatar?.url || "";
  const secureUrl = rawUrl.replace("http://", "https://");
  const isImageValid = secureUrl && secureUrl.length > 50 && !secureUrl.endsWith('/0');

  const profileImg = isImageValid
    ? secureUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=111111&color=ffffff&bold=true`;

  // 3. Navigation Guard
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Signed out from Pellisco");
      navigate('/login');
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  // 4. Elegant Loading State
  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black mb-4" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Pellisco Rituals</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A1A1A] font-sans antialiased">

      {/* --- MOBILE HEADER --- */}
      <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50">
        <h1 className="text-xs font-black tracking-[0.2em] uppercase">Pellisco</h1>
        <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
           <img
             key={profileImg}
             src={profileImg}
             referrerPolicy="no-referrer"
             className="h-full w-full object-cover block"
             alt="Profile"
             onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`; }}
           />
        </div>
      </header>

      <div className="flex flex-1">

        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-10 pb-8">
            <h1 className="text-sm font-black tracking-[0.3em] uppercase border-l-4 border-black pl-4">
              Dashboard
            </h1>
          </div>

          {/* User Identity Branding */}
          <div className="px-8 pb-10 flex items-center gap-4">
             <div className="h-12 w-12 min-w-[48px] rounded-full overflow-hidden ring-4 ring-gray-50 border border-gray-100 shadow-sm bg-gray-100">
                <img
                  key={profileImg}
                  src={profileImg}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover block"
                  alt={user.name}
                />
             </div>
             <div className="overflow-hidden">
                <p className="text-[11px] font-bold truncate uppercase tracking-tighter">{user.name}</p>
                <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">
                  {user.tier || 'Brown'} Ritualist
                </p>
             </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 space-y-1">
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="Overview" end />
            <SidebarLink to="/dashboard/orders" icon={<ShoppingBag size={18}/>} label="My Orders" />
            <SidebarLink to="/dashboard/profile" icon={<UserIcon size={18}/>} label="My Profile" />
            <SidebarLink to="/dashboard/partnership" icon={<UserIcon size={18}/>} label="Partnership" />
            <SidebarLink to="/dashboard/settings" icon={<Settings size={18}/>} label="Account" />
          </nav>

          {/* Bottom Logout */}
          <div className="p-8 border-t border-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 text-[10px] font-bold text-gray-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-xl"
            >
              <LogOut size={16} />
              <span className="uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Desktop Top Header */}
          <header className="h-20 hidden lg:flex items-center justify-end px-12 bg-white/40 backdrop-blur-md border-b border-gray-50">
             <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em]">
                     {user.preferredCurrency || 'INR'} • CLIENT PORTAL
                   </p>
                   <p className="text-[11px] font-semibold text-gray-600">{user.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                   <img
                    key={profileImg}
                    src={profileImg}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    alt=""
                   />
                </div>
             </div>
          </header>

          <main className="flex-1 p-6 md:p-12 max-w-6xl w-full mx-auto pb-32">
            <Outlet />
          </main>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION --- */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-black text-white rounded-2xl px-8 py-4 flex items-center justify-between z-50 shadow-2xl shadow-black/20 border border-white/10">
        <MobileNavLink to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Home" end />
        <MobileNavLink to="/dashboard/orders" icon={<ShoppingBag size={20}/>} label="Orders" />
        <MobileNavLink to="/dashboard/profile" icon={<UserIcon size={20}/>} label="Profile" />
        <MobileNavLink to="/dashboard/settings" icon={<Settings size={20}/>} label="Account" />
      </nav>
    </div>
  );
};

/* --- SHARED STYLES & HELPERS --- */

const SidebarLink = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center space-x-3 px-4 py-3.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest
      ${isActive
        ? 'bg-black text-white shadow-xl shadow-black/10 scale-[1.02]'
        : 'text-gray-400 hover:bg-gray-50 hover:text-black'
      }
    `}
  >
    {icon} <span>{label}</span>
  </NavLink>
);

const MobileNavLink = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex flex-col items-center gap-1 transition-all
      ${isActive ? 'text-white scale-110' : 'text-gray-500'}
    `}
  >
    {icon}
    <span className="text-[8px] font-bold uppercase tracking-tighter">{label}</span>
  </NavLink>
);

export default UserDashboardLayout;
