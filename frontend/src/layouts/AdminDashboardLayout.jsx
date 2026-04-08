import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  Settings, Sparkles, BarChart3, Scissors, Truck,
  Menu, X, LogOut, ChevronRight, Search, Bell, Tag, Star, ShieldCheck
} from "lucide-react";
import { logoutUser } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

const AdminDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);
  const { pathname } = useLocation();

  /* =========================
      LOGOUT
  ========================= */
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  /* =========================
      NAVIGATION
  ========================= */
  const navigation = [
    {
      group: "Intelligence",
      items: [
        { label: "Overview", path: "/admin", icon: LayoutDashboard },
        { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
        { label: "Coupon", path: "/admin/marketing", icon: Tag },
      ],
    },
    {
      group: "Commerce",
      items: [
        { label: "Inventory", path: "/admin/inventory", icon: Package },
        { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
        { label: "Customers", path: "/admin/customers", icon: Users },
        { label: "Shipping", path: "/admin/shipping", icon: Truck },
      ],
    },
    {
      group: "Boutique & Partners",
      items: [
        { label: "Salon Partners", path: "/admin/partnership", icon: Scissors },
        { label: "Reviews", path: "/admin/reviews", icon: Star },
      ],
    },
    {
      group: "Content & System",
      items: [
        { label: "Storefront", path: "/admin/storefront", icon: Sparkles },
        { label: "Security", path: "/admin/security", icon: ShieldCheck },
        { label: "Settings", path: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#FDFDFB] text-[#2D2424] font-sans antialiased">

      {/* SIDEBAR */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-white border-r border-[#BCCDD3]/30 transition-all duration-300 flex flex-col z-30`}>

        {/* LOGO */}
        <div className="h-20 flex items-center px-6 border-b border-[#BCCDD3]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#296374] rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>

            {isOpen && (
              <div className="flex flex-col">
                <span className="text-[#2D2424] tracking-[3px] uppercase text-[11px] font-bold italic">
                  Pellisco
                </span>
                <span className="text-[#296374] text-[7px] font-bold uppercase tracking-[2px] mt-1.5">
                  Management
                </span>
              </div>
            )}
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-6 space-y-7 overflow-y-auto no-scrollbar">
          {navigation.map((group, idx) => (
            <div key={idx}>
              {isOpen && (
                <h3 className="px-3 text-[9px] font-bold text-[#BCCDD3] uppercase tracking-[2px] mb-3">
                  {group.group}
                </h3>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl relative ${
                      isActive
                        ? "text-[#296374] bg-[#E8F0F2]"
                        : "text-slate-400 hover:text-[#296374] hover:bg-[#E8F0F2]/50"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    {isOpen && <span className="text-[12px] font-medium">{item.label}</span>}

                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-[#296374] rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-[#BCCDD3]/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-[#D44444]"
          >
            <LogOut size={18} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-[#BCCDD3]/20 flex items-center justify-between px-8">

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-400 hover:text-[#296374] hover:bg-[#E8F0F2] rounded-lg"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-medium text-[#BCCDD3] uppercase tracking-wider">
              <span>Admin</span>
              <ChevronRight size={10} />
              <span className="text-[#2D2424] font-bold">
                {pathname.split("/").pop() || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BCCDD3]" size={14} />
              <input
                className="pl-9 pr-4 py-1.5 bg-[#E8F0F2] rounded-lg text-xs w-48 focus:w-64 focus:bg-white transition-all outline-none"
                placeholder="Quick search..."
              />
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-[#BCCDD3]/30">

              <button className="relative text-[#BCCDD3] hover:text-[#296374]">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#D44444] rounded-full border border-white"></span>
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[11px] font-bold uppercase">
                    Pellisco Admin
                  </span>
                  <span className="text-[9px] text-[#BCCDD3]">
                    admin@pellisco.com
                  </span>
                </div>

                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pellisco"
                  alt="admin"
                  className="w-9 h-9 rounded-full border"
                />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
