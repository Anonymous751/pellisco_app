

const BrandWatermark = ({
  primaryText = "Pellisco",
  secondaryText = "Professionals",
  opacity = "opacity-[0.03]"
}) => {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden ${opacity}`}>
      <div className="flex flex-col items-center transform -translate-y-8">
        {/* Main Brand Name */}
        <span className="text-[15vw] font-serif italic uppercase tracking-tighter leading-[0.7] text-black">
          {primaryText}
        </span>

        {/* Secondary Label */}
        <span className="text-[3.5vw] font-sans font-black uppercase tracking-[1.2em] mt-4 text-black mr-[-1.2em]">
          {secondaryText}
        </span>
      </div>
    </div>
  );
};

export default BrandWatermark;
