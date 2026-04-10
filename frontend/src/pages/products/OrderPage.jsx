import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../../features/admin/order/orderSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const {
    orders = [],
    loading,
    totalPages,
  } = useSelector((state) => state.orders);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      dispatch(fetchMyOrders({ page, limit: 10 }));
    }
  }, [dispatch, isAuthenticated, navigate, page]);

  // LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-white">
        <p className="text-black/40 tracking-widest uppercase text-xs">
          Loading your orders...
        </p>
      </div>
    );
  }

  // EMPTY STATE
  if (!orders?.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-white text-center">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-black/40 tracking-widest text-xs uppercase">
          No orders found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F3F4F6] px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight text-black">
            Your Orders
          </h1>
          <p className="mt-3 text-xs tracking-[0.35em] uppercase text-black/30">
            Track • Manage • Review
          </p>
        </div>

        {/* ORDERS */}
        <div className="space-y-10">
          {orders
            ?.filter((order) => order && order._id) // ✅ REMOVE NULL ORDERS
            .map((order) => {
              return (
                <motion.div
                  key={order._id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] transition-all duration-300"
                >
                  {/* TOP */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs">
                        #{order?._id?.slice(-2)}
                      </div>

                      <div>
                        <p className="text-[10px] text-black/40 uppercase tracking-widest">
                          Order ID
                        </p>
                        <p className="font-semibold tracking-tight">
                          #{order?._id?.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-4 py-1 text-[11px] uppercase tracking-widest rounded-full font-semibold border ${
                        order?.orderStatus === "Delivered"
                          ? "bg-green-100/60 text-green-700 border-green-200"
                          : order?.orderStatus === "Shipped"
                          ? "bg-blue-100/60 text-blue-700 border-blue-200"
                          : "bg-yellow-100/60 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {order?.orderStatus || "Processing"}
                    </span>
                  </div>

                  {/* CUSTOMER */}
                  <div className="mb-6 p-4 rounded-2xl bg-black/[0.03] border border-black/5">
                    <p className="text-[10px] uppercase tracking-widest text-black/40 mb-1">
                      Customer
                    </p>
                    <p className="font-medium">
                      {order?.user?.name || order?.user?.email || "Guest"}
                    </p>
                    <p className="text-xs text-black/50">
                      {order?.user?.email}
                    </p>
                  </div>

                  {/* PRODUCTS */}
                  <div className="space-y-4 mb-6">
                    {order?.orderItems
                      ?.filter((item) => item && item._id) // ✅ FIX NULL ITEMS
                      ?.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 transition"
                        >
                          <img
                            src={item?.image}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover"
                          />

                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-black/80">
                              {item?.name}
                            </h4>

                            <div className="flex justify-between text-xs text-black/50 mt-1">
                              <span>Qty: {item?.quantity}</span>
                              <span className="font-medium text-black">
                                ₹{(item?.price || 0) * (item?.quantity || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* SHIPPING + TOTAL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-t border-black/5 pt-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-black/40 mb-1">
                        Shipping
                      </p>
                      <p className="font-medium text-black/80">
                        {order?.shippingInfo?.address}
                      </p>
                      <p className="text-xs text-black/50">
                        {order?.shippingInfo?.city},{" "}
                        {order?.shippingInfo?.state}
                      </p>
                    </div>

                    <div className="md:text-right space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-black/40 mb-1">
                        Price Details
                      </p>

                      <p className="text-xs text-black/60">
                        Subtotal: ₹{order?.itemsPrice || 0}
                      </p>

                      <p className="text-xs text-black/60">
                        Tax (18%): ₹{order?.taxPrice || 0}
                      </p>

                      {order?.discountPrice > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          Discount: -₹{order.discountPrice}
                        </p>
                      )}

                      <p className="text-lg font-semibold mt-1">
                        Total: ₹{Number(order?.totalPrice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() =>
                        order?._id && navigate(`/order/${order._id}`)
                      }
                      className="px-6 py-2 rounded-full bg-linear-to-r from-black to-black/80 text-white text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-3 mt-16 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-5 py-2 rounded-full border bg-white hover:bg-black hover:text-white transition"
          >
            Prev
          </button>

          {[...Array(totalPages || 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-full text-sm transition ${
                page === i + 1
                  ? "bg-black text-white"
                  : "border hover:bg-black hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages || 1))}
            className="px-5 py-2 rounded-full border bg-white hover:bg-black hover:text-white transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
