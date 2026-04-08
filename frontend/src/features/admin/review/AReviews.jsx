import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Trash2,
  XCircle,
  CheckCircle,
  Star,
  Square,
  CheckSquare,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  resetAdminReviewState,
  updateReviewStatusAction,
  removeError,
  deleteReviewAction,
} from "../products/productSlice";

const AReviews = () => {
  const dispatch = useDispatch();
  const { loading, error, isUpdated } = useSelector((state) => state.product);

  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Optimize Cloudinary avatars
  const getOptimizedUrl = (url) =>
    url ? url.replace("/upload/", "/upload/w_100,c_fill,g_face,q_auto,f_auto/") : null;

  // Fetch reviews from backend
  const fetchAllReviews = async () => {
    try {
      const { data } = await axios.get("/api/v1/admin/reviews");
      console.log("Fetched Reviews:", data.reviews);
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Handle redux state changes
  useEffect(() => {
    if (isUpdated) {
      toast.success("Review updated successfully");
      dispatch(resetAdminReviewState());
      fetchAllReviews();
    }
    if (error) {
      toast.error(error);
      dispatch(removeError());
    }
  }, [isUpdated, error, dispatch]);

  // Change review status
  const handleStatusChange = (productId, reviewId, status) => {
    dispatch(updateReviewStatusAction({ productId, reviewId, status }));
    setReviews((prev) =>
      prev.map((rev) =>
        rev._id === reviewId ? { ...rev, status } : rev
      )
    );
  };

  // Delete review
  const handleDeleteReview = (productId, reviewId) => {
    if (window.confirm("Delete this review permanently?")) {
      dispatch(deleteReviewAction({ productId, reviewId }));
      setReviews((prev) => prev.filter((rev) => rev._id !== reviewId));
    }
  };

  // Filtered reviews based on search
  const filteredReviews = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return reviews.filter((rev) => {
      const name = (rev.name || "").toLowerCase();
      const comment = (rev.comment || "").toLowerCase();
      const productName = (rev.productName || "").toLowerCase();
      return name.includes(search) || comment.includes(search) || productName.includes(search);
    });
  }, [reviews, searchTerm]);

  // Select logic
  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filteredReviews.length
        ? []
        : filteredReviews.map((r) => r._id)
    );

  const toggleSelectOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  return (
    <div className="p-10 bg-[#FAF9F6] min-h-screen font-sans text-[#1A1A1A]">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <button onClick={toggleSelectAll}>
              {selectedIds.length === filteredReviews.length && filteredReviews.length > 0 ? (
                <CheckSquare size={20} className="text-[#6B705C]" />
              ) : (
                <Square size={20} className="text-gray-300" />
              )}
            </button>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#6B705C]">
              Management
            </span>
          </div>
          <h1 className="font-serif text-5xl italic font-extralight tracking-tight text-[#2C3020]">
            Customer Voices
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative md:w-80">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={16} />
            <input
              type="text"
              placeholder="Search reviews..."
              className="w-full bg-transparent border-b border-black/10 py-3 pl-8 outline-none font-serif italic text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchAllReviews}
            disabled={loading}
            className={`p-3 rounded-full border border-black/5 hover:bg-[#6B705C] hover:text-white transition-all ${loading ? "animate-spin" : ""}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* REVIEWS GRID */}
      <div className="max-w-7xl mx-auto space-y-3 pb-24">
        {filteredReviews.length > 0 ? filteredReviews.map((rev) => (
          <div
            key={rev._id}
            className={`bg-white border transition-all duration-500 group flex items-center gap-8 p-6 ${
              selectedIds.includes(rev._id) ? "border-[#6B705C] shadow-md" : "border-black/3 hover:border-black/10"
            }`}
          >
            <button onClick={() => toggleSelectOne(rev._id)}>
              {selectedIds.includes(rev._id) ? (
                <CheckSquare size={18} className="text-[#6B705C]" />
              ) : (
                <Square size={18} className="text-gray-200" />
              )}
            </button>

            {/* Avatar */}
            <div className="w-56 flex-none border-r border-black/5 pr-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-black/5 flex items-center justify-center overflow-hidden shadow-inner">
                  {rev.avatar ? (
                    <img src={getOptimizedUrl(rev.avatar)} alt={rev.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#6B705C] text-xs font-bold">{rev.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold truncate text-[#2C3020]">{rev.name}</h3>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={8}
                        fill={i < rev.rating ? "#6B705C" : "none"}
                        className={i < rev.rating ? "text-[#6B705C]" : "text-gray-200"}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="grow">
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#6B705C] font-bold block mb-1">
                Product: {rev.productName || "Unknown Product"}
              </span>
              <p className="font-serif italic text-base text-[#4A4A4A] leading-relaxed">"{rev.comment}"</p>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-end gap-3 min-w-35">
              <span className={`text-[8px] uppercase tracking-[0.3em] font-bold px-3 py-1 rounded-full ${
                rev.status === "approved"
                  ? "bg-emerald-50 text-emerald-600"
                  : rev.status === "pending"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-600"
              }`}>{rev.status}</span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button disabled={loading} onClick={() => handleStatusChange(rev.productId, rev._id, "approved")} className="p-2 rounded-full hover:bg-emerald-50 hover:text-emerald-600" title="Approve">
                  <CheckCircle size={16} strokeWidth={1.5} />
                </button>
                <button disabled={loading} onClick={() => handleStatusChange(rev.productId, rev._id, "rejected")} className="p-2 rounded-full hover:bg-amber-50 hover:text-amber-600" title="Reject">
                  <XCircle size={16} strokeWidth={1.5} />
                </button>
                <button disabled={loading} onClick={() => handleDeleteReview(rev.productId, rev._id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full" title="Delete">
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center opacity-20 font-serif italic text-xl">
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AReviews;
