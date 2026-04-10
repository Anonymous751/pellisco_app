import React, { useState, useEffect } from "react";
import {
  Star,
  Minus,
  Plus,
  ChevronDown,
  Sparkles,
  Quote,
  CheckCircle2,
  Send,
  Trash2,
  XCircle,
  CheckCircle,
  User,
  AlertCircle,
  RefreshCw,
  Heart,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import Loader from "../../components/Loader";
import Button from "../../components/Button";
import {
  getSingleProduct,
  createProductReview,
  updateReviewStatusAction,
  resetReviewState,
  resetAdminReviewState,
  removeError,
} from "../../features/admin/products/productSlice";
import { addToCart } from "../../features/cart/cartSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = () => {
  setIsWishlisted(prev => !prev);
};

  // Redux State
  const { loading, error, product, success, isUpdated } = useSelector(
    (state) => state.product
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Local UI States
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    if (id) {
      dispatch(getSingleProduct(id));
    }
    window.scrollTo(0, 0);
  }, [dispatch, id]);

  // 2. Sync Logic (Re-fetch on changes)
  useEffect(() => {
    if (success) {
      toast.success("Ritual Journal Submitted!");
      setIsSubmitted(true);
      setRating(0);
      setComment("");
      dispatch(resetReviewState());
      dispatch(getSingleProduct(id)); // Sync with DB
    }
    if (isUpdated) {
      toast.success("Review status updated");
      dispatch(resetAdminReviewState());
      dispatch(getSingleProduct(id)); // Sync with DB
    }
    if (error) {
      toast.error(error);
      dispatch(removeError());
    }
  }, [success, isUpdated, error, dispatch, id]);

  // Handlers
  const addToCartHandler = () => {
  if (product?.stock > 0) {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price.sale,
        image: product.images[0]?.url,
        stock: product.stock,
        quantity,
      })
    );

    toast.success(`${quantity} Item(s) added to your ritual bag`);
  }
};
  const handleReviewSubmit = () => {
    if (!isAuthenticated)
      return toast.error("Please login to share your ritual");
    if (rating === 0) return toast.error("Please select a star rating");
    if (comment.length < 10)
      return toast.error("Please share a bit more about your journey");

    dispatch(createProductReview({ rating, comment, productId: id }));
  };

  const handleAdminAction = (reviewId, status) => {
    dispatch(updateReviewStatusAction({ productId: id, reviewId, status }));
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Delete this journal entry permanently?")) {
      try {
        await axios.delete(
          `/api/v1/admin/review?productId=${id}&id=${reviewId}`
        );
        toast.error("Review Deleted");
        dispatch(getSingleProduct(id));
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      }
    }
  };

  if (loading) return <Loader />;

  // Error State Layout
  if (error || (!loading && !product)) {
    return (
      <main className="bg-[#FAF9F6] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center border border-black/5">
            <AlertCircle size={32} className="text-black/20" />
          </div>
          <h2 className="font-serif text-3xl italic text-primary">
            Connection Lost
          </h2>
          <p className="font-poppins text-xs text-black/40 italic">
            "We couldn't find the ritual you're looking for."
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mx-auto flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full text-[9px] uppercase tracking-widest"
          >
            <RefreshCw size={12} /> Return to Shop
          </button>
        </div>
      </main>
    );
  }

  const productDetails = [
    {
      id: "ingredients",
      title: "Key Ingredients",
      content: product?.ingredients || "Botanical blend of Pellisco actives.",
    },
    {
      id: "usage",
      title: "How to Use",
      content:
        product?.usage || "Incorporate into your morning and evening ritual.",
    },
    {
      id: "shipping",
      title: "Delivery",
      content: "Sustainably packaged and carbon-neutral shipping.",
    },
  ];

  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-28 pb-10 font-sans text-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* LEFT: IMAGE GALLERY */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-8">
            <div className="flex md:flex-col gap-4 w-full md:w-20">
              {product?.images?.map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setSelectedImg(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border transition-all ${
                    selectedImg === idx
                      ? "border-secondary scale-105 shadow-md"
                      : "border-black/5 opacity-50"
                  }`}
                >
                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-4/5 rounded-[2.5rem] overflow-hidden bg-white shadow-sm relative group border border-black/5">

  <img
    src={product?.images?.[selectedImg]?.url}
    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
    alt={product?.name}
  />

  {/* 🟢 Stock Badge */}
  <div className="absolute top-8 left-8">
    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest text-primary">
      {product?.stock > 0 ? "In Stock" : "Restocking"}
    </span>
  </div>

  {/* ❤️ Wishlist Icon */}
  <div className="absolute top-6 right-6">
    <button
  onClick={handleWishlist}
  className="p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-sm"
>
  <Heart
    size={20}
    className={`transition-all duration-300 ${
      isWishlisted
        ? "text-danger fill-danger scale-110"
        : "text-primary/60 hover:text-danger"
    }`}
  />
</button>
  </div>

</div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="lg:col-span-5">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={
                        i < Math.floor(product?.ratings || 0)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-black/30">
                  ({product?.numOfReviews || 0} VERIFIED REVIEWS)
                </span>
              </div>
              <h1 className="font-serif text-5xl italic text-primary leading-tight mb-4">
                {product?.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-serif text-primary">
                  ${product?.price?.sale}
                </span>
                {product?.price?.mrp > product?.price?.sale && (
                  <span className="text-lg font-serif text-black/20 line-through">
                    ${product.price.mrp}
                  </span>
                )}
              </div>
            </header>

            <p className="font-poppins text-sm leading-relaxed text-black/60 mb-10 italic border-l-2 border-secondary/20 pl-6">
              "{product?.description}"
            </p>

            <div className="mb-10 flex gap-4 max-w-md">
              <div className="flex items-center justify-between bg-white border border-black/10 rounded-full px-6 h-16 w-40 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-black/30 hover:text-primary"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-sm">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => (product?.stock > q ? q + 1 : q))
                  }
                  className="text-black/30 hover:text-primary"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="grow">
                <Button
                  disabled={product?.stock < 1}
                  onClick={addToCartHandler}
                  text={product?.stock < 1 ? "Out of Stock" : "Add to Ritual"}
                />
              </div>
            </div>

<div className="w-full max-w-md mt-6 p-4 border border-black/5 rounded-2xl bg-white shadow-sm">
  <Button
    disabled={product?.stock < 1}
    label="Checkout 🔒"
    className="h-14 w-full"
  />

  <p className="text-[9px] text-black/30 mt-3 text-center uppercase tracking-widest">
    100% Safe & Secure Payments
  </p>
</div>


            {/* ACCORDION */}
            <div className="border-t border-black/5">
              {productDetails.map((item) => (
                <div key={item.id} className="border-b border-black/5">
                  <button
                    onClick={() =>
                      setOpenAccordion(
                        openAccordion === item.id ? null : item.id
                      )
                    }
                    className="w-full flex items-center justify-between py-5 group"
                  >
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 group-hover:text-primary">
                      {item.title}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        openAccordion === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      openAccordion === item.id ? "max-h-40 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-xs text-black/50 italic leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <fieldset className="mt-20 p-10 rounded-[3rem] bg-[#FAF9F6] border border-black/5 text-center">
  <legend className="px-4 text-[9px] uppercase tracking-[0.4em] text-black/30 font-bold">
    Trusted Payments
  </legend>

  <div className="flex items-center justify-center gap-8 mt-6 flex-wrap">
    {["visa", "mastercard", "razorpay", "paypal", "stripe"].map((method) => (
      <img
        key={method}
        src={`/images/${method}.png`}
        alt={method}
        className="h-12 hover:grayscale-0 transition"
      />
    ))}
  </div>
</fieldset>

        {/* REVIEWS SECTION */}
        <section className="mt-20 border-t border-black/5 pt-20">
          <div className="text-center mb-24">
            <h2 className="font-serif text-6xl italic text-primary mb-4">
              Ritual Journals
            </h2>
            <div className="flex items-center justify-center gap-4 text-black/20 font-bold text-[10px] uppercase tracking-[0.4em]">
              <span>{product?.numOfReviews || 0} Stories</span>
              <span className="h-1 w-1 bg-secondary rounded-full"></span>
              <span>{product?.ratings || 0} Avg. Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* FORM */}
            <div className="lg:col-span-4">
              <div className="sticky top-32">
                {isSubmitted ? (
                  <div className="p-12 bg-white border border-secondary/20 rounded-[3rem] text-center shadow-xl animate-in fade-in zoom-in">
                    <Sparkles
                      className="text-secondary mx-auto mb-6"
                      size={28}
                    />
                    <h3 className="font-serif text-2xl italic text-primary mb-3">
                      Journal Saved
                    </h3>
                    <p className="text-xs text-black/40 italic mb-8">
                      Your story is being processed by our botanical experts.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-[9px] uppercase tracking-widest font-bold text-secondary border-b border-secondary/30 pb-1"
                    >
                      Write another
                    </button>
                  </div>
                ) : (
                  <div className="p-10 bg-white rounded-[3rem] border border-black/5 shadow-2xl">
                    <h3 className="font-serif text-2xl italic text-primary mb-8">
                      Share your Ritual
                    </h3>
                    <div className="flex gap-3 mb-10">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)}>
                          <Star
                            size={24}
                            className={
                              star <= rating
                                ? "text-secondary fill-secondary"
                                : "text-black/10"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        isAuthenticated
                          ? "How has your skin transformed?"
                          : "Please login to share your journey"
                      }
                      disabled={!isAuthenticated}
                      className="w-full bg-[#FAF9F6] border-none rounded-2xl p-6 text-sm min-h-37.5 mb-8 italic outline-none"
                    />
                    <button
                      onClick={handleReviewSubmit}
                      className="w-full bg-primary text-white py-5 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold flex items-center justify-center gap-3"
                    >
                      Publish Journal <Send size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* LIST */}
            <div className="lg:col-span-8 space-y-12">
              {product?.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => {
                  const isAdmin = user?.role === "admin";
                  const isAuthor =
                    user?._id?.toString() === rev.user?.toString();
                  const isVisible =
                    rev.status === "approved" || isAdmin || isAuthor;

                  if (!isVisible) return null;

                  return (
                    <div
                      key={rev._id}
                      className="group p-8 rounded-[2.5rem] bg-white border border-black/5 hover:shadow-xl transition-all duration-500"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#FAF9F6] border border-black/5 flex items-center justify-center">
                            {rev.avatar ? (
                              <img
                                src={rev.avatar}
                                alt={rev.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={24} className="text-black/10" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-serif text-2xl text-primary">
                                {rev.name || "Anonymous"}
                              </h4>
                              {rev.status !== "approved" && (
                                <span className="bg-amber-50 text-amber-600 text-[8px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                                  {rev.status}
                                </span>
                              )}
                            </div>
                            <div className="flex text-secondary gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  size={10}
                                  fill={
                                    j < rev.rating ? "currentColor" : "none"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black/20">
                            <CheckCircle2
                              size={12}
                              className="text-secondary"
                            />{" "}
                            Verified Ritual
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() =>
                                  handleAdminAction(rev._id, "approved")
                                }
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleAdminAction(rev._id, "rejected")
                                }
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-full"
                              >
                                <XCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pl-2 relative">
                        <Quote className="absolute -left-2 -top-4 text-black/3 w-12 h-12" />
                        <p className="font-poppins text-lg text-black/70 leading-relaxed italic pr-12">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-black/5 rounded-[3rem]">
                  <Sparkles className="text-black/10 mx-auto mb-4" size={32} />
                  <p className="font-poppins text-[10px] uppercase tracking-widest text-black/20">
                    Be the first to share your journey
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetail;
