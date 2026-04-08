import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Chrome, Facebook, ArrowRight, ShieldCheck, UserPlus,
  Fingerprint, Eye, EyeOff, Loader2, HelpCircle
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearErrors, clearMessage, loginUser, resendOTP } from './authSlice';

const LoginSchema = Yup.object().shape({
  identifier: Yup.string()
    .required('Email or Phone is required')
    .test('is-email-or-phone', 'Enter valid email or 10-digit phone', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10,15}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  loginMethod: Yup.string(),
  password: Yup.string().when('loginMethod', {
    is: 'password',
    then: () => Yup.string().required('Password is required').min(8, 'Min 8 characters'),
  }),
  otp: Yup.string().when('loginMethod', {
    is: 'otp',
    then: () => Yup.string().matches(/^[0-9]{6}$/, 'Must be 6 digits').required('OTP required'),
  }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, message, user, requires2FA } = useSelector((state) => state.auth);

  // --- TIMER LOGIC (Corrected to 1000ms) ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 25);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
      setTimer(0);
    }

    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }

    // --- 2FA INTERCEPT ---
    if (requires2FA) {
      // Navigate to the 2FA verification page you'll build next
      navigate('/login-2fa');
      return;
    }

    // --- FINAL AUTH NAVIGATION ---
    if (isAuthenticated && user && !requires2FA) {
      const path = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(path);
    }
  }, [error, isAuthenticated, requires2FA, message, user, dispatch, navigate]);

  const handleRequestOTP = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!identifier || !emailRegex.test(identifier)) {
      return toast.warn("Please enter a valid email for OTP login");
    }

    setTimer(60);
    dispatch(resendOTP({ email: identifier }));
  };

  // Reusable Input Component
  const FloatingInput = ({ label, name, type = "text", isPassword, error, touched }) => (
    <div className="mb-5">
      <div className="relative">
        <Field
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`peer block px-4 pb-2.5 pt-6 w-full text-[var(--color-darkGray)] bg-[var(--color-accent)]/20 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/5
            ${touched && error ? 'border-[var(--color-danger)]' : 'border-[var(--color-mutedGreen)]/30 focus:border-[var(--color-secondary)]'}`}
          placeholder=" "
        />
        <label className="absolute text-[10px] uppercase tracking-[0.2em] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none font-black text-gray-400 peer-focus:text-[var(--color-secondary)]">
          {label}
        </label>
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-secondary)]">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <div className="h-4 mt-1 ml-2">
        <ErrorMessage name={name} component="p" className="text-[9px] text-[var(--color-danger)] font-black uppercase tracking-widest animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-lightGray)] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[var(--color-accent)] flex flex-col md:flex-row">

        {/* FORM SIDE */}
        <div className="flex-[1.3] p-8 md:p-14">
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[var(--color-secondary)]/10 rounded-2xl">
                <Fingerprint className="text-[var(--color-secondary)]" size={36} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter italic leading-none">
                <span className="text-[var(--color-primary)]">Pellisco</span>
                <span className="block text-[var(--color-secondary)] not-italic font-light tracking-[0.1em] text-sm uppercase">Professionals</span>
              </h1>
            </div>
            <p className="text-[var(--color-darkGray)]/40 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Authorized Access Only</p>
          </header>

          <Formik
            initialValues={{ identifier: '', password: '', otp: '', loginMethod: 'password' }}
            validationSchema={LoginSchema}
            onSubmit={(values) => {
              const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.identifier);
              const payload = {
                [isEmail ? 'email' : 'phone']: values.identifier,
                ...(values.loginMethod === 'password' ? { password: values.password } : { otp: values.otp }),
                method: values.loginMethod
              };
              dispatch(loginUser(payload));
            }}
          >
            {({ values, errors, touched, setFieldValue }) => {
              const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.identifier);

              return (
                <Form noValidate>
                  <FloatingInput label="Email or Phone" name="identifier" error={errors.identifier} touched={touched.identifier} />

                  {isEmail && (
                    <div className="flex p-1 bg-[var(--color-accent)]/40 rounded-xl mb-6 border border-[var(--color-mutedGreen)]/10">
                      {['password', 'otp'].map(m => (
                        <button
                          key={m} type="button"
                          onClick={() => setFieldValue('loginMethod', m)}
                          className={`flex-1 py-2 text-[9px] font-black tracking-[0.2em] rounded-lg transition-all ${values.loginMethod === m ? 'bg-white text-[var(--color-primary)] shadow-md' : 'text-gray-400 opacity-60 hover:text-[var(--color-secondary)]'}`}
                        >
                          {m.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}

                  {values.loginMethod === 'password' ? (
                    <>
                      <FloatingInput label="Strong Password" name="password" isPassword error={errors.password} touched={touched.password} />
                      <div className="flex justify-end -mt-3 mb-6 px-2">
                        <NavLink to="/password/forgot" className="text-[9px] font-black text-gray-400 hover:text-[var(--color-secondary)] uppercase tracking-widest transition-colors flex items-center gap-1.5">
                          <HelpCircle size={12} /> Recovery Access?
                        </NavLink>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <FloatingInput label="6-Digit OTP" name="otp" error={errors.otp} touched={touched.otp} />
                      <button
                        type="button"
                        onClick={() => handleRequestOTP(values.identifier)}
                        className="absolute right-4 top-[1.1rem] text-[9px] font-black text-[var(--color-secondary)] uppercase tracking-tighter hover:opacity-70 disabled:opacity-30 z-20"
                        disabled={loading || timer > 0}
                      >
                        {timer > 0 ? `Retry in ${timer}s` : 'Get Code'}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full bg-[var(--color-primary)] text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95 shadow-xl mt-4 disabled:opacity-70"
                  >
                    <div className="absolute inset-0 bg-[var(--color-secondary)] -translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <>Secure Entry <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                    </span>
                  </button>

                  <div className="mt-8 text-center">
                    <NavLink to="/sign-up" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[var(--color-secondary)] group">
                      <UserPlus size={14} />
                      New here? <span className="text-[var(--color-primary)] group-hover:underline underline-offset-4 decoration-2">Create Profile</span>
                    </NavLink>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>

        {/* SOCIAL SIDE */}
        <div className="w-full md:w-[340px] bg-[var(--color-accent)]/10 p-8 md:p-14 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-[var(--color-accent)]">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-black text-[var(--color-mutedGreen)] uppercase tracking-[0.4em] mb-3">Quick Link</p>
            <div className="h-0.5 w-10 bg-[var(--color-secondary)] mx-auto rounded-full opacity-30" />
          </div>
          <div className="space-y-5 w-full">
  {[
    { Icon: Chrome, label: 'Google', color: '#ea4335', href: "http://localhost:1551/api/v1/google" },
    { Icon: Facebook, label: 'Facebook', color: '#1877f2', href: '#' }
  ].map(({ Icon, label, color, href }) => (
    <a
      key={label}
      href={href} // This triggers the backend route we just created
      className="w-full h-14 bg-white border border-mutedGreen)]/20 rounded-2xl flex items-center px-6 gap-4 font-black text-[10px] uppercase tracking-widest text-darkGray)] transition-all hover:shadow-lg group no-underline"
    >
      <Icon size={20} color={color} /> {label}
    </a>
  ))}
</div>
          <div className="mt-auto pt-10 flex flex-col items-center gap-3">
            <ShieldCheck size={28} className="text-[var(--color-mutedGreen)]" />
            <span className="text-[8px] font-black text-[var(--color-mutedGreen)] uppercase tracking-[0.3em] text-center leading-relaxed">
              Global Security<br/>AES-256 Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
