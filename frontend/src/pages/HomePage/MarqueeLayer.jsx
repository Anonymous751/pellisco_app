

const MarqueeLayer = () => {
  return (
    <div className="w-full overflow-hidden bg-secondary py-8 mb-12 mask-fade">
      <div className="flex whitespace-nowrap animate-marquee">

        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 pr-12">

            {/* ITEM */}
            <div className="flex items-center gap-3 text-white font-semibold tracking-[0.28em] uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
              <img src="./images/pelliscoLogo.png" alt="logo" className="w-6 h-6 object-contain" />
              <span className="text-4xl font-extrabold">Pellisco Professional</span>
            </div>

            <div className="flex items-center gap-3 text-white font-semibold tracking-[0.28em] uppercase opacity-90">
              <img src="./images/pelliscoLogo.png" alt="logo" className="w-6 h-6 object-contain" />
              <span className="text-4xl font-extrabold">Luxury Skincare Science</span>
            </div>

            <div className="flex items-center gap-3 text-white font-semibold tracking-[0.28em] uppercase opacity-90">
              <img src="./images/pelliscoLogo.png" alt="logo" className="w-6 h-6 object-contain" />
              <spa className="text-4xl font-extrabold">Dermatologist Approved</spa>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};

export default MarqueeLayer;
