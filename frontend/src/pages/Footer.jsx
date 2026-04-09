
import { NavLink } from "react-router-dom"; // Added NavLink
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Updated to include path-friendly keys
  const footerLinks = [
    {
      title: "Shop",
      links: [
        { name: "All Products", path: "/all-product-list" },
        { name: "Facial Kits", path: "/category/facial-kits" },
        { name: "Homecare", path: "/category/homecare" },
        { name: "Haircare", path: "/category/haircare" },
        { name: "Best Sellers", path: "/best-sellers" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Shipping Policy", path: "/shipping-policies" },
        { name: "Return & Exchanges", path: "/return-exchange" },
        { name: "Track Order", path: "/track-order" },
        { name: "FAQs", path: "/faqs" },
        { name: "Contact Us", path: "/contact-us" },
      ],
    },
    {
      title: "Philosophy",
      links: [
        { name: "Our Story", path: "/our-story" },
        { name: "Science & Ingredients", path: "/science" },
        { name: "Sustainability", path: "/sustainability" },
        { name: "Clinical Studies", path: "/studies" },
        { name: "Journal", path: "/journal" },
      ],
    },
  ];

  return (
    <footer
      className="pt-20 pb-10"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-lightGray)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* --- MAIN FOUR SECTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* 1. BRAND & NEWSLETTER */}
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-3xl tracking-tight text-white">
              PELLISCO<span className="font-light italic">.</span>
            </h2>
            <p className="font-poppins text-xs leading-relaxed opacity-80 max-w-xs">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="relative group max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent border-b py-2 pr-10 text-sm font-poppins focus:outline-none transition-colors"
                style={{ borderColor: "var(--color-mutedGreen)" }}
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-x-1">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* 2, 3, 4. LINK COLUMNS */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-poppins text-[14px] font-bold uppercase tracking-[0.2em] mb-6 text-white opacity-50">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `relative font-poppins text-sm transition-all duration-300 group w-fit block ${
                          isActive
                            ? "opacity-100 text-secondary"
                            : "opacity-80 hover:opacity-100 text-white"
                        }`
                      }
                    >
                      {link.name}
                      {/* Smooth Underline Effect */}
                      <span className="absolute left-0 bottom-0.5 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- DIVIDER --- */}
        <div
          className="h-[1px] w-full mb-8 opacity-20"
          style={{ backgroundColor: "var(--color-mutedGreen)" }}
        />

        {/* --- BOTTOM BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* SOCIAL MEDIA */}
          <div className="flex items-center gap-6">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="transition-transform duration-300 hover:-translate-y-1 hover:text-white opacity-70 hover:opacity-100 text-white"
              >
                <Icon size={20} strokeWidth={1.5} />
              </a>
            ))}
          </div>

          {/* COPYRIGHT & CREDIT */}
          <div className="flex flex-col items-center md:items-end gap-1 font-poppins text-[10px] tracking-widest uppercase opacity-60 text-white">
            <p>© {currentYear} Pellisco Skincare. All Rights Reserved.</p>
            <p>
              Designed by{" "}
              <span className="text-white opacity-100 font-semibold uppercase">
                KaMaN PaNaG
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
