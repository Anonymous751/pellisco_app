

const Loader = () => {
  return (
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center bg-lightGray">
      <div className="relative flex items-center justify-center">

        {/* Outer Breathing Ring - Represents organic growth */}
        <div className="absolute h-32 w-32 animate-[ping_3s_linear_infinite] rounded-full border border-secondary/20" />

        {/* Middle Rotating Border - Elegant movement */}
        <div className="h-24 w-24 animate-[spin_4s_linear_infinite] rounded-full border-t border-b border-secondary/40" />

        {/* Inner Core - Pulsing branding */}
        <div className="absolute flex flex-col items-center">
          <div className="h-12 w-12 overflow-hidden">
            <img
              src="/images/pelliscoLogo.png"
              alt="Loading..."
              className="h-full w-full object-contain animate-pulse grayscale opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Minimalist Text Reveal */}
      <div className="mt-8 overflow-hidden">
        <p className="font-poppins text-[10px] uppercase tracking-[0.5em] text-primary/40 animate-[pulse_2s_ease-in-out_infinite]">
          Preparing your ritual
        </p>

        {/* Thin Progress Bar */}
        <div className="mt-4 h-1px w-24 bg-black/5 mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary animate-[translateX_1.5s_infinite] -translate-x-full"
               style={{
                 animation: 'loading-slide 2s infinite ease-in-out'
               }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
