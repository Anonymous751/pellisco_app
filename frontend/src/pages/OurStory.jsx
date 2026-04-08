import React from "react";
import { Sparkles, MoveRight, Leaf, FlaskConical, Award, Microscope, Droplets, Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import BrandWatermark from "../components/BrandWatermark";


const OurStory = () => {
  return (
    <div className="bg-white min-h-screen font-poppins text-primary selection:bg-secondary/10">

      {/* --- HERO SECTION: THE MANIFESTO --- */}
      <section className="relative pt-34 pb-32 overflow-hidden bg-[#F8F8F8]">
        <BrandWatermark opacity="opacity-[0.04]" secondaryText="Heritage" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-4 mb-8">
               <div className="h-[1px] w-8 bg-secondary/40" />
               <span className="text-[10px] uppercase tracking-[0.6em] text-secondary font-black">
                Est. 2018
               </span>
               <div className="h-[1px] w-8 bg-secondary/40" />
            </div>

            <h1 className="font-serif text-7xl md:text-[120px] italic leading-[0.8] mb-12 tracking-tighter">
              Science as <br />
              <span className="text-secondary/80">an Art Form.</span>
            </h1>

            <p className="text-xl md:text-2xl leading-relaxed opacity-60 max-w-2xl font-light italic">
              "We don't just create formulas; we curate rituals that bridge the gap between clinical results and sensory luxury."
            </p>
          </div>
        </div>
      </section>

      {/* --- THE CHRONICLES (STORY STEPS) --- */}
      <section className="py-40 relative">
        {/* Central Line for the "Story Line" */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/[0.05] hidden lg:block" />

        <div className="max-w-7xl mx-auto px-6 space-y-40">

          {/* STEP 01: THE DISCOVERY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/5] rounded-[2rem] md:rounded-[10rem] overflow-hidden shadow-2xl relative z-10">
                <img
                  src="https://images.pexels.com/photos/3912981/pexels-photo-3912981.jpeg"
                  alt="Laboratory Discovery"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
            </div>
            <div className="lg:pl-20 order-1 lg:order-2">
              <StoryStep
                number="01"
                icon={<Microscope size={24} />}
                title="Molecular Obsession"
                tag="The Origin"
                desc="In 2018, we looked past the shine-sprays and silicones. Our focus went deeper—into the cortex. By collaborating with bio-chemists, we developed the transport of active lipids directly into the hair fiber."
              />
            </div>
          </div>

          {/* STEP 02: THE ETHOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="lg:pr-20">
              <StoryStep
                number="02"
                icon={<Leaf size={24} />}
                title="Conscious Alchemy"
                tag="The Philosophy"
                desc="Clinical purity meets environmental stewardship. We use 100% post-consumer recycled glass and aluminum, ensuring the beauty we create doesn't harm the world we inhabit."
              />
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[10rem] md:rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg"
                  alt="Sustainable Luxury"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
            </div>
          </div>

          {/* STEP 03: THE SANCTUARY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-full overflow-hidden shadow-2xl border-[20px] border-secondary/5">
                <img
                  src="https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg"
                  alt="Pellisco Salon Sanctuary"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:pl-20 order-1 lg:order-2">
              <StoryStep
                number="03"
                icon={<Heart size={24} />}
                title="The Professional Sanctuary"
                tag="The Community"
                desc="The salon is our laboratory of lived experience. We empower stylists with the Anchor Complex—a protective technology that allows for radical transformation without compromise."
              />
              <NavLink to="/contact" className="mt-10 inline-flex items-center gap-4 group">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black border-b-2 border-secondary pb-2">
                  Partner with us
                </span>
                <MoveRight size={18} className="group-hover:translate-x-3 transition-transform text-secondary" />
              </NavLink>
            </div>
          </div>

        </div>
      </section>

      {/* --- SIGNATURE SECTION --- */}
      <section className="py-40 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <BrandWatermark secondaryText="Signature" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <FlaskConical size={48} className="mx-auto mb-10 text-secondary/40" />
          <h2 className="font-serif text-4xl md:text-6xl italic mb-8 leading-tight">
            "We didn't want to fix how hair looks; <br /> we wanted to fix how hair behaves."
          </h2>
          <div className="w-16 h-[1px] bg-secondary mx-auto mb-8" />
          <p className="text-[10px] uppercase tracking-[0.8em] opacity-40">The Pellisco Promise</p>
        </div>
      </section>

      {/* --- CALL TO RITUAL --- */}
      <section className="py-40 text-center">
        <h2 className="font-serif text-6xl md:text-[10rem] italic mb-16 opacity-[0.03] absolute w-full left-0 select-none">Experience</h2>
        <div className="relative z-10">
          <h3 className="font-serif text-6xl italic mb-12">The Collection.</h3>
          <div className="flex flex-wrap justify-center gap-10">
            <button className="group flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Droplets size={24} strokeWidth={1} />
              </div>
              <span className="text-[9px] uppercase tracking-widest font-black">Hydration Rituals</span>
            </button>
            <button className="group flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Sparkles size={24} strokeWidth={1} />
              </div>
              <span className="text-[9px] uppercase tracking-widest font-black">Restorative Art</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- HELPER COMPONENT FOR THE STORY LINE ---

const StoryStep = ({ number, icon, title, tag, desc }) => (
  <div className="relative group">
    <div className="flex items-center gap-6 mb-6">
      <span className="text-6xl font-serif italic text-secondary/20 group-hover:text-secondary/40 transition-colors">
        {number}
      </span>
      <div className="h-[1px] flex-grow bg-black/5" />
    </div>
    <div className="inline-flex items-center gap-3 text-secondary mb-4">
      {icon}
      <span className="text-[10px] uppercase tracking-[0.4em] font-black">{tag}</span>
    </div>
    <h3 className="text-4xl md:text-5xl font-serif italic mb-6 leading-tight">
      {title}
    </h3>
    <p className="text-base leading-relaxed opacity-60 font-light max-w-lg">
      {desc}
    </p>
  </div>
);

export default OurStory;
