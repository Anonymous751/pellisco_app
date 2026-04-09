import { useState, useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadUser } from "../../features/auth/authSlice";
import { createOrder } from "../../features/admin/order/orderSlice";
import axios from "axios";

const VALID_COUPONS = {
  SAVE10: 10,
  SAVE20: 20,
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

const [couponCode, setCouponCode] = useState(""); // input field
const [appliedCoupon, setAppliedCoupon] = useState(null); // actual coupon object
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    if (!user) dispatch(loadUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      address: user.address || "",
      state: user.state || "",
      pincode: user.pincode || "",
    }));
  }, [user]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const finalTotal = Math.max(0, subtotal - discount);

  // APPLY COUPON
const applyCoupon = async () => {
  try {
    const orderAmount = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const res = await axios.post(
      "http://localhost:1551/api/v1/coupon/validate",
      {
        code: couponCode.trim().toUpperCase(),
        orderAmount,
        cartItems,
      },
      { withCredentials: true }
    );

    console.log("RESPONSE:", res.data);

    if (!res.data?.success) {
      alert(res.data?.message || "Invalid coupon");
      return;
    }

    // ✅ STORE CORRECTLY
    setAppliedCoupon({
      couponId: res.data.data.couponId,
      code: res.data.data.code,
    });

    setDiscount(res.data.data.discountAmount);
    setCouponApplied(true);

  } catch (err) {
    console.log("ERROR:", err.response?.data || err);
    alert(err.response?.data?.message || "Something went wrong");
  }
};

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
   const orderData = {
  shippingInfo: {
    fullName: formData.name,
    phoneNo: formData.phone,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    postalCode: formData.pincode,
  },

  orderItems: cartItems.map((item) => ({
    product: item._id,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
  })),

  paymentInfo: {
    method: "COD",
    status: "pending",
  },

  // ✅ ONLY send couponId + code
  coupon: appliedCoupon
  ? {
      couponId: appliedCoupon.couponId,
      code: appliedCoupon.code,
    }
  : null,
};

    try {
      const res = await dispatch(createOrder(orderData));

      if (res.meta.requestStatus === "fulfilled") {
        navigate("/orders");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Your cart is empty</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif italic">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* LEFT FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl">
              <h2 className="mb-8 font-serif text-xl">Shipping Details</h2>

              <div className="grid gap-6">
                {["name", "email", "phone"].map((key) => (
                  <input
                    key={key}
                    value={formData[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={key.toUpperCase()}
                    className="border-b py-3 bg-transparent outline-none"
                  />
                ))}

                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Address"
                  className="border-b py-3 bg-transparent outline-none"
                />

                <div className="grid grid-cols-2 gap-6">
                  <input
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="City"
                    className="border-b py-3 outline-none"
                  />
                  <input
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="State"
                    className="border-b py-3 outline-none"
                  />
                </div>

                <input
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  placeholder="Pincode"
                  className="border-b py-3 outline-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white p-10 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-xl font-serif mb-8">Order Summary</h2>

              {/* ITEMS */}
              <div className="space-y-5 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <img
                      src={item.image}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-black/40">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* COUPON FIELD */}
              <div className="mb-6">
                {!couponApplied ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon"
                        className="flex-1 border-b py-2 outline-none"
                      />
                     <button
  onClick={() => {
    console.log("🔥 BUTTON CLICKED");
    applyCoupon();
  }}
  className="px-4 py-2 text-xs border rounded-full"
>
  Apply
</button>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-green-600">
                    Coupon applied: {appliedCoupon?.code} (-₹{discount})
                  </div>
                )}
              </div>

              {/* TOTAL */}
              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleCheckout}
                className="group mt-8 w-full h-14 bg-black text-white rounded-full flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                Place Order
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
