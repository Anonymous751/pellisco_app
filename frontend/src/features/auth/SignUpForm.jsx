  import React, { useState, useEffect } from 'react';
  import { Formik, Form, Field, ErrorMessage } from 'formik';
  import * as Yup from 'yup';
  // Added Loader2 for the loading spinner
  import { Chrome, Facebook, ArrowRight, ShieldCheck, UserPlus, Eye, EyeOff, Mail, Phone, User, Camera, Loader2 } from 'lucide-react';
  import { NavLink, useNavigate } from 'react-router-dom';
  import { useDispatch, useSelector } from 'react-redux';
  import { toast } from 'react-toastify';
  import { clearErrors, registerUser, resetRegistration } from './authSlice';

  const SignUpSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Name should be at least 3 characters')
      .max(25, 'Name cannot exceed 25 characters')
      .required('Full Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Minimum 8 characters')
      .matches(/[a-z]/, 'Include lowercase')
      .matches(/[A-Z]/, 'Include uppercase')
      .matches(/[0-9]/, 'Include a number')
      .matches(/[@$!%*?&]/, 'Include special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const SignUpForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [emailForNav, setEmailForNav] = useState("");

    // --- NEW IMAGE STATES ---
    const [avatar, setAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, isAuthenticated, isRegistered } = useSelector((state) => state.auth);

    useEffect(() => {
      if (error) {
        toast.error(error);
        dispatch(clearErrors());
      }

      if (isRegistered) {
        toast.success("OTP sent to your email!");
        const targetEmail = emailForNav || localStorage.getItem('userEmail');
        navigate("/verify-email", {
          state: { email: targetEmail },
          replace: true
        });
        dispatch(resetRegistration());
      }
    }, [error, isRegistered, dispatch, navigate, emailForNav]);

    // --- NEW IMAGE HANDLER ---
    const handleImageChange = (e) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    };

    const FloatingInput = ({ label, name, type = "text", error, touched, icon: Icon, isPassword }) => (
      <div className="mb-4">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors">
            {Icon && <Icon size={18} />}
          </div>
          <Field
            name={name}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            id={name}
            className={`peer block w-full pl-12 pr-4 pb-2.5 pt-6 text-[var(--color-darkGray)] bg-[var(--color-accent)]/20 rounded-2xl border appearance-none focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/5 transition-all duration-300
              ${touched && error
                ? 'border-[var(--color-danger)] shadow-[0_0_0_1px_var(--color-danger)]'
                : 'border-[var(--color-mutedGreen)]/30 focus:border-[var(--color-secondary)]'}`}
            placeholder=" "
          />
          <label htmlFor={name} className={`absolute text-[9px] uppercase tracking-[0.2em] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-12 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none font-black
              ${touched && error ? 'text-[var(--color-danger)]' : 'text-gray-400 peer-focus:text-[var(--color-secondary)]'}`}>
            {label}
          </label>

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-secondary)] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        <div className="h-4 mt-1 ml-12">
          <ErrorMessage name={name} component="p" className="text-[8px] text-[var(--color-danger)] font-black uppercase tracking-widest animate-pulse" />
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-[var(--color-lightGray)] flex items-center justify-center p-4 md:p-8 font-sans">
        <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl shadow-[var(--color-mutedGreen)]/20 overflow-hidden border border-[var(--color-accent)] flex flex-col md:row-reverse md:flex-row transition-all duration-500">

          {/* LEFT COLUMN: SOCIAL & INFO */}
          <div className="w-full md:w-[340px] bg-[var(--color-accent)]/10 p-8 md:p-14 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-[var(--color-accent)]">
            <div className="mb-10 text-center">
              <p className="text-[10px] font-black text-[var(--color-mutedGreen)] uppercase tracking-[0.4em] mb-3">One Tap Join</p>
              <div className="h-0.5 w-10 bg-[var(--color-secondary)] mx-auto rounded-full opacity-30" />
            </div>

            <div className="space-y-4 w-full">
              <button type="button" className="w-full h-14 bg-white border border-[var(--color-mutedGreen)]/20 rounded-2xl flex items-center px-6 gap-4 font-black text-[10px] uppercase tracking-widest text-[var(--color-darkGray)] transition-all hover:border-[#ea4335] hover:text-[#ea4335] hover:shadow-xl hover:shadow-[#ea4335]/10 group cursor-pointer">
                <Chrome size={20} className="group-hover:rotate-[15deg] transition-transform" />
                Google
              </button>
              <button type="button" className="w-full h-14 bg-white border border-[var(--color-mutedGreen)]/20 rounded-2xl flex items-center px-6 gap-4 font-black text-[10px] uppercase tracking-widest text-[var(--color-darkGray)] transition-all hover:border-[#1877f2] hover:text-[#1877f2] hover:shadow-xl hover:shadow-[#1877f2]/10 group cursor-pointer">
                <Facebook size={20} className="group-hover:rotate-[-15deg] transition-transform" />
                Facebook
              </button>
            </div>

            <div className="mt-12 p-6 bg-white/50 rounded-3xl border border-dashed border-[var(--color-mutedGreen)]/30 text-center">
              <ShieldCheck size={32} className="text-[var(--color-secondary)] mx-auto mb-3" />
              <p className="text-[9px] font-black text-[var(--color-darkGray)] uppercase tracking-wider leading-relaxed">
                Your data is encrypted with<br/>industry standard AES-256
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="flex-[1.5] p-8 md:p-14">
            <header className="mb-8 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[var(--color-primary)] rounded-xl">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter italic">
                    <span className="text-[var(--color-primary)]">Join</span>
                    <span className="text-[var(--color-secondary)] not-italic ml-1">Pellisco</span>
                  </h1>
                </div>
                <p className="text-[var(--color-darkGray)]/40 text-[9px] font-black uppercase tracking-[0.4em]">Create Your Professional Profile</p>
              </div>
            </header>

            <Formik
              initialValues={{ name: '', email: '', phone: '', password: '', confirmPassword: '' }}
              validationSchema={SignUpSchema}
              onSubmit={(values) => {
                setEmailForNav(values.email);
                localStorage.setItem('userEmail', values.email);
                // --- INJECT AVATAR DATA INTO DISPATCH ---
                dispatch(registerUser({ ...values, image: avatar }));
              }}
            >
              {({ errors, touched }) => (
                <Form noValidate className="grid grid-cols-1 md:grid-cols-2 gap-x-6">

                  {/* --- AVATAR UPLOAD SECTION --- */}
                  <div className="md:col-span-2 flex items-center gap-6 mb-8 p-4 bg-[var(--color-accent)]/10 rounded-3xl border border-dashed border-[var(--color-mutedGreen)]/20">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[var(--color-secondary)] overflow-hidden shadow-lg shadow-[var(--color-secondary)]/10">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <User size={32} />
                          </div>
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-2 bg-[var(--color-secondary)] text-white rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-lg">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">Profile Photo</h3>
                      <p className="text-[8px] text-gray-400 uppercase tracking-tighter mt-1">Recommended: Square PNG/JPG</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <FloatingInput label="Full Name" name="name" icon={User} error={errors.name} touched={touched.name} />
                  </div>

                  <FloatingInput label="Email Address" name="email" type="email" icon={Mail} error={errors.email} touched={touched.email} />
                  <FloatingInput label="Phone Number" name="phone" icon={Phone} error={errors.phone} touched={touched.phone} />

                  <FloatingInput label="Password" name="password" isPassword icon={ShieldCheck} error={errors.password} touched={touched.password} />
                  <FloatingInput label="Confirm" name="confirmPassword" isPassword icon={ShieldCheck} error={errors.confirmPassword} touched={touched.confirmPassword} />

                  <div className="md:col-span-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full bg-[var(--color-primary)] text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95 shadow-xl shadow-[var(--color-primary)]/10 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-[var(--color-secondary)] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>

                    <div className="mt-8 text-center">
                      <NavLink to="/login" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[var(--color-secondary)] transition-all cursor-pointer">
                        Already a member? <span className="text-[var(--color-primary)] underline underline-offset-4 decoration-2 ml-1">Sign In</span>
                      </NavLink>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    );
  };

  export default SignUpForm;
