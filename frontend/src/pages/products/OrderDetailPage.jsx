import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleOrder } from "../../features/admin/order/orderSlice";
import { motion } from "framer-motion";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getSingleOrder(id));
  }, [dispatch, id]);

  if (loading || !order) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF9F6]">
        <p className="text-xs tracking-widest uppercase text-black/40">
          Loading your order...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F3F4F6] px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-serif italic tracking-tight">
            Order #{order._id.slice(-6)}
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-black/30 mt-2">
            {new Date(order.createdAt).toDateString()}
          </p>
        </div>

        {/* STATUS */}
        <div className="flex justify-center mb-12">
          <span className="px-6 py-2 text-xs tracking-widest uppercase rounded-full bg-yellow-100/60 text-yellow-700 border border-yellow-200 shadow-sm">
            {order.orderStatus}
          </span>
        </div>

        {/* PRODUCTS */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] mb-10">
          <h2 className="mb-8 text-lg font-serif italic">Products</h2>

          <div className="space-y-6">
            {order.orderItems.map((item) => (
              <motion.div
                key={item._id}
                whileHover={{ scale: 1.02 }}
                className="flex gap-5 p-4 rounded-2xl hover:bg-black/5 transition"
              >
                <img
                  src={item.image}
                  className="w-20 h-20 rounded-xl object-cover shadow-sm"
                />

                <div className="flex-1">
                  <h3 className="text-sm font-medium text-black/80">
                    {item.product?.name || item.name}
                  </h3>
                  <p className="text-xs text-black/40 mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-black">
                  ₹{item.price * item.quantity}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SHIPPING */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] mb-10">
          <h2 className="mb-6 text-lg font-serif italic">
            Shipping Details
          </h2>

          <div className="space-y-2 text-sm">
            <p className="font-medium">{order.shippingInfo?.fullName}</p>
            <p className="text-black/50">
              {order.shippingInfo?.address}
            </p>
            <p className="text-black/50">
              {order.shippingInfo?.city}, {order.shippingInfo?.state}
            </p>
            <p className="text-black/50">
              {order.shippingInfo?.phoneNo}
            </p>
          </div>
        </div>

        {/* PRICE */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
          <h2 className="mb-6 text-lg font-serif italic">Price Details</h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between text-black/60">
              <span>Subtotal</span>
              <span>₹{order.itemsPrice}</span>
            </div>

            <div className="flex justify-between text-black/60">
              <span>Tax</span>
              <span>₹{order.taxPrice}</span>
            </div>

            {order.discountPrice > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>-₹{order.discountPrice}</span>
              </div>
            )}

            <div className="border-t pt-4 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>

            {/* PREMIUM SAVING BADGE */}
            {order.discountPrice > 0 && (
              <p className="text-green-600 text-xs mt-3 tracking-wider">
                🎉 You saved ₹{order.discountPrice} on this order
              </p>
            )}
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 rounded-full border text-xs tracking-widest uppercase hover:bg-black hover:text-white transition"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
