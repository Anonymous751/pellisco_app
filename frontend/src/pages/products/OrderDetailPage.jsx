import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleOrder } from "../../features/admin/order/orderSlice";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const { order, loading } = useSelector((state) => state.orders);

  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (id) dispatch(getSingleOrder(id));
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

  const formatPrice = (num) => Number(num || 0).toFixed(2);

  console.log("ORDER:", order);
  console.log("USER:", order?.user);
  console.log("AVATAR:", order?.user?.avatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#F3F4F6] px-6 py-14">
      {/* BACK */}
      <div className="mt-12 flex lg:ml-42">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2 rounded-full border text-xs tracking-widest uppercase hover:bg-black hover:text-white transition"
        >
          ← Back to Orders
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif italic tracking-tight">
            Order #{order?._id?.slice(-6)}
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-black/30 mt-2">
            {new Date(order?.createdAt).toDateString()}
          </p>

          <span className="inline-block mt-5 px-5 py-1 text-xs tracking-widest uppercase rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
            {order?.orderStatus}
          </span>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* USER INFO */}
          <Card title="Customer Profile">
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden border shadow-sm">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User size={14} />
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium text-base">
                  {order?.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-black/50">
                  {order?.user?.email || "No email"}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <InfoRow
                label="User ID"
                value={order?.user?._id?.slice(-6) || "N/A"}
              />

              <InfoRow
                label="Phone"
                value={order?.shippingInfo?.phoneNo || "Not provided"}
              />

              <InfoRow
                label="Joined"
                value={
                  order?.user?.createdAt
                    ? new Date(order.user.createdAt).toDateString()
                    : "N/A"
                }
              />

              {order?.user?.ordersCount && (
                <InfoRow label="Total Orders" value={order.user.ordersCount} />
              )}
            </div>
          </Card>

          {/* SHIPPING */}
          <Card title="Shipping Info">
            <p className="font-medium">{order?.shippingInfo?.fullName}</p>
            <p className="text-black/50 text-sm">
              {order?.shippingInfo?.address}
            </p>
            <p className="text-black/50 text-sm">
              {order?.shippingInfo?.city}, {order?.shippingInfo?.state}
            </p>
            <p className="text-black/50 text-sm">
              {order?.shippingInfo?.phoneNo}
            </p>
          </Card>

          {/* ORDER INFO */}
          <Card title="Order Info">
            <InfoRow label="Order ID" value={order?._id} />
            <InfoRow
              label="Payment ID"
              value={order?.paymentInfo?.id || "N/A"}
            />
            <InfoRow
              label="Payment Status"
              value={order?.paymentInfo?.status || "Pending"}
            />
            <InfoRow
              label="Placed On"
              value={new Date(order?.createdAt).toLocaleString()}
            />
          </Card>

          {/* PRICE */}
          <Card title="Price Details">
            <InfoRow
              label="Subtotal"
              value={`₹${formatPrice(order?.itemsPrice)}`}
            />
            <InfoRow label="Tax" value={`₹${formatPrice(order?.taxPrice)}`} />

            {order?.discountPrice > 0 && (
              <InfoRow
                label="Discount"
                value={`-₹${formatPrice(order?.discountPrice)}`}
                highlight="green"
              />
            )}

            <div className="border-t pt-4 mt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{formatPrice(order?.totalPrice)}</span>
            </div>
          </Card>
        </div>

        {/* PRODUCTS */}
        <div className="mt-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40">
            <h2 className="mb-6 text-lg font-serif italic">Products</h2>

            <div className="space-y-5">
              {order?.orderItems?.map((item, index) => (
                <motion.div
                  key={item?._id || index}
                  whileHover={{ scale: 1.02 }}
                  className="flex gap-5 p-4 rounded-2xl hover:bg-black/5 transition"
                >
                  <img
                    src={item?.image}
                    alt="product"
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-sm font-medium">
                      {item?.product?.name || item?.name}
                    </h3>

                    <p className="text-xs text-black/50 mt-1">
                      Quantity: {item?.quantity}
                    </p>

                    <p className="text-xs text-black/40">
                      Price: ₹{formatPrice(item?.price)}
                    </p>
                  </div>

                  <div className="text-right font-semibold">
                    ₹{formatPrice(item?.price * item?.quantity)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* CARD */
const Card = ({ title, children }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
    <h2 className="mb-4 text-sm uppercase tracking-widest text-black/40">
      {title}
    </h2>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

/* INFO ROW */
const InfoRow = ({ label, value, highlight }) => (
  <div className="flex justify-between text-sm">
    <span className="text-black/50">{label}</span>
    <span
      className={
        highlight === "green" ? "text-green-600 font-medium" : "text-black"
      }
    >
      {value}
    </span>
  </div>
);

export default OrderDetailsPage;
