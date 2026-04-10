import React, { useMemo, memo, lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Import your fetch actions here
// import { getProducts } from '../redux/slices/productSlice';
// import { getStoreFrontData } from '../redux/slices/storeFrontSlice';

import HeroSlider from './HeroSlider';
import TestimonialSection from './TestimonialSection';
import MarqueeLayer from './MarqueeLayer';
import BrandPhilosophy from './BrandPhilosophy';

const ShopByConcern = lazy(() => import('./ShopByConcern'));
const Essentials = lazy(() => import('./Esstentials'));
const TrustSection = lazy(() => import('./TrustSection'));

 const PHILOSOPHY_TAGS = ["Vegan", "Cruelty-Free", "Paraben-Free"];

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

       <BrandPhilosophy />

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
