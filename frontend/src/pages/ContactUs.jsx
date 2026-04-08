import React, { useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactUs = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Product Inquiry",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace with your actual API endpoint URL
      const { data } = await axios.post("/api/v1/contact/send", formData);

      if (data.success) {
        toast.success(data.message || "Message sent successfully!");
        setFormData({ name: "", email: "", subject: "Product Inquiry", message: "" });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-poppins text-primary">
      <ToastContainer position="top-right" theme="dark" />

      {/* HERO HEADER */}
      <section className="bg-lightGray py-20 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl italic mb-4">Contact Our Experts</h1>
          <p className="uppercase tracking-[0.3em] text-[10px] opacity-60 max-w-md mx-auto leading-relaxed">
            Whether you are a salon professional or a ritual enthusiast, we are here to assist.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* LEFT SIDE: CONTACT INFO & MAP */}
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-3xl italic mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <ContactItem icon={<Phone size={20} />} title="Professional Support" detail="+91 (98456-35743)" />
                <ContactItem icon={<Mail size={20} />} title="Email Inquiry" detail="pelliscopro@gmail.com" />
                <ContactItem icon={<MapPin size={20} />} title="Studio Headquarters" detail="1221 Avenue of the Americas, New York, NY" />
                <ContactItem icon={<Clock size={20} />} title="Working Hours" detail="Mon - Fri: 9:00 AM - 6:00 PM EST" />
              </div>
            </div>

            <div className="relative w-full h-64 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl shadow-primary/5 border border-black/5">
              <iframe
                title="Pellisco Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3433.31276179184!2d76.38505497536856!3d30.62514197463638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39101fb362926f57%3A0x6b345230ac0524c4!2sBeauty%20Nexus!5e0!3m2!1sen!2sin!4v1773475472825!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* RIGHT SIDE: CONTACT FORM */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-black/[0.03]">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                <FloatingInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Subject</label>
                <div className="relative group">
                   <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-lightGray/50 border border-black/[0.05] rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/5 transition-all outline-none appearance-none"
                   >
                    <option>Product Inquiry</option>
                    <option>Professional Partnership</option>
                    <option>Order Status</option>
                    <option>Other</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                    <Clock size={14} className="rotate-90"/>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="How can we help you?"
                  className="w-full bg-lightGray/50 border border-black/[0.05] rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/5 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <button
                disabled={loading}
                className="w-full bg-primary text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden group relative transition-all active:scale-[0.98] shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-secondary -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>Send Message <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* WHATSAPP */}
      <a href="https://wa.me/yournumber" target="_blank" rel="noreferrer" className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 group">
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">Chat with us</span>
        <MessageCircle size={24} />
      </a>
    </div>
  );
};

// HELPER COMPONENTS
const ContactItem = ({ icon, title, detail }) => (
  <div className="flex items-center gap-5 group">
    <div className="p-4 bg-lightGray text-primary rounded-2xl group-hover:bg-secondary group-hover:text-white transition-all duration-500 border border-black/[0.03]">
      {icon}
    </div>
    <div>
      <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40 mb-0.5">{title}</h4>
      <p className="text-sm font-semibold tracking-tight">{detail}</p>
    </div>
  </div>
);

const FloatingInput = ({ label, type, placeholder, name, value, onChange }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 ml-1 group-focus-within:text-secondary group-focus-within:opacity-100 transition-all">
      {label}
    </label>
    <input
      required
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-lightGray/50 border border-black/[0.05] rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
    />
  </div>
);

export default ContactUs;
