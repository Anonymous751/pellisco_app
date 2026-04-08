import { useRef, useMemo, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, User, Quote } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getAllReviewsAction } from "../../features/admin/products/productSlice";

const ADMIN_ID = "69af9b5f0cac50719bc75a3a";

const DEFAULT_TESTIMONIALS = [
  {
    name: "Elena Rossi",
    comment:
      "The Silkora serum transformed my skin texture in just 14 days. It's not just skincare; it's a ritual.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop",
  },
  {
    name: "Jameson K.",
    comment:
      "Minimalist design, maximum results. Finally, a brand that prioritizes bio-identical ingredients.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop",
  },
];

const TestimonialSection = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const { reviews, loading } = useSelector((state) => state.product);

  // Fetch all reviews on mount
  useEffect(() => {
    dispatch(getAllReviewsAction());
  }, [dispatch]);

  // Filter and prepare data for display
const displayData = useMemo(() => {
  if (reviews?.length > 0) {
    // Only include reviews that are approved
    const filtered = reviews.filter(
      (rev) =>
        rev.status === "approved" && // ✅ only approved
        rev.user !== ADMIN_ID &&     // exclude admin
        rev.rating >= 2              // rating threshold
    );
    if (filtered.length > 0) return filtered;
  }
  return DEFAULT_TESTIMONIALS; // fallback if no approved reviews
}, [reviews]);
  // Scroll carousel
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -clientWidth / 2 : clientWidth / 2,
      behavior: "smooth",
    });
  };

  if (loading && displayData === DEFAULT_TESTIMONIALS) return null;

  return (
    <section className="max-w-7xl mx-auto py-24 px-6 bg-white">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 pb-6 border-b border-black/3">
        <div className="relative">
          <h2 className="font-serif text-3xl md:text-4xl italic tracking-tight text-[#1A1A1A]">
            Kind Words
            <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-black/20" />
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mt-6 font-bold">
            Shared Experiences
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="flex gap-3 mb-1">
          <button
            onClick={() => scroll("left")}
            className="p-3 border border-black/5 rounded-full hover:border-black transition-all duration-500 group"
          >
            <ChevronLeft
              size={16}
              strokeWidth={1}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 border border-black/5 rounded-full hover:border-black transition-all duration-500 group"
          >
            <ChevronRight
              size={16}
              strokeWidth={1}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* CAROUSEL */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {displayData.map((item, index) => (
          <div key={item._id || index} className="min-w-[18rem] md:min-w-[20rem] shrink-0 snap-start group">
            <div className="bg-[#FAF9F6] p-8 rounded-2xl h-full flex flex-col relative overflow-hidden">
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 text-black/3" size={60} />

              {/* Rating */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < item.rating ? "#1A1A1A" : "none"}
                    className={i < item.rating ? "text-[#1A1A1A]" : "text-black/10"}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="font-serif italic text-xl text-[#1A1A1A] leading-relaxed mb-10 grow relative z-10">
                "{item.comment}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 border-t border-black/5 pt-6">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-black/5 shrink-0">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover grayscale-[0.3]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      <User size={18} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-sans text-[10px] uppercase tracking-widest font-bold text-black">
                    {item.name || "Anonymous"}
                  </h4>
                  <p className="font-serif text-[10px] italic text-[#8C8C8C]">
                    {item.productName ? `Verified Purchase: ${item.productName}` : "Verified Customer"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
