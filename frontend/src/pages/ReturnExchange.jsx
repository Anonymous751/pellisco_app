import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Truck,
  HelpCircle,
  ArrowRight,
  PackageSearch,
  Zap,
  RefreshCw,
} from "lucide-react";
import BrandWatermark from "../components/BrandWatermark";

const ReturnsExchanges = () => {
  return (
    <div className="bg-white min-h-screen font-poppins text-primary">
      {/* --- HERO SECTION: BOLD & EDITORIAL --- */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-[#FBFBFB]">
        {/* Watermark Component Integrated Here */}
        <BrandWatermark className="mb-12" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <div className="lg:col-span-7">
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-[0.5em] font-black text-secondary mb-4">
                Customer Care
              </h4>
              <h2 className="text-xl font-bold uppercase tracking-tighter opacity-30">
                Returns & Exchanges
              </h2>
            </div>

            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-black/5 mb-10">
              <ShieldCheck size={20} className="text-secondary" />
              <span className="text-xs uppercase tracking-[0.3em] font-black">
                Pellisco Assurance
              </span>
            </div>

            <h1 className="font-serif text-6xl md:text-[100px] italic leading-[0.85] mb-12 tracking-tighter">
              A seamless <br />
              <span className="text-secondary/80">restoration.</span>
            </h1>

            <p className="text-2xl md:text-3xl leading-relaxed font-medium text-primary/80 max-w-2xl italic">
              "If the science doesn't match your spirit, we'll make it right."
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-3/4 rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rotate-3 hover:rotate-0 transition-all duration-1000">
              <img
                src="https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg"
                alt="Product Quality"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- MASSIVE TRUST BAR --- */}
      <div className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <TrustFactor
            icon={<CheckCircle2 size={32} />}
            title="HASSLE-FREE"
            text="Seamless Portal"
          />
          <TrustFactor
            icon={<Clock size={32} />}
            title="30 DAYS"
            text="To Decide"
          />
          <TrustFactor
            icon={<UserCheck size={32} />}
            title="CONCIERGE"
            text="Human Support"
          />
          <TrustFactor
            icon={<Truck size={32} />}
            title="PRE-PAID"
            text="Tracked Return"
          />
        </div>
      </div>

      {/* --- THE STEPS: BIG, BOLD TILES --- */}
      <section className="py-40 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-baseline mb-24 gap-8">
          <h2 className="font-serif text-6xl md:text-8xl italic">
            The Process.
          </h2>
          <div className="h-2px grow bg-black/5 mx-12 hidden lg:block" />
          <p className="text-2xl font-light opacity-50 uppercase tracking-widest">
            Efficiency by design
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <BigStep
            icon={<PackageSearch size={48} strokeWidth={1} />}
            number="01"
            title="Digital Claim"
            desc="Enter our <b>Professional Portal</b> with your order ID. We value your feedback as much as our formulas."
          />
          <BigStep
            icon={<Zap size={48} strokeWidth={1} />}
            number="02"
            title="Premium Transit"
            desc="Use our pre-paid <b>Priority Label</b>. Secure your sealed ritual items in their original protective housing."
          />
          <BigStep
            icon={<RefreshCw size={48} strokeWidth={1} />}
            number="03"
            title="Full Credit"
            desc="Upon lab verification of the security seal, your refund is processed within <b>7 business days</b>."
          />
        </div>
      </section>

      {/* --- INDUSTRY LEVEL POLICY SECTION --- */}
      <section className="pb-10 px-6">
        <div className="max-w-7xl mx-auto bg-lightGray/40 rounded-[5rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-16 md:p-24 space-y-12">
            <h3 className="font-serif text-5xl md:text-7xl italic leading-tight">
              Clinical <br /> Standards.
            </h3>
            <div className="space-y-12">
              <PolicyItem
                title="SEAL INTEGRITY"
                text="For biological safety, we only accept returns on items with the clinical seal undisturbed."
              />
              <PolicyItem
                title="RESTOCKING FEE"
                text="A flat $10 fee is applied to maintain our carbon-neutral laboratory standards."
              />
              <PolicyItem
                title="DAMAGED GOODS"
                text="Report any shipping damage within 48 hours for an immediate, complimentary replacement."
              />
            </div>
          </div>
          <div className="relative min-h-125">
            <img
              src="https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg"
              alt="Laboratory"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
            <div className="absolute bottom-16 left-16 right-16 bg-white p-12 rounded-[3rem] shadow-2xl">
              <HelpCircle className="text-secondary mb-6" size={40} />
              <h4 className="font-serif text-3xl italic mb-4">
                Partner Support
              </h4>
              <p className="text-lg opacity-60 font-light mb-8">
                Professional accounts and salons, please reach out to your
                Regional Director for inventory rotations.
              </p>
              <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] group">
                Go to Pro Portal{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CONTACT: THE CONCIERGE --- */}
      <section className="py-20 text-center relative overflow-hidden">
        <h2 className="font-serif text-6xl md:text-[12rem] italic mb-16 opacity-[0.03] absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none select-none">
          Concierge
        </h2>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="font-serif text-5xl md:text-7xl italic mb-12">
            Human Assistance.
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <button className="px-16 py-7 bg-primary text-white rounded-full text-xs uppercase tracking-[0.4em] font-black shadow-2xl hover:bg-secondary transition-all active:scale-95">
              Start a Return
            </button>
            <button className="px-16 py-7 border-2 border-primary rounded-full text-xs uppercase tracking-[0.4em] font-black hover:bg-primary hover:text-white transition-all active:scale-95">
              Live Chat
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- BOLD SUB-COMPONENTS ---

const TrustFactor = ({ icon, title, text }) => (
  <div className="flex items-center gap-6 text-white group">
    <div className="text-secondary shrink-0">{icon}</div>
    <div>
      <p className="text-xl font-black tracking-tight leading-none mb-1">
        {title}
      </p>
      <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold">
        {text}
      </p>
    </div>
  </div>
);

const BigStep = ({ icon, number, title, desc }) => (
  <div className="group relative p-14 bg-white rounded-[4rem] border border-black/5 hover:border-secondary/20 transition-all duration-700 shadow-sm hover:shadow-2xl">
    <div className="absolute top-10 right-12 text-8xl font-serif italic text-black/3 group-hover:text-secondary/10 transition-colors">
      {number}
    </div>
    <div className="text-secondary mb-12 group-hover:scale-110 transition-transform duration-500 origin-left">
      {icon}
    </div>
    <h3 className="text-3xl font-serif italic mb-6">{title}</h3>
    <p
      className="text-lg leading-relaxed opacity-60 font-light"
      dangerouslySetInnerHTML={{ __html: desc }}
    />
  </div>
);

const PolicyItem = ({ title, text }) => (
  <div className="flex gap-10 items-start group">
    <div className="w-4 h-4 rounded-full border-2 border-secondary mt-2 group-hover:bg-secondary transition-all" />
    <div>
      <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-secondary">
        {title}
      </h4>
      <p className="text-2xl md:text-3xl font-serif italic opacity-80 leading-snug">
        {text}
      </p>
    </div>
  </div>
);

export default ReturnsExchanges;
