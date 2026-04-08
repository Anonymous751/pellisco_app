import React, { useEffect, useState } from 'react'; // Added useState
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Lock, Loader2, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react'; // Added Eye icons
import { resetPassword, clearErrors, clearMessage } from './authSlice';

// --- UPDATED VALIDATION SCHEMA ---
const ResetSchema = Yup.object().shape({
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

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state) => state.auth);

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (message) {
      toast.success("Security Updated. Please Login.");
      dispatch(clearMessage());
      navigate('/login');
    }
  }, [error, message, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-[var(--color-lightGray)] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-[var(--color-accent)] overflow-hidden">
        <div className="p-8 md:p-12 text-center">
          <div className="inline-flex p-4 bg-[var(--color-secondary)]/10 rounded-3xl mb-6 text-[var(--color-secondary)]">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-primary)] uppercase tracking-tighter mb-8">
            Define New Credentials
          </h1>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={ResetSchema}
            onSubmit={(values) => {
              dispatch(resetPassword({ token, passwords: values }));
            }}
          >
            {({ errors, touched }) => (
              <Form className="space-y-5 text-left">
                {/* PASSWORD FIELD */}
                <div className="relative">
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"} // Dynamic Type
                      placeholder="New Password"
                      className={`w-full px-5 pr-12 h-14 bg-[var(--color-accent)]/20 rounded-2xl border outline-none transition-all ${
                        touched.password && errors.password
                          ? 'border-red-500'
                          : 'border-[var(--color-mutedGreen)]/30 focus:border-[var(--color-secondary)]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-secondary)] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-[9px] text-red-500 font-black mt-1 ml-2 uppercase" />
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative">
                  <div className="relative">
                    <Field
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"} // Dynamic Type
                      placeholder="Confirm New Password"
                      className={`w-full px-5 pr-12 h-14 bg-[var(--color-accent)]/20 rounded-2xl border outline-none transition-all ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-500'
                          : 'border-[var(--color-mutedGreen)]/30 focus:border-[var(--color-secondary)]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-secondary)] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="p" className="text-[9px] text-red-500 font-black mt-1 ml-2 uppercase" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-primary)] text-white h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--color-secondary)] transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
