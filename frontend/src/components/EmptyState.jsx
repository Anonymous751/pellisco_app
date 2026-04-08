// Create a component: src/components/ui/EmptyState.jsx
const EmptyState = ({ message }) => (
  <div className="w-full py-20 flex flex-col items-center justify-center text-center">
    <div className="mb-6 opacity-20">
      {/* Use a simple, elegant icon like a leaf or a soft circle */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2L12 22M2 12L22 12" />
      </svg>
    </div>
    <h3 className="font-serif italic text-xl text-primary/60 mb-2">
      Ritual Update
    </h3>
    <p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-primary/40 max-w-xs leading-relaxed">
      {message || "We are currently curating our botanical collection. Please check back soon."}
    </p>
    <button
      onClick={() => window.location.reload()}
      className="mt-8 text-[9px] uppercase tracking-widest border-b border-secondary pb-1 hover:text-secondary transition-colors"
    >
      Refresh Gallery
    </button>
  </div>
);

export default EmptyState;
