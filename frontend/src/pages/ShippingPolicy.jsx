import {
  Truck,
  Globe,
  ShieldCheck,
  Clock,
  MapPin,
  Package,
  Info,
  ArrowRight,
} from "lucide-react";
import BrandWatermark from "../components/BrandWatermark";

const ShippingPolicy = () => {
  return (
    <div className="bg-white min-h-screen font-poppins text-primary selection:bg-secondary/10">
      {/* --- TIGHT HERO SECTION --- */}
      <section className="relative pt-32 pb-16 bg-[#FBFBFB] border-b border-black/5 overflow-hidden">
        {/* Watermark Integration */}
        <BrandWatermark />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-black/5 mb-6">
            <Truck size={14} className="text-secondary" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-black">
              Global Logistics
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl italic leading-tight mb-4">
            Shipping <span className="text-secondary">&</span> Delivery.
          </h1>
          <p className="text-lg opacity-60 max-w-2xl font-light italic">
            Clinical precision from our laboratory to your doorstep.
          </p>
        </div>
      </section>
      {/* --- QUICK STATS BAR (SAVES SPACE) --- */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <Clock size={20} className="text-secondary" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              24hr Processing
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck size={20} className="text-secondary" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Insured Parcels
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Globe size={20} className="text-secondary" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Worldwide Entry
            </p>
          </div>
          <div className="flex items-center gap-4">
            <MapPin size={20} className="text-secondary" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Live Tracking
            </p>
          </div>
        </div>
      </div>

      {/* --- POLICY BODY: TIGHT SPACING & BULLETS --- */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Domestic & Rates */}
          <div className="lg:col-span-6 space-y-10">
            <div>
              <h2 className="text-2xl font-serif italic mb-6 border-b pb-4">
                Domestic Fulfillment
              </h2>
              <ul className="space-y-4">
                <PolicyBullet
                  title="Standard Delivery"
                  text="Complimentary for orders over $150. (3–5 Business Days)"
                />
                <PolicyBullet
                  title="Express Ritual"
                  text="Flat rate of $25. Guaranteed delivery within 1–2 Business Days."
                />
                <PolicyBullet
                  title="Processing Time"
                  text="Orders placed before 1:00 PM EST are dispatched same-day from our facility."
                />
                <PolicyBullet
                  title="Courier Partners"
                  text="Exclusively via FedEx Premium and UPS Carbon Neutral."
                />
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif italic mb-6 border-b pb-4">
                International Logistics
              </h2>
              <ul className="space-y-4">
                <PolicyBullet
                  title="Global Shipping"
                  text="We deliver to over 40 countries using DHL Express Worldwide."
                />
                <PolicyBullet
                  title="Duties & Taxes"
                  text="All international orders are DDP (Delivered Duty Paid). No hidden customs fees upon arrival."
                />
                <PolicyBullet
                  title="Transit Time"
                  text="Typically 5–10 Business Days depending on destination and local clearance."
                />
              </ul>
            </div>
          </div>

          {/* Right Column: Pro Partners & Details */}
          <div className="lg:col-span-6 space-y-10">
            <div className="bg-lightGray/30 p-10 rounded-[3rem] border border-black/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <Package size={20} />
                </div>
                <h3 className="text-xl font-serif italic">
                  Professional Backbar
                </h3>
              </div>
              <p className="text-sm opacity-70 leading-relaxed mb-6 font-light">
                For our Salon Partners and Certified Stylists, we utilize
                high-capacity freight for bulk inventory.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />{" "}
                  Priority Fulfillment
                </li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />{" "}
                  Hazard-Safe Packing
                </li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />{" "}
                  Tax-Exempt Shipping (Validated Pro ID)
                </li>
              </ul>
            </div>

            <div className="px-6">
              <h2 className="text-2xl font-serif italic mb-6 border-b pb-4">
                Tracking Your Ritual
              </h2>
              <p className="text-sm opacity-60 leading-relaxed mb-6 font-light">
                Upon dispatch, a unique tracking number and an interactive
                delivery dashboard link will be sent to your registered email.
              </p>
              <div className="flex items-start gap-4 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                <Info size={18} className="text-secondary shrink-0 mt-1" />
                <p className="text-xs italic leading-relaxed opacity-80">
                  Note: Pellisco Professional is not responsible for delays
                  caused by extreme weather conditions or carrier-specific labor
                  disputes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MINIMAL CONTACT FOOTER --- */}
      <section className="py-16 border-t border-black/5 text-center">
        <p className="text-sm opacity-40 font-bold uppercase tracking-[0.3em] mb-4">
          Concierge Support
        </p>
        <h3 className="font-serif text-3xl italic mb-8">
          Questions regarding your parcel?
        </h3>
        <div className="flex justify-center gap-8">
          <button className="text-xs font-black uppercase tracking-widest border-b-2 border-secondary pb-1 hover:text-secondary transition-all">
            Track Order
          </button>
          <button className="text-xs font-black uppercase tracking-widest border-b-2 border-secondary pb-1 hover:text-secondary transition-all">
            Email Logistics
          </button>
        </div>
      </section>
    </div>
  );
};

// --- HELPER COMPONENT FOR BULLETS ---

const PolicyBullet = ({ title, text }) => (
  <li className="flex items-start gap-4 group">
    <div className="mt-1.5">
      <ArrowRight
        size={14}
        className="text-secondary group-hover:translate-x-1 transition-transform"
      />
    </div>
    <div>
      <span className="text-sm font-black uppercase tracking-widest block mb-1">
        {title}
      </span>
      <span className="text-base opacity-60 font-light leading-relaxed">
        {text}
      </span>
    </div>
  </li>
);

export default ShippingPolicy;
