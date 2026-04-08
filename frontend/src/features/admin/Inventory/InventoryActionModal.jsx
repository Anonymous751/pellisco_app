  import React, { useState, useEffect, memo } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { X, Save, Package, IndianRupee, Layers, Info, Hash, Image as ImageIcon, UploadCloud } from 'lucide-react';
  import { createAdminProduct, updateAdminProduct, clearErrors, resetStatus } from './InventorySlice/inventorySlice';
  import { toast } from 'react-toastify';

  // 1. MEMOIZED INPUT FOR SPEED
  const FormInput = memo(({ label, icon: Icon, ...props }) => (
    <div className="space-y-2 group">
      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 transition-colors group-focus-within:text-slate-900">
        {Icon && <Icon size={12} />} {label}
      </label>
      <input
        {...props}
        className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-xs font-medium outline-none transition-all focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
      />
    </div>
  ));

  const InventoryActionModal = ({ isOpen, onClose, mode, product }) => {
    const dispatch = useDispatch();
    const { loading, error, success, message } = useSelector((state) => state.inventory);

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: { mrp: '', sale: '' },
      category: '',
      stock: '',
      product_sku: ''
    });

    const [images, setImages] = useState([]); // Stores actual FILE objects
    const [imagesPreview, setImagesPreview] = useState([]); // Stores Base64 for UI

    // 2. SYNC DATA (Fixes Dropdowns and Price initialization)
    useEffect(() => {
      if (isOpen) {
        if ((mode === 'edit' || mode === 'view') && product) {
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: {
              mrp: product.price?.mrp || '',
              sale: product.price?.sale || ''
            },
            category: product.category || '', // Ensure this matches your <option> values
            stock: product.stock || 0,
            product_sku: product.product_sku || ''
          });
          setImagesPreview(product.images?.map(img => img.url) || []);
          setImages([]); // Reset file buffer
        } else {
          setFormData({ name: '', description: '', price: { mrp: '', sale: '' }, category: '', stock: '', product_sku: '' });
          setImages([]);
          setImagesPreview([]);
        }
      }
    }, [isOpen, mode, product]);

    // 3. FEEDBACK LOGIC
   // 3. FEEDBACK LOGIC
// 3. FEEDBACK LOGIC
useEffect(() => {
  if (error) {
    toast.error(error);
    dispatch(clearErrors());
  }

  // Only trigger if success is true AND we aren't loading
  if (success && !loading) {

    // CASE A: Handle Create/Edit within this modal
    if (mode === 'create' || mode === 'edit') {
      const successMsg = mode === 'create' ? "Added to Pellisco" : "Inventory Synced";
      toast.success(successMsg);

      onClose(); // Close only when an action in THIS modal succeeds
      dispatch(resetStatus());
    }

    // CASE B: Handle Delete (If triggered from elsewhere but uses same slice)
    // If the modal is open but a delete happened in the background
    if (message === "Product deleted successfully") {
       // We don't toast here; we let the Parent List handle it.
       // Or, if you want the toast here:
       // toast.success("Product Removed");
       dispatch(resetStatus());
    }
  }
}, [error, success, loading, dispatch, onClose, mode, message]);

// 4. CLEANUP ON UNMOUNT
// This is the "Safety Net" that ensures if the user just clicks 'X',
// the success flag is cleared for the next time.
useEffect(() => {
  return () => {
    dispatch(resetStatus());
  };
}, [dispatch]);

    // 4. IMAGE HANDLER (Fixes the "Not Updating" bug)
    const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setImagesPreview((prev) => [...prev, reader.result]);
            setImages((prev) => [...prev, file]); // KEY: Save the File object, not the string
          }
        };
        reader.readAsDataURL(file);
      });
    };

    // 5. SUBMIT LOGIC (Fixes Price and Image data transfer)
const handleSubmit = (e) => {
  e.preventDefault();
  if (mode === 'view') return;

  const myForm = new FormData();
  // Top-level fields
  myForm.append("name", formData.name);
  myForm.append("description", formData.description);
  myForm.append("category", formData.category);
  myForm.append("stock", formData.stock);
  myForm.append("product_sku", formData.product_sku);

  // Flat price keys (Crucial for Multer parsing)
  myForm.append("mrp", formData.price.mrp);
  myForm.append("sale", formData.price.sale);

  // Append images using the key "images"
  images.forEach((file) => {
    myForm.append("images", file);
  });

  if (mode === 'create') {
    dispatch(createAdminProduct(myForm));
  } else {
    dispatch(updateAdminProduct({ id: product._id, productData: myForm }));
  }
};

    if (!isOpen) return null;
    const isReadOnly = mode === 'view';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 transition-opacity">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* HEADER */}
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                <Package size={18} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Pellisco Vault</h2>
                <p className="text-sm font-bold text-slate-900">
                  {mode === 'create' ? 'New Ritual' : mode === 'edit' ? 'Update Details' : 'Product View'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all active:scale-90 border border-transparent hover:border-slate-100">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-8 max-h-[75vh] overflow-y-auto">

            {/* VISUALS SECTION */}
            <div className="mb-10">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                <ImageIcon size={12} /> Asset Gallery
              </label>
              <div className="flex flex-wrap gap-3">
                {imagesPreview.map((img, index) => (
                  <div key={index} className="w-20 h-20 rounded-2xl border-2 border-white shadow-md overflow-hidden transition-transform hover:scale-105">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ))}
                {!isReadOnly && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-900 transition-all group">
                    <UploadCloud size={20} className="text-slate-300 group-hover:text-slate-900" />
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormInput
                  label="Product Name"
                  icon={Info}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  readOnly={isReadOnly}
                  required
                />
              </div>

              <FormInput
                label="SKU Code"
                icon={Hash}
                value={formData.product_sku}
                onChange={(e) => setFormData({...formData, product_sku: e.target.value})}
                readOnly={isReadOnly}
              />

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1"><Layers size={12} /> Category</label>
                <select
                  disabled={isReadOnly}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-xs font-medium outline-none appearance-none"
                >
                  <option value="">Select Ritual</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Haircare">Haircare</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>

              <FormInput
                label="MRP (₹)"
                icon={IndianRupee}
                type="number"
                value={formData.price.mrp}
                onChange={(e) => setFormData({...formData, price: {...formData.price, mrp: e.target.value}})}
                readOnly={isReadOnly}
              />

              <FormInput
                label="Sale Price (₹)"
                icon={IndianRupee}
                type="number"
                value={formData.price.sale}
                onChange={(e) => setFormData({...formData, price: {...formData.price, sale: e.target.value}})}
                readOnly={isReadOnly}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Stock Level"
                  icon={Package}
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-10 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                Dismiss
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Syncing...' : <><Save size={14}/> Save Changes</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default InventoryActionModal;
