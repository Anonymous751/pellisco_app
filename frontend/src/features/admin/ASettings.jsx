import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  CreditCard,
  Percent,
  Bell,
  Zap,
  ShieldCheck,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, updateSettings } from "./settings/settingsThunk";

const ASettings = () => {
  const dispatch = useDispatch();
  const debounceRef = useRef(null);

  const { data, loading } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // =========================
  // 📥 LOAD SETTINGS
  // =========================
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync Redux → Local
  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  // =========================
  // 🧠 VALIDATION
  // =========================
  const validateSettings = (data) => {
    const errs = {};

    if (data.supportEmail && !data.supportEmail.includes("@")) {
      errs.supportEmail = "Invalid email";
    }

    if (data.taxRate && data.taxRate < 0) {
      errs.taxRate = "Tax cannot be negative";
    }

    return errs;
  };

  // =========================
  // ⚡ AUTO-SAVE (DEBOUNCE)
  // =========================
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };

    setFormData(updated);

    const errs = validateSettings(updated);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      dispatch(updateSettings(updated));
    }, 800);
  };

  // =========================
  // 🔥 TAB CONFIG
  // =========================
  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "tax", label: "Taxation", icon: Percent },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Zap },
  ];

  // =========================
  // 🔥 RENDER CONTENT
  // =========================
  const renderTabContent = () => {
    if (!isAdmin) {
      return (
        <div className="text-red-500 text-sm font-bold">
          🚫 You are not authorized to edit settings
        </div>
      );
    }

    switch (activeTab) {
      case "general":
        return (
          <Section title="Store Information">
            <Input
              label="Store Name"
              value={formData.storeName || ""}
              onChange={(e) => handleChange("storeName", e.target.value)}
            />

            <Input
              label="Support Email"
              value={formData.supportEmail || ""}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
            />
            {errors.supportEmail && <Error msg={errors.supportEmail} />}

            <Select
              label="Currency"
              value={formData.currency || ""}
              onChange={(e) => handleChange("currency", e.target.value)}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </Select>

            <Select
              label="Timezone"
              value={formData.timezone || ""}
              onChange={(e) => handleChange("timezone", e.target.value)}
            >
              <option>Punjab</option>
              <option>Delhi</option>
              <option>Mumbai</option>
              <option value="UTC">UTC</option>
            </Select>
          </Section>
        );

      case "payments":
        return (
          <Section title="Payment Settings">
            <Toggle
              label="Enable Stripe"
              value={formData.enableStripe}
              onChange={(v) => handleChange("enableStripe", v)}
            />

            <Toggle
              label="Enable PayPal"
              value={formData.enablePaypal}
              onChange={(v) => handleChange("enablePaypal", v)}
            />
          </Section>
        );

      case "tax":
        return (
          <Section title="Tax Rules">
            <Toggle
              label="Enable Tax"
              value={formData.enableTax}
              onChange={(v) => handleChange("enableTax", v)}
            />

            <Input
              label="Default Tax (%)"
              value={formData.taxRate || ""}
              onChange={(e) => handleChange("taxRate", e.target.value)}
            />
            {errors.taxRate && <Error msg={errors.taxRate} />}
          </Section>
        );

      case "notifications":
        return (
          <Section title="Notifications">
            <Toggle
              label="Email Alerts"
              value={formData.emailAlerts}
              onChange={(v) => handleChange("emailAlerts", v)}
            />

            <Toggle
              label="SMS Alerts"
              value={formData.smsAlerts}
              onChange={(v) => handleChange("smsAlerts", v)}
            />
          </Section>
        );

      case "integrations":
        return (
          <Section title="Integrations">
            <Toggle
              label="Webhook Enabled"
              value={formData.webhookEnabled}
              onChange={(v) => handleChange("webhookEnabled", v)}
            />

            <Input
              label="Webhook URL"
              value={formData.webhookUrl || ""}
              onChange={(e) => handleChange("webhookUrl", e.target.value)}
            />
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Global Settings</h1>

        <div className="flex items-center gap-2 text-xs text-mutedGreen">
          <ShieldCheck size={16} />
          DPDP Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${
                  activeTab === tab.id
                    ? "bg-white border-secondary"
                    : "border-transparent"
                }`}
              >
                <Icon size={16} />
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border">
          {loading ? "Loading..." : renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ASettings;

/* =========================
   🔥 REUSABLE COMPONENTS
========================= */

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="font-bold text-sm text-primary">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase text-mutedGreen">
      {label}
    </label>
    <input
      {...props}
      className="w-full p-3 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-secondary"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase text-mutedGreen">
      {label}
    </label>
    <select
      {...props}
      className="w-full p-3 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-secondary"
    >
      {children}
    </select>
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    className="flex justify-between items-center p-3 rounded-xl cursor-pointer hover:bg-accent/30"
  >
    <p className="text-xs font-bold text-primary">{label}</p>

    <div
      className={`w-10 h-5 rounded-full relative ${
        value ? "bg-secondary" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${
          value ? "left-6" : "left-1"
        }`}
      />
    </div>
  </div>
);

const Error = ({ msg }) => <p className="text-[10px] text-red-500">{msg}</p>;
