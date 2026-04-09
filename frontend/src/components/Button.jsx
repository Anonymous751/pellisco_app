import { ArrowRight } from "lucide-react";

const Button = ({
  onClick,
  quantity,
  price,
  stock,
  label = "Add to Cart", // ✅ default label
}) => {
  const isOutOfStock = stock <= 0;

  return (
    <button
      onClick={onClick}
      disabled={isOutOfStock}
      className="group relative w-full bg-primary text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95 shadow-xl shadow-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-secondary -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-8">
        {/* ✅ USE LABEL HERE */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          {isOutOfStock ? "Sold Out" : label}
        </span>

        {/* ICON */}
        <div className="ml-auto flex items-center gap-3">
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1.5 transition-transform duration-300"
          />
        </div>
      </div>
    </button>
  );
};

export default Button;
