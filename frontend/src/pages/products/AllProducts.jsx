import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Filter,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
  Search,
  X,
  ArrowUpDown,
  ShoppingBag,
  Star as StarIcon,
  RotateCcw,
} from "lucide-react";
import {
  getProducts,
  removeError,
} from "../../features/admin/products/productSlice";

const MAIN_CATEGORIES = ["All", "skin-care", "hair-care", "treatments"];
const SUB_CATEGORIES = [
  "cleanser",
  "toner",
  "moisturizer",
  "sun-protection",
  "shampoo",
  "conditioner",
  "facial-kits",
  "professional-serum",
];

const AllProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, loading, error, filteredProductsCount, totalPages } =
    useSelector((state) => state.product);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState([0, 10000]);
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [mainCategory, setMainCategory] = useState(
    searchParams.get("mainCategory") || "All"
  );
  const [sort, setSort] = useState("-createdAt");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Sync state when URL params change (e.g., from Navbar)
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    const mainCat = searchParams.get("mainCategory") || "All";
    const key = searchParams.get("keyword") || "";

    setCategory(cat);
    setMainCategory(mainCat);
    setKeyword(key);
  }, [searchParams]);

  // Fetch Products
  useEffect(() => {
    if (error) {
      dispatch(removeError());
    }

    dispatch(
      getProducts({
        keyword: debouncedKeyword,
        currentPage,
        price,
        category: category !== "All" ? category : "",
        mainCategory: mainCategory !== "All" ? mainCategory : "",
        sort,
      })
    );
  }, [
    dispatch,
    debouncedKeyword,
    currentPage,
    price,
    category,
    mainCategory,
    sort,
    error,
  ]);

  const resetFilters = () => {
    setKeyword("");
    setPrice([0, 10000]);
    setCategory("All");
    setMainCategory("All");
    setSort("-createdAt");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleCategoryClick = (cat, type) => {
    const newParams = new URLSearchParams(searchParams);
    if (type === "main") {
      setMainCategory(cat);
      setCategory("All");
      newParams.set("mainCategory", cat);
      newParams.delete("category");
    } else {
      setCategory(cat);
      setMainCategory("All");
      newParams.set("category", cat);
      newParams.delete("mainCategory");
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  return (
    <main className="bg-[#F9F9F9] min-h-screen pt-24 pb-20 font-poppins selection:bg-secondary/20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* HEADER */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-serif text-5xl italic text-primary tracking-tight">
                The Collection
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-darkGray/40">
                {mainCategory !== "All"
                  ? mainCategory.replace("-", " ")
                  : "Discover your ritual"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products..."
                  className="bg-white border border-mutedGreen/20 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none w-64 shadow-sm"
                />
                <Search
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-darkGray/30"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-mutedGreen/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest"
              >
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-12 items-start">
          {/* SIDEBAR */}
          <aside
            className={`fixed inset-0 z-50 bg-white p-8 transition-transform lg:relative lg:translate-x-0 lg:w-64 shrink-0 ${
              isFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="lg:hidden flex justify-between items-center mb-10">
              <span className="font-serif text-2xl italic">Filters</span>
              <button onClick={() => setIsFilterOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <section className="mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-6 flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-secondary" />{" "}
                Budget
              </h3>
              <div className="space-y-4">
                <p className="text-lg font-serif text-primary italic">
                  Under ₹{price[1]}
                </p>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={price[1]}
                  onChange={(e) => {
                    setPrice([0, Number(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="w-full accent-secondary cursor-pointer"
                />
              </div>
            </section>

            <div className="space-y-10 sticky top-32 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-2">
                    <LayoutGrid size={12} className="text-secondary" />{" "}
                    Collections
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-[9px] text-secondary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-[9px] text-darkGray/40 uppercase mb-3 tracking-widest">
                    Range
                  </p>
                  <ul className="space-y-3">
                    {MAIN_CATEGORIES.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryClick(cat, "main")}
                          className={`text-sm flex items-center justify-between w-full group ${
                            mainCategory === cat
                              ? "text-secondary font-medium"
                              : "text-darkGray/60 hover:text-primary"
                          }`}
                        >
                          <span className="transition-transform group-hover:translate-x-1 capitalize">
                            {cat.replace("-", " ")}
                          </span>
                          <ChevronRight
                            size={12}
                            className={
                              mainCategory === cat
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[9px] text-darkGray/40 uppercase mb-3 tracking-widest">
                    Type
                  </p>
                  <ul className="space-y-3">
                    {SUB_CATEGORIES.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryClick(cat, "sub")}
                          className={`text-sm flex items-center justify-between w-full group ${
                            category === cat
                              ? "text-secondary font-medium"
                              : "text-darkGray/60 hover:text-primary"
                          }`}
                        >
                          <span className="transition-transform group-hover:translate-x-1 capitalize">
                            {cat.replace("-", " ")}
                          </span>
                          <ChevronRight
                            size={12}
                            className={
                              category === cat
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </aside>

          {/* LISTING */}
          <section className="flex-1">
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-mutedGreen/10 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-darkGray/40">
                {loading
                  ? "Refreshing..."
                  : `Showing ${filteredProductsCount} Rituals`}
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-secondary" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="-createdAt">Newest Arrivals</option>
                  <option value="price.sale">Price: Low to High</option>
                  <option value="-price.sale">Price: High to Low</option>
                  <option value="-ratings">Customer Favorites</option>
                </select>
              </div>
            </div>

            {!loading && products?.length === 0 && (
              <div className="text-center py-20">
                <p className="font-serif text-2xl italic text-darkGray/40">
                  No rituals found.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-secondary text-xs uppercase tracking-widest underline"
                >
                  View All
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {products?.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group flex flex-col animate-fadeIn cursor-pointer"
                >
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    {product.price?.mrp > product.price?.sale && (
                      <div className="absolute top-6 left-6 bg-secondary text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                        {Math.round(
                          ((product.price.mrp - product.price.sale) /
                            product.price.mrp) *
                            100
                        )}
                        % Off
                      </div>
                    )}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); /* Add To Cart Logic */
                        }}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl text-primary hover:bg-secondary hover:text-white transition-colors"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="px-2 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <p className="text-[9px] uppercase tracking-widest text-secondary font-bold mb-1">
                          {product.category.replace("-", " ")}
                        </p>
                        <h3 className="font-serif text-2xl italic text-primary group-hover:text-secondary transition-colors leading-tight truncate">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-serif text-xl text-primary">
                          ₹{product.price?.sale}
                        </span>
                        {product.price?.mrp > product.price?.sale && (
                          <span className="text-[10px] text-darkGray/30 line-through">
                            ₹{product.price?.mrp}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-secondary">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            size={8}
                            fill={
                              i < Math.floor(product.ratings || 0)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="none"
                          />
                        ))}
                      </div>
                      <span className="text-[8px] text-darkGray/30 uppercase tracking-widest">
                        ({product.numOfReviews || 0} Reviews)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-24 flex justify-center items-center gap-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo(0, 0);
                    }}
                    className={`w-12 h-12 rounded-full border transition-all ${
                      currentPage === i + 1
                        ? "bg-primary text-white border-primary shadow-lg"
                        : "border-mutedGreen/20 text-darkGray/40 hover:border-secondary hover:text-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AllProducts;
