import { useMemo } from "react";

const BrandPhilosophy = () => {
  const PHILOSOPHY_TAGS = ["Vegan", "Cruelty-Free", "Paraben-Free"];
  const memoizedTags = useMemo(() => PHILOSOPHY_TAGS, []);

  return (
    <>
      {/* --- 3. BRAND PHILOSOPHY --- */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=20&w=50"
            className="w-full h-full object-cover opacity-40 grayscale(1)"
          >
            <source
              src="https://www.pexels.com/download/video/5422180/"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto text-center px-6">
          <span className="font-poppins text-[10px] uppercase tracking-[0.6em] text-white/50 mb-8 block">
            Our Ritual
          </span>
          <h2 className="font-serif text-3xl md:text-6xl text-white mb-12 leading-tight">
            "Biocompatible roots. <br />
            Clinical precision."
          </h2>
          <div className="flex justify-center gap-8 md:gap-16">
            {memoizedTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] md:text-[12px] uppercase tracking-widest text-white/70 border-b border-white/10 pb-2"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BrandPhilosophy;
