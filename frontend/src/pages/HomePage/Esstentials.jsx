import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Essentials = () => {
  const scrollRef = useRef(null);

  const products = [
    {
      id: 1,
      name: "Restorative Elixir",
      category: "Serum",
      size: "30ml",
      price: "$84",
      image: "https://images.pexels.com/photos/3612182/pexels-photo-3612182.jpeg?auto=compress&cs=tinysrgb&w=800",
      secondaryImage: "https://images.pexels.com/photos/4735904/pexels-photo-4735904.jpeg"
    },
    {
      id: 2,
      name: "Hydrating Mist",
      category: "Toner",
      size: "100ml",
      price: "$42",
      image: "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg?auto=compress&cs=tinysrgb&w=800",
      secondaryImage: "https://images.pexels.com/photos/4465121/pexels-photo-4465121.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: 3,
      name: "Luminous Cream",
      category: "Moisturizer",
      size: "50ml",
      price: "$96",
      image: "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800",
      secondaryImage: "https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: 4,
      name: "Cleansing Oil",
      category: "Cleanse",
      size: "150ml",
      price: "$38",
      image: "https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=800",
      secondaryImage: "https://images.pexels.com/photos/3373737/pexels-photo-3373737.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-6xl mx-auto py-20 px-6 bg-white">
      {/* HEADER SECTION: Smaller & Underlined */}
      <div className="flex justify-between items-end mb-10 pb-4 border-b border-black/5">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl italic mb-1 inline-block border-b border-black/40 pb-1">
            The Essentials
          </h2>
          <p className="font-poppins text-[9px] uppercase tracking-[0.2em] opacity-40 mt-2">
            Selected for you
          </p>
        </div>

        {/* COMPACT NAV BUTTONS */}
        <div className="flex gap-2 mb-1">
          <button
            onClick={() => scroll('left')}
            className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all group"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all group"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* CAROUSEL: Compact size with rounded images */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-220px md:min-w-[260px] flex-shrink-0 snap-start group cursor-pointer">
            {/* Image Container with Rounded Corners */}
            <div className="aspect-[4/5] mb-4 overflow-hidden relative bg-[#f9f9f9] rounded-2xl shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
              />
              <img
                src={product.secondaryImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 scale-105 group-hover:opacity-100 group-hover:scale-100"
              />

              {/* QUICK ADD: Compact Bottom Bar */}
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
               <button className="w-full py-3 rounded-xl font-poppins text-[9px] uppercase tracking-widest bg-black/90 backdrop-blur-md text-white overflow-hidden relative group/btn transition-all">
  <span className="block transition-transform duration-300 group-hover/btn:-translate-y-10">
    Quick Add
  </span>
  <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-10 group-hover/btn:translate-y-0">
    Add to Bag — {product.price}
  </span>
</button>
              </div>
            </div>

            {/* Product Details: Tighter spacing */}
            <div className="px-1">
              <h4 className="font-serif text-lg leading-tight">{product.name}</h4>
              <div className="flex justify-between items-center mt-1 opacity-50">
                <p className="font-poppins text-[9px] uppercase tracking-wider">{product.category}</p>
                <p className="font-poppins text-[10px] font-semibold">{product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Essentials;
