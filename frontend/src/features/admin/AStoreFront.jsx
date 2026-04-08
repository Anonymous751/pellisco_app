import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Save,
  Smartphone,
  Monitor,
  Layers,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Megaphone,
  Eye,
  EyeOff,
  X, // Added for removing text lines
} from "lucide-react";
import {
  addSlot,
  removeSlot,
  resetStatus,
  updateSlotContent,
  deployStorefront,
  fetchStorefrontData,
} from "./storeFront/storeFrontSlice";

// --- CLOUDINARY HELPER ---
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "pellisco_unsigned");

  const isVideo = file.type.startsWith("video");
  const resourceType = isVideo ? "video" : "image";

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dkv61main/${resourceType}/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.secure_url || null;
  } catch (err) {
    console.error("Connection Error:", err);
    return null;
  }
};

const PelliscoStorefront = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { contentData, loading, success, error } = useSelector(
    (state) => state.storefront
  );

  const [activeTab, setActiveTab] = useState("Hero");
  const [devicePreview, setDevicePreview] = useState("desktop");
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const categories = [
      "TopHeader",
      "Hero",
     
    ];
    categories.forEach((category) => {
      dispatch(fetchStorefrontData(category));
    });
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(resetStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && activeSlotId) {
      setIsUploading(true);
      const permanentUrl = await uploadToCloudinary(file);

      if (permanentUrl) {
        dispatch(
          updateSlotContent({
            category: activeTab,
            id: activeSlotId,
            updates: { image: permanentUrl },
          })
        );
      }
      setIsUploading(false);
      e.target.value = null;
    }
  };

  // --- NEW: Helper for Array Text Updates ---
  const handleArrayTextChange = (slotId, field, index, value) => {
    const currentSlot = contentData[activeTab].find(s => (s.id || s._id || s.slotId) === slotId);
    if (!currentSlot) return;

    const newArray = Array.isArray(currentSlot[field]) ? [...currentSlot[field]] : [currentSlot[field] || ""];
    newArray[index] = value;

    dispatch(
      updateSlotContent({
        category: activeTab,
        id: slotId,
        updates: { [field]: newArray },
      })
    );
  };

  const addTextField = (slotId, field) => {
    const currentSlot = contentData[activeTab].find(s => (s.id || s._id || s.slotId) === slotId);
    const currentArray = Array.isArray(currentSlot[field]) ? currentSlot[field] : [currentSlot[field] || ""];

    dispatch(
      updateSlotContent({
        category: activeTab,
        id: slotId,
        updates: { [field]: [...currentArray, ""] },
      })
    );
  };

  const removeTextField = (slotId, field, index) => {
    const currentSlot = contentData[activeTab].find(s => (s.id || s._id || s.slotId) === slotId);
    const newArray = currentSlot[field].filter((_, i) => i !== index);

    dispatch(
      updateSlotContent({
        category: activeTab,
        id: slotId,
        updates: { [field]: newArray },
      })
    );
  };

  const onAddSlot = () => {
    const currentSlots = contentData[activeTab] || [];
    const newId = Date.now();

    const newSlotData =
      activeTab === "TopHeader"
        ? { id: newId, announcement: "", isActive: true }
        : {
            id: newId,
            image: null,
            title: [""], // Changed to Array
            subtitle: [""], // Changed to Array
            cta: "Shop Now",
            link: "#",
          };

    dispatch(
      addSlot({
        category: activeTab,
        newSlot: newSlotData,
      })
    );
  };

  const onRemoveSlot = (id) => {
    dispatch(removeSlot({ category: activeTab, id }));
  };

  const onDeploy = () => {
    if (!isUploading) {
      dispatch(deployStorefront(contentData));
    }
  };

  const tabs = Object.keys(contentData || {});

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/*,video/*"
      />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
            Pellisco Studio
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Universal Slot Engine v4.0
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button
            onClick={() => setDevicePreview("desktop")}
            className={`p-2 rounded-xl transition-all ${
              devicePreview === "desktop" ? "bg-slate-900 text-white shadow-md" : "text-slate-400"
            }`}
          >
            <Monitor size={18} />
          </button>
          <button
            onClick={() => setDevicePreview("mobile")}
            className={`p-2 rounded-xl transition-all ${
              devicePreview === "mobile" ? "bg-slate-900 text-white shadow-md" : "text-slate-400"
            }`}
          >
            <Smartphone size={18} />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />

          <button
            onClick={onDeploy}
            disabled={loading || isUploading}
            className={`flex items-center gap-2 px-6 py-2.5 ${
              loading || isUploading ? "bg-slate-400" : "bg-slate-900"
            } text-white text-[10px] font-black uppercase rounded-xl shadow-lg transition-all active:scale-95`}
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {success ? "Deployed!" : isUploading ? "Uploading..." : "Deploy All Tabs"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={14} /> Storefront Live!
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 italic">
              Active Workspace
            </h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex justify-between items-center p-4 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow-xl translate-x-2"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab === "TopHeader" ? <Megaphone size={16} /> : <Layers size={16} className={activeTab === tab ? "text-white" : "text-slate-300"} />}
                    {tab}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20" : "bg-slate-100 text-slate-400"}`}>
                    {contentData[tab]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic">
              Modify {activeTab}
            </h3>
            <button
              onClick={onAddSlot}
              className="w-full flex items-center justify-center gap-3 p-5 rounded-[1.5rem] border-4 border-dashed border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-xs font-black uppercase">Add New {activeTab} Slot</span>
            </button>
          </div>
        </div>

        {/* PREVIEW CANVAS */}
        <div className="col-span-12 lg:col-span-8">
          <div className={`mx-auto bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-100 transition-all duration-700 overflow-hidden ${devicePreview === "mobile" ? "max-w-[375px]" : "max-w-full"}`}>
            <div className="h-[650px] overflow-y-auto no-scrollbar bg-white">
              <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900">
                  Pellisco {activeTab}
                </h2>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 gap-12">
                  {contentData[activeTab]?.map((slot) => {
                    const currentId = slot.id || slot._id || slot.slotId;

                    return (
                      <div key={currentId} className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 space-y-6">
                        {activeTab === "TopHeader" ? (
                          <div className="space-y-6">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Marquee Content</label>
                              <button
                                onClick={() => dispatch(updateSlotContent({ category: activeTab, id: currentId, updates: { isActive: !slot.isActive } }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${slot.isActive ? "bg-emerald-500 text-white shadow-lg" : "bg-rose-500 text-white opacity-50"}`}
                              >
                                {slot.isActive ? <><Eye size={14} /> Active</> : <><EyeOff size={14} /> Hidden</>}
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Enter scrolling announcement text..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all uppercase tracking-widest"
                              value={slot.announcement || ""}
                              onChange={(e) => dispatch(updateSlotContent({ category: activeTab, id: currentId, updates: { announcement: e.target.value } }))}
                            />
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => { setActiveSlotId(currentId); fileInputRef.current.click(); }}
                              className="h-64 w-full bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                            >
                              {isUploading && activeSlotId === currentId ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="animate-spin text-slate-400" size={32} />
                                  <p className="text-[9px] font-black uppercase text-slate-400">Uploading...</p>
                                </div>
                              ) : slot.image ? (
                                slot.image.match(/\.(mp4|webm|ogg|mov)$/) || slot.image.includes("/video/upload/") ? (
                                  <video src={slot.image} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay />
                                ) : (
                                  <img src={slot.image} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                                )
                              ) : (
                                <div className="text-center text-slate-400">
                                  <Upload size={24} className="mx-auto mb-2" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Upload Media</p>
                                </div>
                              )}
                            </div>

                            {/* UPDATED: Multiple Titles and Subtitles */}
                            <div className="grid grid-cols-1 gap-6">
                              {/* SUBTITLES SECTION */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Subtitles (Transitions)</label>
                                  <button onClick={() => addTextField(currentId, 'subtitle')} className="text-[9px] font-black text-slate-900 uppercase">+ Add</button>
                                </div>
                                {(Array.isArray(slot.subtitle) ? slot.subtitle : [slot.subtitle || ""]).map((sub, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Subtitle ${idx + 1}`}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                      value={sub}
                                      onChange={(e) => handleArrayTextChange(currentId, 'subtitle', idx, e.target.value)}
                                    />
                                    {idx > 0 && <button onClick={() => removeTextField(currentId, 'subtitle', idx)} className="text-rose-400"><X size={14}/></button>}
                                  </div>
                                ))}
                              </div>

                              {/* TITLES SECTION */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Titles (Transitions)</label>
                                  <button onClick={() => addTextField(currentId, 'title')} className="text-[9px] font-black text-slate-900 uppercase">+ Add</button>
                                </div>
                                {(Array.isArray(slot.title) ? slot.title : [slot.title || ""]).map((ttl, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Title ${idx + 1}`}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all font-serif italic"
                                      value={ttl}
                                      onChange={(e) => handleArrayTextChange(currentId, 'title', idx, e.target.value)}
                                    />
                                    {idx > 0 && <button onClick={() => removeTextField(currentId, 'title', idx)} className="text-rose-400"><X size={14}/></button>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <div className="flex gap-4 items-center">
                            <input
                              type="text"
                              placeholder="CTA"
                              className="bg-transparent border-b border-slate-200 text-[10px] uppercase font-black py-1 outline-none w-24"
                              value={slot.cta || ""}
                              onChange={(e) => dispatch(updateSlotContent({ category: activeTab, id: currentId, updates: { cta: e.target.value } }))}
                            />
                            <input
                              type="text"
                              placeholder="Link"
                              className="bg-transparent border-b border-slate-200 text-[10px] py-1 outline-none w-32"
                              value={slot.link || ""}
                              onChange={(e) => dispatch(updateSlotContent({ category: activeTab, id: currentId, updates: { link: e.target.value } }))}
                            />
                          </div>
                          <button onClick={() => onRemoveSlot(currentId)} className="p-3 bg-white text-rose-50 rounded-2xl shadow-sm hover:bg-rose-50 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PelliscoStorefront;
