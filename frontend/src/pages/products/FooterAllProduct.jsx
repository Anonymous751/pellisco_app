import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Star, ShoppingBag } from 'lucide-react';
import { getProducts } from "../../features/products/productSlice";

import 'swiper/css';
import 'swiper/css/navigation';

const FooterAllProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state) => state.product);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(getProducts({}));
    }
  }, [dispatch, products]);

  const categories = useMemo(() => [
    { title: "Skin Care Essentials", slug: "skin-care", subtitle: "Clean formulas for glowing skin" },
    { title: "Hair Care Rituals", slug: "hair-care", subtitle: "Nourishment from root to tip" },
    { title: "Professional Treatments", slug: "treatments", subtitle: "Salon-grade results at home" }
  ], []);

  // Skeleton Loader Component
  const Skeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-[2rem]" />
          <div className="h-4 bg-gray-100 w-3/4 rounded" />
          <div className="h-4 bg-gray-100 w-1/4 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-[#FCFCFC] py-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">

        {categories.map((cat, idx) => {
          const filteredItems = products?.filter(p =>
            p.mainCategory === cat.slug || p.category === cat.slug
          ).slice(0, 10);

          if (loading) return <div key={idx} className="mb-20"><Skeleton /></div>;
          if (!filteredItems || filteredItems.length === 0) return null;

          return (
            <div key={idx} className="mb-24 last:mb-0">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-secondary/40"></span>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-secondary font-semibold">
                      {cat.subtitle}
                    </p>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif text-primary lowercase italic tracking-tight">
                    {cat.title}
                  </h2>
                </div>

                <button
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  className="group flex items-center gap-2 text-[12px] uppercase tracking-widest text-darkGray border-b border-transparent hover:border-secondary transition-all pb-1 w-fit"
                >
                  Explore Collection
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Slider Section */}
              <div className="relative group/slider">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1.2}
                  navigation={{
                    nextEl: `.next-${idx}`,
                    prevEl: `.prev-${idx}`,
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2.3 },
                    1024: { slidesPerView: 3.5 },
                    1280: { slidesPerView: 4 },
                  }}
                  className="!overflow-visible"
                >
                  {filteredItems.map((product) => (
                    <SwiperSlide key={product._id}>
                      <div className="group cursor-pointer relative">
                        {/* Image Container */}
                        <div
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#F3F3F3] mb-6 transition-all duration-500 group-hover:rounded-[1.5rem] group-hover:shadow-2xl"
                        >
                          <img
                            src={product.images?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-110"
                          />

                          {/* Quick Add Overlay */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <button className="w-full bg-white/90 backdrop-blur-md py-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-tighter font-bold text-primary translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <ShoppingBag size={14} />
                              Quick Add
                            </button>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="px-2 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif text-xl text-primary group-hover:text-secondary transition-colors duration-300">
                              {product.name}
                            </h4>
                            <span className="font-medium text-lg text-primary/80">
                              ₹{product.price?.sale}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                             <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className={`${i < Math.floor(product.ratings || 0) ? 'fill-secondary text-secondary' : 'fill-gray-200 text-gray-200'}`}
                                  />
                                ))}
                             </div>
                             <span className="text-[10px] text-darkGray/40 uppercase tracking-tighter">
                               ({product.numOfReviews || 0} reviews)
                             </span>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation - Positioned for Minimalist Look */}
                <div className="hidden lg:flex gap-4 absolute -top-24 right-0">
                  <button className={`prev-${idx} w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-20`}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className={`next-${idx} w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-20`}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FooterAllProduct;
