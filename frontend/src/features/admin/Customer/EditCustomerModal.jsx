import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Save, User, Shield, Activity, Mail, Phone, MapPin, Award, Camera, RefreshCcw } from 'lucide-react';
import { updateCustomerByAdmin, resetStatusFlags } from './CustomerSlice/customerSlice';

const EditCustomerModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user, loading, updateSuccess } = useSelector((state) => state.customer);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    role: '',
    tier: '',
    accountStatus: ''
  });

  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("/default-avatar.png");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        role: user.role || 'user',
        tier: user.tier || 'Brown',
        accountStatus: user.accountStatus || 'active'
      });
      setAvatarPreview(user.avatar?.url || "/default-avatar.png");
    }
  }, [user]);

  useEffect(() => {
    if (updateSuccess) {
      onClose();
      dispatch(resetStatusFlags());
    }
  }, [updateSuccess, onClose, dispatch]);

  const handleAvatarChange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (avatar !== "") {
      finalData.avatar = avatar;
    }
    dispatch(updateCustomerByAdmin({ id: user._id, userData: finalData }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="p-6 px-8 border-b flex justify-between items-center bg-primary text-white">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Edit Ritualist Profile</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Sidebar: Avatar Edit */}
          <div className="w-full md:w-64 bg-lightGray/50 p-8 flex flex-col items-center border-r border-mutedGreen/10">
            <div className="relative group">
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-32 h-32 rounded-2rem object-cover border-4 border-white shadow-xl bg-white"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2rem opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="mt-4 text-[10px] font-black text-mutedGreen uppercase tracking-widest">Change Avatar</p>
            <div className="mt-8 space-y-2 w-full">
               <div className="p-3 bg-white rounded-xl border border-mutedGreen/10">
                  <p className="text-[9px] font-bold text-mutedGreen uppercase tracking-tighter">Member Since</p>
                  <p className="text-xs font-bold text-primary">{new Date(user?.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
          </div>

          {/* Right Content: Form Fields */}
          <div className="flex-1 p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" icon={User}>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="edit-input" />
              </InputGroup>

              <InputGroup label="Email" icon={Mail}>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="edit-input" />
              </InputGroup>

              <InputGroup label="Phone" icon={Phone}>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="edit-input" />
              </InputGroup>

              <InputGroup label="Location" icon={MapPin}>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="edit-input" />
              </InputGroup>

              <InputGroup label="Tier" icon={Award}>
                <select value={formData.tier} onChange={(e) => setFormData({...formData, tier: e.target.value})} className="edit-select">
                  <option value="Brown">Brown</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </InputGroup>

              <InputGroup label="Status" icon={Activity}>
                <select value={formData.accountStatus} onChange={(e) => setFormData({...formData, accountStatus: e.target.value})} className="edit-select">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                </select>
              </InputGroup>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 px-8 bg-lightGray border-t border-mutedGreen/10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold text-mutedGreen">CANCEL</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-secondary text-white text-xs font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            <Save size={16} />
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>

      <style>{`
        .edit-input, .edit-select {
          width: 100%; background-color: #F8F9FA; border: 1px solid rgba(0,0,0,0.05); border-radius: 1rem;
          padding: 0.75rem 1rem 0.75rem 2.75rem; font-size: 0.75rem; font-weight: 700; outline: none; transition: all 0.2s;
        }
        .edit-input:focus, .edit-select:focus { background-color: white; border-color: #C5A386; box-shadow: 0 0 0 4px rgba(197,163,134,0.1); }
      `}</style>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, children }) => (
  <div className="space-y-2 relative">
    <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-mutedGreen/60 z-10"><Icon size={16} /></div>
      {children}
    </div>
  </div>
);

export default EditCustomerModal;
