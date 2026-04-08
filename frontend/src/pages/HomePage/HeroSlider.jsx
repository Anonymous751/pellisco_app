import { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStorefrontData } from "../../features/admin/storeFront/storeFrontSlice";

const SLIDE_DURATION = 6000;

// 🔹 Slide Component
const SlideItem = memo(({ slide, isActive, isNext }) => {
  const imageUrl = typeof slide?.image === "string" ? slide.image : "";

  // 🚀 Safe media detection (no crash)
  const isVideo =
    /\.(mp4|webm|ogg|mov)$/i.test(imageUrl) ||
    imageUrl.includes("/video/upload/");

  // 🚀 Safe Cloudinary optimization
  const optimizedMedia = imageUrl
    ? isVideo
      ? imageUrl.replace("/upload/", "/upload/f_auto,q_auto,vc_h265,w_1280/")
      : imageUrl.replace("/upload/", "/upload/f_auto,q_auto,w_1920,c_limit/")
    : "";

  // ❌ Skip broken slides completely
  if (!imageUrl || (!isActive && !isNext)) return null;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-2000ms ease-in-out ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={{ willChange: "opacity" }}
    >
      <div className="absolute inset-0 overflow-hidden bg-[#050505]">
        {isVideo ? (
          <video
            src={optimizedMedia}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-7000ms ease-out ${
              isActive ? "scale-110" : "scale-100"
            }`}
            style={{
              filter: "brightness(0.5) contrast(1.1) grayscale(1)",
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          />
        ) : (
          <img
            src={optimizedMedia}
            alt={slide.title || "slide"}
            loading="eager"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-7000ms ease-out ${
              isActive ? "scale-110" : "scale-100"
            }`}
            style={{
              filter: "brightness(0.5) contrast(1.1) grayscale(1)",
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-4 transition-all duration-1500ms delay-300 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {slide.subtitle && (
          <span className="block text-white/60 uppercase tracking-[15px] text-[10px] mb-8 font-light">
            {slide.subtitle}
          </span>
        )}

        {slide.title && (
          <h1 className="font-serif text-white text-5xl md:text-8xl italic font-extralight tracking-tight leading-[1.1] mb-14">
            {slide.title}
          </h1>
        )}

        {slide.cta && (
          <div className="overflow-hidden">
            <a
              href={slide.link || "#"}
              className="relative inline-block px-14 py-5 border border-white/10 text-white uppercase tracking-[0.6em] text-[9px] group transition-all duration-700"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                {slide.cta}
              </span>
              <div className="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

// 🔹 Main Slider
const HeroSlider = () => {
  const dispatch = useDispatch();

  const slides = useSelector(
    (state) => state.storefront.contentData?.Hero || []
  );
  const loading = useSelector((state) => state.storefront.loading);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch data
  useEffect(() => {
    if (slides.length === 0) {
      dispatch(fetchStorefrontData("Hero"));
    }
  }, [dispatch, slides.length]);

  // Auto slide
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Loading UI
  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white uppercase tracking-[1.5em] text-[10px] animate-pulse font-extralight">
          Pellisco
        </div>
      </div>
    );
  }

  if (!slides.length) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#050505]">
      {slides.map((slide, index) => (
        <SlideItem
          key={slide._id || index}
          slide={slide}
          isActive={index === currentSlide}
          isNext={index === (currentSlide + 1) % slides.length}
        />
      ))}

      {/* Indicators */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-10 flex gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className="flex-1 h-1px bg-white/10 relative group py-2"
          >
            <div
              className="absolute top-2 left-0 right-0 h-1px bg-white/60 origin-left transition-transform"
              style={{
                transform: i === currentSlide ? "scaleX(1)" : "scaleX(0)",
                transitionDuration:
                  i === currentSlide ? `${SLIDE_DURATION}ms` : "0ms",
                transitionTimingFunction: "linear",
              }}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
