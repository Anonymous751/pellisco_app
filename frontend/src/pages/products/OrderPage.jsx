import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../../features/admin/order/orderSlice";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const { orders, loading, totalPages } = useSelector(
    (state) => state.orders
  );

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      dispatch(fetchMyOrders({ page, limit: 10 }));
    }
  }, [dispatch, isAuthenticated, navigate, page]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-black/50">Loading your orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-black/60">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-serif italic text-primary mb-4">
            Your Orders
          </h1>
          <p className="text-xs tracking-[0.4em] uppercase text-black/30">
            Track • Manage • Review
          </p>
        </div>

        {/* ORDERS */}
        <div className="space-y-10">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition"
            >
              {/* TOP */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-black/40">Order ID</p>
                  <p className="font-semibold text-lg">
                    #{order._id.slice(-6)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-black/40">Status</p>
                  <p
                    className={`font-semibold ${
                      order.orderStatus === "Delivered"
                        ? "text-green-600"
                        : order.orderStatus === "Shipped"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.orderStatus}
                  </p>
                </div>
              </div>

              {/* USER INFO (NEW) */}
              <div className="mb-6 p-4 bg-black/[0.02] rounded-xl">
                <p className="text-xs text-black/40 mb-1">Customer</p>
                <p className="font-medium">
                  {order.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-black/50">
                  {order.user?.email}
                </p>
              </div>

              {/* PRODUCTS */}
              <div className="space-y-5 mb-6">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex gap-5">
                    <img
                      src={item.image}
                      className="w-20 h-20 rounded-xl object-cover border"
                    />

                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-primary">
                        {item.name}
                      </h4>

                      <p className="text-xs text-black/40">
                        Qty: {item.quantity}
                      </p>

                      <p className="text-sm font-bold mt-1">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SHIPPING */}
              <div className="grid grid-cols-2 gap-6 text-sm border-t pt-6">
                <div>
                  <p className="text-black/40">Shipping</p>
                  <p className="font-medium">
                    {order.shippingInfo?.address}
                  </p>
                  <p className="text-black/50 text-xs">
                    {order.shippingInfo?.city},{" "}
                    {order.shippingInfo?.state}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-black/40">Total</p>
                  <p className="font-bold text-lg">
                    ₹{order.totalPrice}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="px-6 py-2 rounded-full border border-black/10 hover:bg-black hover:text-white transition text-xs uppercase tracking-widest"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-3 mt-16 flex-wrap">
          {/* PREV */}
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 border rounded-full text-sm hover:bg-black hover:text-white transition"
          >
            Prev
          </button>

          {/* PAGE NUMBERS */}
          {[...Array(totalPages || 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-full text-sm ${
                page === i + 1
                  ? "bg-black text-white"
                  : "border hover:bg-black hover:text-white"
              } transition`}
            >
              {i + 1}
            </button>
          ))}

          {/* NEXT */}
          <button
            onClick={() =>
              setPage((p) => Math.min(p + 1, totalPages))
            }
            className="px-4 py-2 border rounded-full text-sm hover:bg-black hover:text-white transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
