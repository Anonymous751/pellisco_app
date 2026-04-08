import { useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import EmptyState from "../../components/EmptyState";
import { NavLink } from "react-router-dom";
import { getProducts, removeError } from "../../features/admin/products/productSlice";

const ShopByConcern = () => {
  const dispatch = useDispatch();
  const { error, products, loading } = useSelector((state) => state.product);
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeError());
    }
  }, [error, dispatch]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading && !products?.length) return <Loader />;

  return (
    <section className="w-full py-20 bg-lightGray">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10 pb-4 border-b border-black/5">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl italic mb-1 inline-block border-b border-black/40 pb-1 text-primary">
              Shop by Concern
            </h2>
            <p className="font-poppins text-[9px] uppercase tracking-[0.2em] opacity-40 mt-2 text-primary">
              Targeted for your ritual
            </p>
          </div>

          {/* NAVIGATION */}
          {products?.length > 0 && (
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => handleScroll("left")}
                className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all group active:scale-90 cursor-pointer"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all group active:scale-90 cursor-pointer"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* CAROUSEL CONTAINER */}
        <div
          ref={scrollRef}
          className="flex flex-row gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory relative"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {error ? (
            <EmptyState message={error} />
          ) : products && products.length > 0 ? (
            products.map((product) => {
              // Calculate discount percentage if offer field is empty
              const hasDiscount = product.price?.mrp > product.price?.sale;
              const discountPercentage = hasDiscount
                ? Math.round(((product.price.mrp - product.price.sale) / product.price.mrp) * 100)
                : 0;

              return (
                <NavLink
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="w-[280px] md:w-[320px] flex-shrink-0 snap-start group relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer block"
                >
                  {/* OFFER BADGE - Top Left */}
                  {(product.price?.offer || hasDiscount) && (
                    <div className="absolute top-4 left-4 z-30 bg-secondary text-white px-3 py-1.5 rounded-full shadow-xl transition-transform duration-500 group-hover:scale-110">
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                        {product.price?.offer || `${discountPercentage}% OFF`}
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/800"}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                    <div className="text-white w-full">
                      <h3 className="font-serif text-2xl mb-2 italic tracking-tight">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between w-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                        <div className="flex flex-col">
                          <p className="text-[9px] uppercase tracking-[0.3em] font-poppins">
                            View Details
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-[11px] font-bold text-secondary">
                              ${product.price?.sale}
                            </p>
                            {hasDiscount && (
                              <span className="line-through opacity-50 text-[9px]">
                                ${product.price.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={14} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 h-[2px] w-0 transition-all duration-700 group-hover:w-full z-20 bg-secondary" />
                </NavLink>
              );
            })
          ) : (
            <EmptyState message="The collection is currently being refreshed." />
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopByConcern;
