import React, { useMemo, memo, lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Import your fetch actions here
// import { getProducts } from '../redux/slices/productSlice';
// import { getStoreFrontData } from '../redux/slices/storeFrontSlice';

import HeroSlider from './HeroSlider';
import TestimonialSection from './TestimonialSection';
import MarqueeLayer from './MarqueeLayer';

const ShopByConcern = lazy(() => import('./ShopByConcern'));
const Essentials = lazy(() => import('./Esstentials'));
const TrustSection = lazy(() => import('./TrustSection'));

const PHILOSOPHY_TAGS = ['Vegan', 'Cruelty-Free', 'Paraben-Free'];
const SectionLoader = () => <div className="h-40 w-full animate-pulse bg-gray-100" />;

const HomePage = () => {
  const dispatch = useDispatch();

  // 1. SELECTORS: Get current data from Redux
  const { products } = useSelector((state) => state.products || { products: [] });
  const { heroData } = useSelector((state) => state.storeFront || { heroData: null });

  // 2. CONDITIONAL FETCHING: The "Handshake" Gate
  useEffect(() => {
    // Only fetch if Redux is empty. This kills the redundant 304 XHR calls.
    if (!products || products.length === 0) {
      // dispatch(getProducts({ page: 1 }));
    }

    if (!heroData) {
      // dispatch(getStoreFrontData());
    }
  }, [dispatch, products?.length, heroData]);

  const memoizedTags = useMemo(() => PHILOSOPHY_TAGS, []);

  return (
    <main className="min-h-screen antialiased bg-[#F7F7F7]">
      {/* --- 1. HERO SECTION --- */}
      <section className="relative w-full min-h-[70vh] md:min-h-[85vh] overflow-hidden">
        <HeroSlider />
      </section>

      <div className="relative z-20">
  <MarqueeLayer />
</div>

      {/* --- 2. LAZY LOADED COMPONENTS --- */}
      <Suspense fallback={<SectionLoader />}>
        <section className="relative z-10 -mt-10 md:-mt-20">
          <ShopByConcern />
        </section>

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
              <source src="https://www.pexels.com/download/video/5422180/" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40 z-10" />
          </div>

          <div className="relative z-20 max-w-4xl mx-auto text-center px-6">
            <span className="font-poppins text-[10px] uppercase tracking-[0.6em] text-white/50 mb-8 block">
              Our Ritual
            </span>
            <h2 className="font-serif text-3xl md:text-6xl text-white mb-12 leading-tight">
              "Biocompatible roots. <br/>Clinical precision."
            </h2>
            <div className="flex justify-center gap-8 md:gap-16">
              {memoizedTags.map((tag) => (
                <span key={tag} className="text-[10px] md:text-[12px] uppercase tracking-widest text-white/70 border-b border-white/10 pb-2">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <Essentials />
        </section>

        <TrustSection />
        <TestimonialSection />
      </Suspense>
    </main>
  );
};

export default memo(HomePage);
