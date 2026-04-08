import React, { useState } from "react";
import {
  Package,
  CheckCircle2,
  MapPin,
  Search,
  ExternalLink,
  AlertCircle,
  Box,
  ChevronRight,
} from "lucide-react";
import BrandWatermark from "../components/BrandWatermark";

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");

  const orderDetails = {
    id: "PLSC-982341",
    status: "In Transit",
    estimatedDelivery: "March 18, 2026",
    customer: "Julianne V. Sterling",
    address: "742 Artisan Way, Penthouse B, New York, NY",
    items: [
      { name: "Molecular Bonding Shampoo", qty: 1, price: "$48.00" },
      { name: "Cortex Repair Ritual Mask", qty: 1, price: "$62.00" },
    ],
    timeline: [
      { status: "Delivered", date: "Pending", completed: false },
      {
        status: "Out for Delivery",
        date: "Expected Today",
        current: true,
        completed: false,
      },
      { status: "In Transit", date: "March 14, 2026", completed: true },
      {
        status: "Laboratory Dispatch",
        date: "March 13, 2026",
        completed: true,
      },
      { status: "Order Confirmed", date: "March 12, 2026", completed: true },
    ],
  };

  return (
    <div className="bg-white min-h-screen font-poppins text-primary selection:bg-secondary/10">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-24 bg-[#FBFBFB] border-b border-black/5 px-6 min-h-162.5 flex items-center justify-center overflow-hidden">
        {/* Visual Layer 1: Watermark - Center Aligned */}
        <BrandWatermark primaryText="Pellisco" secondaryText="Professional" />

        {/* Visual Layer 2: Main Content */}
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <h4 className="text-[10px] uppercase tracking-[0.5em] text-secondary font-black mb-6">
            Concierge Tracking
          </h4>
          <h1 className="font-serif text-6xl md:text-8xl italic mb-12">
            Track your <span className="text-secondary">Order.</span>
          </h1>

          <div className="relative max-w-2xl mx-auto group">
            <input
              type="text"
              placeholder="Enter Order Number (e.g. PLSC-0000)"
              className="w-full bg-white/60 backdrop-blur-md border-2 border-black/5 rounded-3xl py-7 px-8 pr-16 text-lg focus:outline-none focus:border-secondary transition-all shadow-xl shadow-black/5 placeholder:text-black/20"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-5 rounded-2xl hover:bg-secondary transition-all shadow-lg active:scale-95">
              <Search size={22} />
            </button>
          </div>
          <div className="mt-8 border-l border-white/20 pl-4 py-1">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-bold text-danger">
              Note: Verified Pellisco Professional IDs Only
            </p>
          </div>
        </div>
      </section>

      {/* --- TRACKING RESULT AREA --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: STATUS TIMELINE */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-black/5 rounded-[4rem] p-12 md:p-16 shadow-sm relative overflow-hidden">
              <div className="absolute top-10 right-10 text-6xl font-serif italic text-black/2 pointer-events-none uppercase">
                {orderDetails.id}
              </div>

              <div className="flex justify-between items-start mb-16 relative z-10">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-black text-secondary mb-3">
                    Shipment Status
                  </h3>
                  <h2 className="text-5xl font-serif italic">
                    {orderDetails.status}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-1">
                    Est. Delivery
                  </p>
                  <p className="text-xl font-bold">
                    {orderDetails.estimatedDelivery}
                  </p>
                </div>
              </div>

              <div className="space-y-0 relative z-10">
                {orderDetails.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-10 group">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          step.completed
                            ? "bg-secondary border-secondary text-white"
                            : step.current
                            ? "bg-white border-secondary text-secondary ring-8 ring-secondary/5 animate-pulse"
                            : "bg-white border-black/10 text-black/10"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Box size={20} />
                        )}
                      </div>
                      {idx !== orderDetails.timeline.length - 1 && (
                        <div
                          className={`w-1px h-24 ${
                            step.completed ? "bg-secondary" : "bg-black/5"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <h4
                        className={`text-2xl font-serif italic ${
                          step.current
                            ? "text-secondary"
                            : "text-primary opacity-80"
                        }`}
                      >
                        {step.status}
                      </h4>
                      <p className="text-sm opacity-40 font-medium mt-1 uppercase tracking-[0.2em]">
                        {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INFO CARDS */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-primary text-white rounded-[4rem] p-12 space-y-10 shadow-2xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 text-white/3 scale-150 rotate-12">
                <Package size={200} />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <MapPin className="text-secondary" size={28} />
                <h3 className="text-2xl font-serif italic">Destination</h3>
              </div>
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-2">
                    Recipient
                  </p>
                  <p className="text-xl font-medium">{orderDetails.customer}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-2">
                    Address
                  </p>
                  <p className="text-lg font-light leading-relaxed opacity-80">
                    {orderDetails.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F8F8] rounded-[4rem] p-12 border border-black/5">
              <h3 className="text-2xl font-serif italic mb-8">Order Items</h3>
              <div className="space-y-6">
                {orderDetails.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-4 border-b border-black/5 last:border-0"
                  >
                    <div className="flex gap-5 items-center">
                      <span className="text-xs font-black bg-white w-8 h-8 flex items-center justify-center rounded-xl border border-black/5">
                        {item.qty}
                      </span>
                      <p className="text-base font-medium">{item.name}</p>
                    </div>
                    <p className="text-base font-bold opacity-50">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SUPPORT --- */}
      <footer className="py-24 border-t border-black/5 text-center bg-[#FBFBFB]">
        <h2 className="font-serif text-4xl italic mb-10 text-primary">
          Need human assistance?
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          <button className="text-[11px] font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-2 hover:text-secondary hover:border-secondary transition-all">
            Live Concierge
          </button>
          <button className="text-[11px] font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-2 hover:text-secondary hover:border-secondary transition-all">
            Email Dispatch
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TrackOrder;
