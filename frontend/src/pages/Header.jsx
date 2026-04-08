import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Search,
  User,
  X,
  ChevronDown,
  ArrowRight,
  ShoppingBag,
  LayoutDashboard,
  UserCircle,
  LogOut,
  LucideLayoutDashboard,
  Trash2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../features/cart/cartSlice";
import Button from "../components/Button";

// 1. HOIST STATIC DATA: Move outside to prevent re-allocation on every render
const NAV_LINKS = [
  { name: "Home", path: "/" },
  {
    name: "Skin Care",
    hasDropdown: true,
    path: "/products?mainCategory=skin-care",
    subItems: [
      { name: "Cleanser", path: "/products?category=cleanser" },
      { name: "Toner", path: "/products?category=toner" },
      { name: "Moisturizer", path: "/products?category=moisturizer" },
      { name: "Sun Protection", path: "/products?category=sun-protection" },
    ],
  },
  {
    name: "Hair Care",
    hasDropdown: true,
    path: "/products?mainCategory=hair-care",
    subItems: [
      { name: "Shampoo", path: "/products?category=shampoo" },
      { name: "Conditioner", path: "/products?category=conditioner" },
      { name: "Hair Masks", path: "/products?category=hair-mask" },
      { name: "Serums", path: "/products?category=hair-serum" },
    ],
  },
  {
    name: "Treatments",
    hasDropdown: true,
    path: "/products?mainCategory=treatments",
    subItems: [
      { name: "Facial Kits", path: "/products?category=facial-kits" },
      { name: "Peel of Masque", path: "/products?category=peel-masque" },
      {
        name: "Professional Serum",
        path: "/products?category=professional-serum",
      },
    ],
  },
  {
    name: "Shop",
    hasDropdown: true,
    path: "/products",
    subItems: [
      { name: "New Arrivals", path: "/products?sort=-createdAt" },
      { name: "Best Sellers", path: "/products?sort=-ratings" },
      { name: "Travel Size", path: "/products?category=travel-size" },
      { name: "Gift Sets", path: "/products?category=gift-sets" },
    ],
  },
];

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleIncrease = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrease = (id) => {
    dispatch(decrementQuantity(id));
  };

  // Redux Auth State
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // 2. MEMOIZED ACTIONS: Prevent child re-renders
  const handleLogout = useCallback(() => {
    // dispatch(logout()); // Uncomment when your action is ready
    setIsUserMenuOpen(false);
    navigate("/login");
  }, [navigate]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const closeAllMenus = useCallback(() => {
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
    setActiveDropdown(null);
  }, []);

  // 3. OPTIMIZED SIDE EFFECTS
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeAllMenus();
    };
    window.addEventListener("keydown", handleEsc);

    const html = document.documentElement;
    const isAnyModalOpen = isSearchOpen || isCartOpen;

    if (isAnyModalOpen) {
      // Calculate scrollbar width only once when opening
      const scrollBarWidth = window.innerWidth - html.clientWidth;
      html.style.setProperty("--scrollbar-width", `${scrollBarWidth}px`);
      html.style.marginRight = "var(--scrollbar-width)";
      html.style.overflow = "hidden";
    } else {
      html.style.marginRight = "0px";
      html.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      html.style.overflow = "";
      html.style.marginRight = "0px";
    };
  }, [isSearchOpen, isCartOpen, closeAllMenus]);

  return (
    <>
      {/* --- SNAPPY SEARCH MODAL --- */}
      <div
        className={`fixed inset-0 z-100 flex items-center justify-center transition-all duration-300 ease-out ${
          isSearchOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          onClick={() => setIsSearchOpen(false)}
        />
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-10 right-10 text-white/30 hover:text-white transition-colors z-101 cursor-pointer"
        >
          <X size={32} strokeWidth={1} />
        </button>
        <div
          className={`relative w-full max-w-4xl px-6 z-101 transition-all duration-300 ease-out ${
            isSearchOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95"
          }`}
        >
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] text-secondary font-poppins font-bold">
              Explore the Collection
            </span>
            <div className="mt-6 relative border-b border-white/20 pb-4 group transition-colors duration-300 hover:border-white focus-within:border-white">
              <input
                type="text"
                placeholder="Search Products..."
                className="w-full bg-transparent text-white text-3xl md:text-6xl font-serif outline-none placeholder:text-white/10 italic"
                autoFocus={isSearchOpen}
              />
              <Search
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white group-focus-within:text-white transition-colors duration-300"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- SNAPPY CART DRAWER --- */}
      <div
        className={`fixed inset-0 z-100 transition-all duration-500 ${
          isCartOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/80 transition-opacity duration-500 ease-in-out ${
            isCartOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsCartOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: "#FDFDFB" }}
        >
          <div className="p-8 pb-6 flex flex-col border-b border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl italic text-primary tracking-tight">
                Your Bag
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="group p-2 -mr-2 transition-colors cursor-pointer"
              >
                <X
                  size={20}
                  className="text-primary/40 group-hover:text-primary transition-colors"
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-poppins">
                <span className="text-primary/60">
                  Spend $20 more for free shipping
                </span>
                <span className="font-bold text-secondary text-right">75%</span>
              </div>
              <div className="h-2px w-full bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-1000 w-[75%]" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 py-6 border-b border-mutedGreen/40 relative"
              >
                {/* DELETE BUTTON */}
                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="absolute right-0 top-6 p-2 text-red-500 hover:text-white
                  bg-white hover:bg-red-500
                  border border-red-200 hover:border-red-500
                  rounded-full
                  shadow-sm hover:shadow-md
                  transition-all duration-200 ease-out
                  active:scale-90 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>

                {/* PRODUCT IMAGE */}
                <img
                  src={item.image}
                  className="w-20 h-20 object-cover rounded-md border border-black/5"
                />

                {/* PRODUCT DETAILS */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-poppins font-semibold text-primary">
                      {item.name}
                    </p>

                    <p className="text-[11px] text-primary/40 mt-1">
                      Rs.{item.price} × {item.quantity}
                    </p>

                    {/* TOTAL PRICE */}
                    <p className="text-sm font-serif mt-1 text-secondary">
                      Rs.{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleDecrease(item._id)}
                      className="w-7 h-7 flex items-center justify-center border border-black/10 rounded text-sm hover:bg-black/5 transition"
                    >
                      −
                    </button>

                    <span className="text-sm font-poppins w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => handleIncrease(item._id)}
                      className="w-7 h-7 flex items-center justify-center
            border border-black/10 rounded-md
            bg-white
            hover:bg-secondary hover:text-white
            active:scale-90
            shadow-sm hover:shadow-md
            transition-all duration-200 ease-out
            cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white border-t border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-6">
              <span className="font-poppins text-[10px] uppercase tracking-[0.2em] text-primary/40">
                Subtotal
              </span>
              <span className="font-serif text-2xl text-primary">
                Rs : {subtotal.toFixed(2)}
              </span>
            </div>

           <Button
                label="Secure Checkout"
                className="h-12 text-[10px] tracking-[0.3em] w-full"
                disabled={true}
/>
            <p className="text-center mt-4 text-[9px] font-poppins text-primary/30 uppercase tracking-widest">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>

      {/* --- HEADER MAIN --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-lightGray border-mutedGreen">
        <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between">
          <div className="flex-1">
            <NavLink
              to="/"
              className="inline-block transition-transform hover:scale-105"
            >
              <img
                src="/images/pelliscoLogo.png"
                alt="Pellisco"
                className="h-14 w-auto object-contain"
              />
            </NavLink>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <div
                key={link.name}
                className="relative h-15 flex items-center cursor-pointer"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <NavLink
                  to={link.path}
                  onClick={() => setActiveDropdown(null)}
                  className={({ isActive }) =>
                    `text-[12px] font-poppins font-medium uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${
                      isActive ? "text-secondary" : "hover:text-secondary"
                    }`
                  }
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${
                        activeDropdown === link.name ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </NavLink>

                {link.hasDropdown && (
                  <div
                    className={`absolute top-full left-0 w-64 pt-2 transition-all duration-300 ease-out ${
                      activeDropdown === link.name
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    <div className="bg-white border border-black/5 shadow-xl p-6 rounded-sm">
                      <ul className="space-y-1">
                        {link.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <NavLink
                              to={subItem.path}
                              onClick={() => setActiveDropdown(null)}
                              className={({ isActive }) =>
                                `group flex items-center justify-between py-3 text-[11px] font-poppins font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                                  isActive
                                    ? "text-secondary"
                                    : "text-primary/60 hover:text-secondary"
                                }`
                              }
                            >
                              <span className="relative z-10">
                                {subItem.name}
                              </span>
                              <ArrowRight
                                size={12}
                                className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-secondary z-10"
                              />
                              <div className="absolute bottom-0 left-0 w-full h-1px bg-secondary/10" />
                              <div className="absolute bottom-0 left-0 w-0 h-1px bg-secondary transition-all duration-500 ease-out group-hover:w-full" />
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex-1 flex items-center justify-end gap-5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-secondary transition-colors cursor-pointer"
              aria-label="Open Search"
            >
              <Search size={20} strokeWidth={1.2} />
            </button>

            {/* --- INTEGRATED PROFILE SECTION --- */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-secondary/20 shadow-sm">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `p-2 transition-colors ${
                      isActive ? "text-secondary" : "hover:text-secondary"
                    }`
                  }
                >
                  <User size={20} strokeWidth={1.2} />
                </NavLink>
              )}

              {/* Profile Dropdown */}
              {isAuthenticated && isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-52 bg-white border border-black/5 shadow-2xl p-2 rounded-sm z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 border-b border-black/5 mb-1">
                      <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">
                        Pellisco Ritualist
                      </p>
                      <p className="text-[11px] font-bold text-primary truncate">
                        {user?.name}
                      </p>
                    </div>
                    {user?.role === "admin" && (
                      <NavLink
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-primary/60 hover:text-secondary hover:bg-secondary/5 transition-all uppercase tracking-widest"
                      >
                        <LayoutDashboard size={14} /> Admin Dashboard
                      </NavLink>
                    )}
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-primary/60 hover:text-secondary hover:bg-secondary/5 transition-all uppercase tracking-widest"
                    >
                      <LucideLayoutDashboard size={14} /> User Dashboard
                    </NavLink>
                    <NavLink
                      to="/dashboard/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-primary/60 hover:text-secondary hover:bg-secondary/5 transition-all uppercase tracking-widest"
                    >
                      <UserCircle size={14} /> My Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest border-t border-black/5 mt-1 cursor-pointer"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:text-secondary transition-colors cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.2} />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-secondary text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {totalQuantity}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
