import React, { useEffect, useState } from "react";
import {
  X,
  Box,
  IndianRupee,
  Beaker,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Loader2,
  Sparkles,
  ChevronDown,
  Ruler,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";

const CATEGORY_MAP = {
  "skin-care": ["Cleanser", "Toner", "Moisturizer", "Sunscreen"],
  "hair-care": ["Shampoo", "Conditioner", "Hair Mask", "Serum"],
  treatments: ["Facial Kits", "Peel off Mask", "Professional Serum"],
};

const CreateInventoryModal = ({ isOpen, onClose, onRefresh }) => {
  const [previews, setPreviews] = useState([]);

  const autoDetectFromText = (text) => {
    const input = text.toLowerCase();
    const skinKeywords = [
      "cleanser",
      "toner",
      "face",
      "skin",
      "moisturizer",
      "sunscreen",
    ];
    const hairKeywords = ["shampoo", "conditioner", "hair", "scalp", "oil"];
    if (skinKeywords.some((key) => input.includes(key))) return "skin-care";
    if (hairKeywords.some((key) => input.includes(key))) return "hair-care";
    return "treatments";
  };

  const generateSlugAndSKU = (name) => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return {
      slug: `${base}-${randomSuffix}`,
      sku: `PELL-${base.slice(0, 3).toUpperCase()}-${randomSuffix}`,
    };
  };

  const validationSchema = Yup.object({
    name: Yup.string().max(200, "Max 200 chars").required("Name required"),
    brand: Yup.string().max(120, "Too long").required("Brand required"),
    description: Yup.string()
      .min(10, "Too short")
      .max(5000, "Max 5000 chars")
      .required("Required"),
    mainCategory: Yup.string().required("Required"),
    category: Yup.string().required("Required"),
    price: Yup.object({
      mrp: Yup.number()
        .typeError("Must be a number")
        .positive("Must be > 0")
        .required("Required"),
      sale: Yup.number()
        .typeError("Must be a number")
        .positive("Must be > 0")
        .required("Required")
        .test("sale-mrp", "Sale ≤ MRP", function (val) {
          return val <= this.parent.mrp;
        }),
    }),
    stock: Yup.number()
      .typeError("Number required")
      .min(0, "Min 0")
      .required("Required"),
    weight: Yup.number()
      .typeError("Number required")
      .min(0, "Min 0")
      .required("Required"),
    dimensions: Yup.object({
      length: Yup.number().typeError("Req").min(0).required("Req"),
      width: Yup.number().typeError("Req").min(0).required("Req"),
      height: Yup.number().typeError("Req").min(0).required("Req"),
    }),
    ingredients: Yup.string().max(3000).required("Required"),
    usage: Yup.string().max(3000).required("Required"),
    images: Yup.array().min(1, "Add at least 1 image").max(3),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      brand: "Pellisco",
      slug: "",
      product_sku: "",
      description: "",
      mainCategory: "skin-care",
      category: "cleanser",
      price: { mrp: "", sale: "", offer: "" },
      stock: "",
      weight: "",
      dimensions: { length: 1, width: 1, height: 1 }, // Defaulted to 1 to prevent block
      ingredients: "",
      usage: "",
      status: "available",
      isFeatured: false,
      images: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        // Append basic fields
        Object.keys(values).forEach((key) => {
          if (!["images", "price", "dimensions"].includes(key)) {
            formData.append(key, values[key]);
          }
        });

        formData.append("price", JSON.stringify(values.price));
        formData.append("dimensions", JSON.stringify(values.dimensions));
        values.images.forEach((file) => formData.append("images", file));

        const { data } = await axios.post("/api/v1/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.success) {
          toast.success(`${values.name} cataloged!`);
          onRefresh();
          onClose();
          formik.resetForm();
          setPreviews([]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Submission failed");
      }
    },
  });

  // This triggers a toast if the admin tries to submit with errors
  const handleAttemptSubmit = () => {
    if (!formik.isValid) {
      toast.error("Please fix the errors in the form first.");
      console.log("Validation Errors:", formik.errors);
    }
  };

  useEffect(() => {
    if (formik.values.name) {
      const { slug, sku } = generateSlugAndSKU(formik.values.name);
      formik.setFieldValue("slug", slug);
      formik.setFieldValue("product_sku", sku);
      const detectedMain = autoDetectFromText(formik.values.name);
      if (detectedMain !== formik.values.mainCategory) {
        formik.setFieldValue("mainCategory", detectedMain);
        formik.setFieldValue(
          "category",
          CATEGORY_MAP[detectedMain][0].toLowerCase().replace(/\s+/g, "-")
        );
      }
    }
  }, [formik.values.name]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (formik.values.images.length + files.length > 3)
      return toast.warn("Max 3 images allowed");
    formik.setFieldValue("images", [...formik.values.images, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const renderError = (path) => {
    const error = path
      .split(".")
      .reduce((obj, key) => obj?.[key], formik.errors);
    const touched = path
      .split(".")
      .reduce((obj, key) => obj?.[key], formik.touched);
    return (touched || formik.submitCount > 0) && error ? (
      <span className="text-[9px] text-red-500 font-black ml-1 uppercase animate-pulse">
        ({error})
      </span>
    ) : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* HEADER */}
        <div className="px-10 py-6 border-b flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
              <Box size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                New Pellisco Ritual
              </h2>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                Product Catalog System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <FormikProvider value={formik}>
          <form
            onSubmit={formik.handleSubmit}
            className="px-10 py-8 overflow-y-auto space-y-8 custom-scrollbar bg-white"
          >
            {/* 1. BASIC INFO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Identity & Branding
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="label-style">
                    Product Name* {renderError("name")}
                  </label>
                  <input
                    {...formik.getFieldProps("name")}
                    className="input-style"
                    placeholder="e.g. Saffron Glow Cleanser"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label-style">Brand Identifier</label>
                  <input
                    {...formik.getFieldProps("brand")}
                    className="input-style font-bold text-slate-400 bg-slate-50 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-2xl border-2 border-dashed border-slate-100">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Auto-SKU
                  </label>
                  <p className="text-xs font-mono font-bold text-slate-600">
                    {formik.values.product_sku || "---"}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Web Slug
                  </label>
                  <p className="text-xs font-mono font-bold text-slate-600">
                    {formik.values.slug || "---"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. CATEGORIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-50">
              <div className="space-y-1">
                <label className="label-style text-blue-600">
                  Main Category*
                </label>
                <div className="relative">
                  <select
                    value={formik.values.mainCategory}
                    onChange={(e) => {
                      const main = e.target.value;
                      formik.setFieldValue("mainCategory", main);
                      formik.setFieldValue(
                        "category",
                        CATEGORY_MAP[main][0].toLowerCase().replace(/\s+/g, "-")
                      );
                    }}
                    className="input-style appearance-none pr-10 border-blue-50 bg-blue-50/20"
                  >
                    <option value="skin-care">Skin Care</option>
                    <option value="hair-care">Hair Care</option>
                    <option value="treatments">Treatments</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label-style text-purple-600">
                  Sub-Category* {renderError("category")}
                </label>
                <div className="relative">
                  <select
                    {...formik.getFieldProps("category")}
                    className="input-style appearance-none pr-10 border-purple-50 bg-purple-50/20"
                  >
                    {CATEGORY_MAP[formik.values.mainCategory].map((cat) => (
                      <option
                        key={cat}
                        value={cat.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label-style">Inventory Status*</label>
                <select
                  {...formik.getFieldProps("status")}
                  className="input-style uppercase font-black text-[10px] tracking-widest"
                >
                  <option value="available">Available</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* 3. PRICING & LOGISTICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-2">
                  <IndianRupee size={12} /> Commercials
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-style">
                      MRP (₹)* {renderError("price.mrp")}
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps("price.mrp")}
                      className="input-style !bg-white border-emerald-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="label-style">
                      Sale Price (₹)* {renderError("price.sale")}
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps("price.sale")}
                      className="input-style !bg-white border-emerald-200"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <Ruler size={12} /> Physical Specs
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">
                      Stock*
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps("stock")}
                      className="input-style !p-2 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">
                      Weight(g)*
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps("weight")}
                      className="input-style !p-2 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">
                      H(cm)*
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps("dimensions.height")}
                      className="input-style !p-2 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. TEXT AREAS */}
            <div className="space-y-1 pt-4">
              <label className="label-style">
                The Ritual Story (Description)* {renderError("description")}
              </label>
              <textarea
                {...formik.getFieldProps("description")}
                rows="3"
                className="input-style !rounded-2xl"
                placeholder="Describe the soul of this product..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label-style flex items-center gap-2">
                  <Beaker size={14} className="text-purple-400" /> Key
                  Ingredients* {renderError("ingredients")}
                </label>
                <textarea
                  {...formik.getFieldProps("ingredients")}
                  className="input-style !h-32 !rounded-2xl"
                  placeholder="List active ingredients..."
                />
              </div>
              <div className="space-y-1">
                <label className="label-style flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" /> Usage
                  Ritual* {renderError("usage")}
                </label>
                <textarea
                  {...formik.getFieldProps("usage")}
                  className="input-style !h-32 !rounded-2xl"
                  placeholder="How to use for best results..."
                />
              </div>
            </div>

            {/* 5. IMAGES */}
            <div className="space-y-4 pt-8 border-t border-slate-50">
              <label className="label-style flex items-center justify-between">
                <span>Product Gallery (1-3 Images)*</span>
                {renderError("images")}
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="w-28 h-28 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group shrink-0">
                  <UploadCloud
                    size={28}
                    className="text-slate-300 group-hover:text-slate-400 transition-colors"
                  />
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    Upload
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
                {previews.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-slate-100 group shrink-0 shadow-sm"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImgs = formik.values.images.filter(
                          (_, idx) => idx !== i
                        );
                        formik.setFieldValue("images", newImgs);
                        setPreviews(previews.filter((_, idx) => idx !== i));
                      }}
                      className="absolute inset-0 bg-red-500/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex justify-end items-center gap-8 pt-10 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                onClick={handleAttemptSubmit}
                disabled={formik.isSubmitting}
                className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 flex items-center gap-4 shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>Catalog Ritual Product</>
                )}
              </button>
            </div>
          </form>
        </FormikProvider>
      </div>

      <style>{`
        .label-style {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 4px;
        }
        .input-style {
          width: 100%;
          padding: 1rem 1.25rem;
          background: #ffffff;
          border: 2px solid #f8fafc;
          border-radius: 1rem;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-style:focus {
          border-color: #e2e8f0;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .input-style::placeholder {
          color: #cbd5e1;
          font-weight: 500;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default CreateInventoryModal;
