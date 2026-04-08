import React, { useState } from "react";
import { Plus, Minus, Search, MessageSquare, Phone, Mail } from "lucide-react";
import BrandWatermark from "../components/BrandWatermark"; // Assuming it's in your components folder

const FAQ = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { id: "general", label: "Product & Science" },
    { id: "orders", label: "Orders & Shipping" },
    { id: "pro", label: "Professional Partners" },
  ];

  const questions = {
    general: [
      {
        q: "What makes Pellisco formulas 'Bio-Available'?",
        a: "Bio-availability refers to how easily your hair absorbs nutrients. Unlike standard products that sit on the surface, our formulas use smaller molecular weights and lipid-matching technology to penetrate the cortex for actual structural repair."
      },
      {
        q: "Are your products safe for color-treated or bleached hair?",
        a: "Absolutely. In fact, Pellisco was specifically engineered to restore the disulfide bonds often broken during chemical services. It helps lock in color molecules and prevents post-bleach brittleness."
      },
      {
        q: "Is Pellisco 100% Vegan and Cruelty-Free?",
        a: "Yes. We do not test on animals, nor do we use animal-derived ingredients like keratin from wool. We use bio-identical plant peptides to achieve the same (and often better) results."
      }
    ],
    orders: [
      {
        q: "How long does shipping typically take?",
        a: "Standard shipping takes 3-5 business days. Professional backbar orders for salons are prioritized and typically arrive within 48-72 hours."
      },
      {
        q: "What is your return policy for opened products?",
        a: "Due to the clinical nature of our products, we cannot accept returns on opened items. However, if you are unsatisfied with your results, please contact our concierge for a personalized usage consultation."
      }
    ],
    pro: [
      {
        q: "How do I become a Pellisco Partner Salon?",
        a: "You can apply via our 'Pro' portal. We look for salons that prioritize hair health and are willing to undergo our technical certification training."
      },
      {
        q: "Do you offer education for styling teams?",
        a: "Yes. We provide both digital masterclasses and in-person technical workshops for all our partner salons to ensure the best possible results for your clients."
      }
    ]
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen font-poppins text-primary">

      {/* --- HEADER --- */}
      {/* Added 'relative' and 'overflow-hidden' for the watermark container */}
      <section className="relative pt-48 pb-24 bg-[#FBFBFB] text-center overflow-hidden border-b border-black/5">

        {/* Visual Layer 1: Watermark - Center Aligned */}
        <BrandWatermark primaryText="Pellisco" secondaryText="Professionals" opacity="opacity-[0.04]" />

        {/* Visual Layer 2: Main Content */}
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl italic mb-6">
            How can we <span className="text-secondary">assist?</span>
          </h1>
          <div className="relative max-w-xl mx-auto mt-10 group">
            <input
              type="text"
              placeholder="Search for a topic (e.g. 'Shipping', 'Bonding')..."
              className="w-full bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl py-6 px-8 pr-14 text-sm focus:outline-none focus:border-secondary transition-all shadow-xl shadow-black/5"
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary" size={22} />
          </div>
        </div>
      </section>

      {/* --- CATEGORY TABS --- */}
      <section className="py-12 border-b border-black/5 sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div className="max-w-4xl mx-auto px-6 flex justify-center gap-4 md:gap-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab(cat.id); setOpenIndex(null); }}
              className={`text-[10px] uppercase tracking-[0.3em] font-bold pb-2 transition-all border-b-2 ${
                activeTab === cat.id ? "border-secondary text-primary" : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* --- FAQ ACCORDION --- */}
      <section className="py-24 max-w-3xl mx-auto px-6 relative z-10">
        <div className="space-y-4">
          {questions[activeTab].map((item, index) => (
            <div
              key={index}
              className={`border rounded-3xl transition-all duration-500 ${
                openIndex === index ? "border-secondary/30 bg-[#FBFBFB]" : "border-black/5 bg-white"
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-8 text-left"
              >
                <span className="font-serif text-lg md:text-xl italic pr-8">{item.q}</span>
                <div className="flex-shrink-0 bg-white rounded-full p-2 shadow-sm border border-black/5">
                  {openIndex === index ? <Minus size={18} className="text-secondary" /> : <Plus size={18} />}
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="px-8 pb-8 text-sm leading-relaxed opacity-70 font-light">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- STILL HAVE QUESTIONS? --- */}
      <section className="py-24 bg-primary text-white mx-6 mb-12 rounded-[3rem] shadow-2xl shadow-primary/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl italic mb-6">Still have questions?</h2>
          <p className="text-sm opacity-60 mb-12">Our concierge team is available Monday through Friday for specialized support.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ContactCard icon={<Mail size={20} />} title="Email Us" detail="support@pellisco.pro" />
            <ContactCard icon={<Phone size={20} />} title="Call Us" detail="+1 (800) 123-4567" />
            <ContactCard icon={<MessageSquare size={20} />} title="Live Chat" detail="Available 9am - 5pm" />
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactCard = ({ icon, title, detail }) => (
  <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group">
    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-white">
      {icon}
    </div>
    <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">{title}</h4>
    <p className="text-sm font-medium">{detail}</p>
  </div>
);

export default FAQ;
