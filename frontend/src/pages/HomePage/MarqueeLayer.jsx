import { ShipWheel } from "lucide-react";

const MarqueeLayer = () => {
  return (
    <div className="w-full overflow-hidden bg-secondary py-8 mb-12 mask-fade">
      <div className="flex whitespace-nowrap animate-marquee">

        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 pr-12">

            {/* ITEM 1 */}
            <div className="flex items-center gap-6 text-white font-semibold tracking-[0.28em] uppercase">
              <span className="text-4xl font-extrabold">Pellisco Professional</span>

              {/* ROTATING SEPARATOR */}
              <ShipWheel className="w-8 h-8 animate-spin-slow opacity-80" />
            </div>

            {/* ITEM 2 */}
            <div className="flex items-center gap-6 text-white font-semibold tracking-[0.28em] uppercase opacity-90">
              <span className="text-4xl font-extrabold">Luxury Skincare Science</span>

              <ShipWheel className="w-8 h-8 animate-spin-slow opacity-80" />
            </div>

            {/* ITEM 3 */}
            <div className="flex items-center gap-6 text-white font-semibold tracking-[0.28em] uppercase opacity-90">
              <span className="text-4xl font-extrabold">Dermatologist Approved</span>

              <ShipWheel className="w-8 h-8 animate-spin-slow opacity-80" />
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};

export default MarqueeLayer;
