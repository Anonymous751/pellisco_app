import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Phone, Shield, Lock, Eye, EyeOff, Camera, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CreateCustomerModal = ({ isOpen, onClose, onRefresh, initialData = null }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("/default_avatar.png");

  // Logic to determine if we are editing or creating
  const isEditMode = !!initialData;

  // EFFECT: Populate form when initialData changes (e.g., clicking "Edit" on Sagar)
  useEffect(() => {
    if (isEditMode && isOpen) {
      formik.setValues({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'user',
        accountStatus: initialData.accountStatus || 'active',
        password: '', // Keep password empty during edits for security
        avatar: initialData.avatar?.url || '',
      });
      setAvatarPreview(initialData.avatar?.url || "/default_avatar.png");
    } else if (!isOpen) {
      // Reset when modal closes
      formik.resetForm();
      setAvatarPreview("/default_avatar.png");
    }
  }, [initialData, isOpen]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .transform(value => value.trim())
      .min(3, 'Name must be at least 3 characters')
      .max(25, 'Name cannot exceed 25 characters')
      .required('Full name is required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .lowercase()
      .required('Email address is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Requires at least one uppercase letter')
      .matches(/[a-z]/, 'Requires at least one lowercase letter')
      .matches(/[0-9]/, 'Requires at least one number')
      .matches(/[@$!%*?&#]/, 'Requires at least one special character')
      // Password only required if creating a NEW user
      .when([], {
        is: () => !isEditMode,
        then: (schema) => schema.required('Password is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
      .required('Phone number is required'),
    role: Yup.string()
      .oneOf(['user', 'admin'])
      .required('Role is required'),
    accountStatus: Yup.string()
      .oneOf(['active', 'blocked', 'suspended'])
      .required('Status is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      accountStatus: 'active',
      avatar: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // DYNAMIC ENDPOINT: Register if new, Update if ID exists
        const endpoint = isEditMode
          ? `/api/v1/admin/user/${initialData._id}`
          : '/api/v1/auth/register';

        const method = isEditMode ? 'put' : 'post';

        const { data } = await axios[method](endpoint, values);

        if (data.success) {
          toast.success(isEditMode ? "Profile Updated Successfully" : "Ritualist Profile Created Successfully");
          onRefresh();
          onClose();
          resetForm();
          setAvatarPreview("/default_avatar.png");
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Internal Server Error";
        toast.error(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAvatarChange = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    if (file) {
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          formik.setFieldValue("avatar", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const getError = (name) => {
    const meta = formik.getFieldMeta(name);
    return meta.touched && meta.error ? (
      <div className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter italic animate-in fade-in slide-in-from-top-1">
        {meta.error}
      </div>
    ) : null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-auto border border-white/20">

        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-lg shadow-sm">
              {isEditMode ? <UserCheck size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight">
                {isEditMode ? `Edit ${initialData.name}` : "Add New Ritualist"}
              </h2>
              <p className="text-[10px] text-mutedGreen font-medium uppercase tracking-wider">Pellisco Admin Suite</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-mutedGreen hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-8 space-y-5">

          {/* AVATAR UPLOAD SECTION */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-secondary/30 overflow-hidden bg-lightGray flex items-center justify-center shadow-inner">
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-secondary transition-colors border-2 border-white">
                <Camera size={12} />
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-[9px] font-bold text-mutedGreen uppercase tracking-widest">
                {isEditMode ? "Change Profile Image" : "Upload Profile Image"}
            </p>
          </div>

          {/* FULL NAME */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest">Full Name</label>
            <input
              {...formik.getFieldProps('name')}
              className={`w-full p-3 bg-lightGray rounded-xl text-xs outline-none border transition-all ${formik.touched.name && formik.errors.name ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:ring-2 focus:ring-secondary/10 focus:bg-white'}`}
              placeholder="e.g. Amara Okoro"
            />
            {getError('name')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedGreen" size={14} />
                <input
                  {...formik.getFieldProps('email')}
                  className={`w-full p-3 pl-10 bg-lightGray border rounded-xl text-xs outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-transparent focus:ring-2 focus:ring-secondary/20 focus:bg-white'}`}
                  placeholder="amara@style.com"
                />
              </div>
              {getError('email')}
            </div>

            {/* PHONE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedGreen" size={14} />
                <input
                  {...formik.getFieldProps('phone')}
                  className={`w-full p-3 pl-10 bg-lightGray border rounded-xl text-xs outline-none transition-all ${formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-transparent focus:ring-2 focus:ring-secondary/20 focus:bg-white'}`}
                  placeholder="10 digit mobile"
                />
              </div>
              {getError('phone')}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest flex justify-between">
              {isEditMode ? "Change Password (Optional)" : "Secure Password"}
              <span className="text-[8px] font-normal italic lowercase tracking-normal">A-z, 0-9, & symbols</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedGreen" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                {...formik.getFieldProps('password')}
                className={`w-full p-3 pl-10 pr-10 bg-lightGray border rounded-xl text-xs outline-none transition-all ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-transparent focus:ring-2 focus:ring-secondary/20 focus:bg-white'}`}
                placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedGreen hover:text-primary transition-colors">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {getError('password')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest">Access Role</label>
              <select {...formik.getFieldProps('role')} className="w-full p-3 bg-lightGray border border-transparent rounded-xl text-xs outline-none focus:ring-2 focus:ring-secondary/10 cursor-pointer appearance-none">
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-mutedGreen uppercase tracking-widest">Account Status</label>
              <select {...formik.getFieldProps('accountStatus')} className="w-full p-3 bg-lightGray border border-transparent rounded-xl text-xs outline-none focus:ring-2 focus:ring-secondary/10 cursor-pointer appearance-none">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-6 border-t border-gray-50 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 border border-mutedGreen/30 rounded-xl text-xs font-bold text-primary hover:bg-gray-50 transition-all active:scale-95">
              CANCEL
            </button>
            <button type="submit" disabled={formik.isSubmitting} className="flex-[2] py-3.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
              {formik.isSubmitting ? "PROCESSING..." : isEditMode ? "UPDATE PROFILE" : "CREATE CUSTOMER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
