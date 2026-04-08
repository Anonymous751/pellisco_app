import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Mail, Phone, Globe, CreditCard,
  Save, Camera, ShieldCheck, Calendar, Clock, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clearErrors, clearMessage, updateProfile } from '../auth/authSlice';

const UProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, message, error } = useSelector((state) => state.auth);

  // --- Local States ---
  const [formData, setFormData] = useState({ name: '', phone: '', preferredCurrency: '' });
  const [avatar, setAvatar] = useState(""); // Holds the Base64 string for the backend
  const [avatarPreview, setAvatarPreview] = useState(""); // Holds the blob for the UI
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Sync Redux User to Local Form ---
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        preferredCurrency: user.preferredCurrency || ''
      });
      setAvatarPreview(user.avatar?.url || "");
    }
  }, [user]);

  // --- Cleanup Errors/Messages ---
  useEffect(() => {
    if (error) { dispatch(clearErrors()); }
    if (message) { dispatch(clearMessage()); }
  }, [error, message, dispatch]);

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  /**
   * FIXED: Image Compression Logic
   */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    // UI Preview
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));

    // Compression for Backend
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setAvatar(compressedBase64);
        setIsProcessing(false);
      };
    };
  };

  /**
   * FIXED: handleUpdate (Mapped to Backend Controller)
   */
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isProcessing) {
      return toast.info("Still optimizing your portrait...");
    }

    // Prepare Payload
    const payload = { ...formData };

    // KEY FIX: Changed 'payload.image' to 'payload.avatar' to match your controller
    if (avatar && avatar.startsWith("data:image")) {
      payload.avatar = avatar;
    }

    try {
      const updatePromise = dispatch(updateProfile(payload)).unwrap();

      toast.promise(updatePromise, {
        pending: "Synchronizing with Pellisco Registry...",
        success: "Profile updated successfully! 👌",
        error: {
          render: ({ data }) => data || "Update failed",
        }
      });

      await updatePromise;

      // Clear the local base64 state after success to prevent double-uploads
      setAvatar("");

    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  if (!user) return <div className="h-96 flex items-center justify-center italic text-gray-400">Loading...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pb-20 space-y-12 px-6 pt-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100">
        <div className="relative group">
          <div className="h-28 w-28 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-black transition-all">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <User size={48} className="text-gray-200" />
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <Loader2 className="animate-spin text-black" size={20} />
              </div>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 p-2.5 bg-white border border-gray-100 rounded-full shadow-lg cursor-pointer hover:bg-black hover:text-white transition-all active:scale-90">
            <Camera size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-4xl font-serif text-black font-bold capitalize tracking-tight">{user.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
              {user.tier || "Standard"} Tier Ritualist
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
        <div className="space-y-8">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-50 pb-3 flex items-center gap-2">
            <User size={14} /> Identity Details
          </h3>
          <div className="space-y-7">
            <SimpleField label="Legal Name" value={formData.name} onChange={(e) => handleInputChange(e, 'name')} icon={<User size={16}/>} />
            <SimpleField label="Email Address" value={user.email} icon={<Mail size={16}/>} isReadOnly />
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-50 pb-3 flex items-center gap-2">
            <Globe size={14} /> Connectivity
          </h3>
          <div className="space-y-7">
            <SimpleField label="Phone Number" value={formData.phone} onChange={(e) => handleInputChange(e, 'phone')} icon={<Phone size={16}/>} />
            <SimpleField label="Preferred Currency" value={formData.preferredCurrency} onChange={(e) => handleInputChange(e, 'preferredCurrency')} icon={<CreditCard size={16}/>} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-gray-50">
        <div className="text-center md:text-left">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Data Integrity</p>
          <p className="text-xs text-gray-400 italic font-serif">
            {isProcessing ? "Optimizing media..." : "Ready for synchronization."}
          </p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading || isProcessing}
          className="group flex items-center gap-4 px-16 py-5 bg-black text-white rounded-sm font-bold uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{loading ? "Synchronizing..." : "Update Profile"}</span>
        </button>
      </div>
    </div>
  );
};

// Sub-Component
const SimpleField = ({ label, value, icon, isReadOnly = false, onChange }) => (
  <div className="group border-b border-gray-100 hover:border-black transition-all pb-3">
    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] block mb-2">{label}</label>
    <div className="flex items-center gap-4">
      <div className="text-gray-300 group-focus-within:text-black transition-colors">{icon}</div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        readOnly={isReadOnly}
        className={`bg-transparent w-full text-[15px] font-semibold text-black outline-none ${isReadOnly ? 'cursor-not-allowed opacity-40' : ''}`}
      />
    </div>
  </div>
);

export default UProfilePage;
