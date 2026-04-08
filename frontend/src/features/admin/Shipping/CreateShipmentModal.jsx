import { useState } from "react";
import {
  X,
  Truck,
  MapPin,
  Box,
  User,
  Globe,
  Hash,
  Banknote,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  createShipment,
  getShippingStats,
} from "./shippingSlice/shippingSlice";

const CreateShipmentModal = ({ isOpen, onClose, onRefresh }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.shipping);

  const [formData, setFormData] = useState({
    order: "",
    user: "",
    carrier: "Local Courier",
    shippingMethod: "Surface",
    eta: "",
    destination: {
      address: "",
      city: "",
      state: "",
      country: "NG",
      zipCode: "",
      phone: "",
    },
    shippingCost: { amount: 0, currency: "NGN" },
  });

  if (!isOpen) return null;

  // Helper for deeply nested state updates
  const updateNestedState = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const { address, city, state, country, zipCode, phone } =
      formData.destination;
    if (!address || !city || !state || !country || !zipCode || !phone) {
      return toast.error("Complete destination details required.");
    }
    if (formData.shippingCost.amount <= 0) {
      return toast.error("Please enter a valid order value.");
    }

    try {
      await dispatch(createShipment(formData)).unwrap();
      toast.success("Fulfillment Initialized");
      // Refresh stats and list
      dispatch(getShippingStats());
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err || "Fulfillment sync failed");
    }
  };

  const inputClass =
    "w-full p-3 bg-gray-50 rounded-xl text-xs outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all font-medium placeholder:text-slate-300";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden border border-white/20">
        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Initialize Fulfillment
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Pellisco Logistics Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 max-h-[75vh] overflow-y-auto"
        >
          {/* SECTION: IDENTIFIERS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                <Box size={12} /> Order ID
              </label>
              <input
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
                placeholder="Ex: 65cb..."
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                <User size={12} /> User ID
              </label>
              <input
                value={formData.user}
                onChange={(e) =>
                  setFormData({ ...formData, user: e.target.value })
                }
                placeholder="Ex: 65cb..."
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* SECTION: FINANCIALS (Fixes the $0.00 issue) */}
          <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-100/50 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5">
                <Banknote size={12} /> Order Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  ₦
                </span>
                <input
                  type="number"
                  value={formData.shippingCost.amount}
                  onChange={(e) =>
                    updateNestedState(
                      "shippingCost",
                      "amount",
                      Number(e.target.value)
                    )
                  }
                  className={`${inputClass} pl-7`}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-600 uppercase">
                Currency
              </label>
              <select
                value={formData.shippingCost.currency}
                onChange={(e) =>
                  updateNestedState("shippingCost", "currency", e.target.value)
                }
                className={inputClass}
              >
                <option value="NGN">NGN (Naira)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>
          </div>

          {/* SECTION: LOGISTICS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Carrier
              </label>
              <select
                value={formData.carrier}
                onChange={(e) =>
                  setFormData({ ...formData, carrier: e.target.value })
                }
                className={inputClass}
              >
                <option>Local Courier</option>
                <option>DHL Express</option>
                <option>FedEx</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Method
              </label>
              <select
                value={formData.shippingMethod}
                onChange={(e) =>
                  setFormData({ ...formData, shippingMethod: e.target.value })
                }
                className={inputClass}
              >
                <option>Surface</option>
                <option>Air Express</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                ETA
              </label>
              <input
                type="date"
                value={formData.eta}
                onChange={(e) =>
                  setFormData({ ...formData, eta: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* SECTION: DESTINATION */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 border-b border-blue-50 pb-2">
              <MapPin size={14} /> Destination Details
            </h3>
            <input
              placeholder="Street Address"
              value={formData.destination.address}
              onChange={(e) =>
                updateNestedState("destination", "address", e.target.value)
              }
              className={inputClass}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City"
                className={inputClass}
                required
                value={formData.destination.city}
                onChange={(e) =>
                  updateNestedState("destination", "city", e.target.value)
                }
              />
              <input
                placeholder="State"
                className={inputClass}
                required
                value={formData.destination.state}
                onChange={(e) =>
                  updateNestedState("destination", "state", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Globe
                  size={12}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  placeholder="NG"
                  className="pl-8 w-full p-3 bg-gray-50 rounded-xl text-xs outline-none focus:bg-white"
                  required
                  value={formData.destination.country}
                  onChange={(e) =>
                    updateNestedState(
                      "destination",
                      "country",
                      e.target.value.toUpperCase()
                    )
                  }
                />
              </div>
              <div className="relative">
                <Hash
                  size={12}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  placeholder="Zip"
                  className="pl-8 w-full p-3 bg-gray-50 rounded-xl text-xs outline-none focus:bg-white"
                  required
                  value={formData.destination.zipCode}
                  onChange={(e) =>
                    updateNestedState("destination", "zipCode", e.target.value)
                  }
                />
              </div>
              <input
                placeholder="Phone"
                className={inputClass}
                required
                value={formData.destination.phone}
                onChange={(e) =>
                  updateNestedState("destination", "phone", e.target.value)
                }
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-6 border-t flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Create Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipmentModal;
