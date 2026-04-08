import { useState, useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadUser } from "../../features/auth/authSlice";
import { createOrder } from "../../features/admin/order/orderSlice";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =========================
  // 🔥 REDUX STATE
  // =========================
  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  const cartItems = useSelector((state) => state.cart.cartItems);

  // =========================
  // 🔥 LOAD USER (ONCE)
  // =========================
  useEffect(() => {
    if (!user) dispatch(loadUser());
  }, [dispatch, user]);

  // =========================
  // 🔐 AUTH GUARD
  // =========================
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // =========================
  // 🧾 FORM STATE
  // =========================
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // =========================
  // 🔥 PREFILL (SMART)
  // =========================
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

  // =========================
  // 🛒 TOTAL (MEMOIZED)
  // =========================
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // =========================
  // ❌ EMPTY CART
  // =========================
  if (!cartItems.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg text-black/60">Your cart is empty</p>
      </div>
    );
  }

  // =========================
  // ⏳ LOADING
  // =========================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-black/50">Preparing your checkout...</p>
      </div>
    );
  }

  // =========================
  // ✍️ INPUT HANDLER
  // =========================
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // =========================
  // 🚀 CHECKOUT HANDLER (FIXED)
  // =========================
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
      itemsPrice: subtotal,
      totalPrice: subtotal,
      paymentMethod: "COD",
    };

    console.log("✅ ORDER:", orderData);

    try {
      const res = await dispatch(createOrder(orderData));

      if (res.meta.requestStatus === "fulfilled") {
        navigate("/orders");
      }
    } catch (error) {
      console.error("❌ Order Failed:", error);
    }
  };

  // =========================
  // 🧩 UI
  // =========================
  return (
    <div className="min-h-screen bg-[#FAF9F6] px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-serif italic text-primary mb-4">
            Checkout Ritual
          </h1>
          <p className="text-xs tracking-[0.4em] uppercase text-black/30">
            Secure • Encrypted • Trusted
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">

          {/* LEFT */}
          <div className="lg:col-span-7">
            <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl">

              <h2 className="text-xl font-serif mb-8">
                Shipping Details
              </h2>

              <div className="grid gap-6">

                {[
                  { key: "name", label: "Full Name" },
                  { key: "email", label: "Email Address" },
                  { key: "phone", label: "Phone Number" },
                ].map((field) => (
                  <input
                    key={field.key}
                    value={formData[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value)
                    }
                    placeholder={field.label}
                    className="border-b border-black/10 bg-transparent py-3 outline-none text-sm"
                  />
                ))}

                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    handleChange("address", e.target.value)
                  }
                  placeholder="Full Address"
                  className="border-b border-black/10 bg-transparent py-3 outline-none text-sm"
                />

                <div className="grid grid-cols-2 gap-6">
                  <input
                    value={formData.city}
                    onChange={(e) =>
                      handleChange("city", e.target.value)
                    }
                    placeholder="City"
                    className="border-b border-black/10 py-3 outline-none text-sm"
                  />
                  <input
                    value={formData.state}
                    onChange={(e) =>
                      handleChange("state", e.target.value)
                    }
                    placeholder="State"
                    className="border-b border-black/10 py-3 outline-none text-sm"
                  />
                </div>

                <input
                  value={formData.pincode}
                  onChange={(e) =>
                    handleChange("pincode", e.target.value)
                  }
                  placeholder="Pincode"
                  className="border-b border-black/10 py-3 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white p-10 rounded-[2.5rem] shadow-2xl">

              <h2 className="text-xl font-serif mb-8">
                Your Ritual
              </h2>

              <div className="space-y-6 mb-8">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-6">
                    <img
                      src={item.image}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-medium">
                        {item.name}
                      </h4>
                      <p className="text-xs text-black/40">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold border-t pt-4">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="group mt-10 w-full h-14 bg-primary text-white rounded-full flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                Place Orders
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
