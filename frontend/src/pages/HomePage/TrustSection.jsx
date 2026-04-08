import React, { useState } from 'react';
import { ShieldCheck, Leaf, FlaskConical, Plus } from 'lucide-react';

const PelliscoTrust = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const pillars = [
    {
      icon: <FlaskConical size={20} strokeWidth={1} />,
      title: "Molecular Research",
      tag: "Laboratory",
      desc: "Bio-identical actives that mimic your skin's natural repair signals for deep cellular renewal.",
      stat: "94%",
      statLabel: "Cellular Affinity"
    },
    {
      icon: <Leaf size={20} strokeWidth={1} />,
      title: "Botanical Integrity",
      tag: "Provenance",
      desc: "Cold-pressed ingredients sourced from high-altitude flora to preserve vital enzyme potency.",
      stat: "100%",
      statLabel: "Pure Origin"
    },
    {
      icon: <ShieldCheck size={20} strokeWidth={1} />,
      title: "Clinical Precision",
      tag: "Verification",
      desc: "Rigorous 48-hour patch testing on sensitive skin ensures high-tolerance for all users.",
      stat: "0.0",
      statLabel: "Irritation Index"
    }
  ];

  return (
    <section className="bg-[#FAF9F6] py-32 px-8 font-light tracking-tight text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">

        {/* TOP ECHELON HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-end mb-24 gap-12">
          <div>
            <span className="uppercase tracking-[0.3em] text-[10px] text-[#8C8C8C] mb-4 block">The Pellisco Standard</span>
            <h2 className="font-serif text-4xl md:text-5xl italic font-extralight leading-tight">
              Where science meets <br />
              <span className="text-[#6B705C]">the soul of nature.</span>
            </h2>
          </div>
          <div className="lg:pl-20">
            <p className="text-sm leading-relaxed text-[#555] max-w-sm mb-6">
              Rooted in botanical wisdom and refined by clinical precision. We believe true luxury is grown through transparency and verified by results.
            </p>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#8C8C8C] border-t border-black/10 pt-4">
              <span className="flex -space-x-1">
                {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-white bg-[#E5E5E5]" />)}
              </span>
              <span>12,400+ Verified Experiences</span>
            </div>
          </div>
        </div>

        {/* ELEGANT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-black/10">
          {pillars.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative p-10 md:border-r border-b border-black/10 transition-all duration-500 hover:bg-white"
            >
              {/* TOP TAG */}
              <div className="flex justify-between items-start mb-16">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C]">
                  {item.tag}
                </span>
                <div className={`transition-transform duration-500 ${hoveredIndex === index ? 'rotate-90 text-[#6B705C]' : 'text-[#CCC]'}`}>
                  <Plus size={18} strokeWidth={1} />
                </div>
              </div>

              {/* CONTENT */}
              <div className="min-h-[180px]">
                <div className="mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </div>
                <h3 className="font-serif text-2xl mb-4 group-hover:italic transition-all">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[1.8] text-[#666] opacity-80 group-hover:opacity-100">
                  {item.desc}
                </p>
              </div>

              {/* STATS REVEAL */}
              <div className="mt-12 pt-8 border-t border-black/5 flex items-baseline gap-4">
                <span className="font-serif text-4xl font-extralight text-[#1A1A1A]">
                  {item.stat}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#8C8C8C]">
                  {item.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PelliscoTrust;
