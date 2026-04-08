import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Mail, ArrowLeft, Loader2,
  SendHorizontal, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearErrors, clearMessage, forgotPassword } from './authSlice';

// Validation Schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid professional email address')
    .required('Recovery email is required'),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleSubmit = (values) => {
    dispatch(forgotPassword(values.email));
  };

  return (
    <div className="min-h-screen bg-[var(--color-lightGray)] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-[var(--color-accent)] overflow-hidden relative">

        {/* TOP ACCENT BAR */}
        <div className="h-2 w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-mutedGreen)]" />

        <div className="p-8 md:p-12">
          {/* HEADER */}
          <header className="text-center mb-10">
            <div className="inline-flex p-4 bg-[var(--color-accent)]/30 rounded-3xl mb-6 text-[var(--color-secondary)]">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-[var(--color-primary)] tracking-tighter uppercase mb-2">
              Access Recovery
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Enter your verified email to receive a<br/>secure reset synchronization link.
            </p>
          </header>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                {/* EMAIL FIELD */}
                <div className="relative">
                  <div className="relative">
                    <Field
                      name="email"
                      type="email"
                      className={`peer block px-4 pb-2.5 pt-6 w-full text-[var(--color-darkGray)] bg-[var(--color-accent)]/20 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/5
                        ${touched.email && errors.email ? 'border-[var(--color-danger)]' : 'border-[var(--color-mutedGreen)]/30 focus:border-[var(--color-secondary)]'}`}
                      placeholder=" "
                    />
                    <label className="absolute text-[10px] uppercase tracking-[0.2em] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none font-black text-gray-400 peer-focus:text-[var(--color-secondary)]">
                      Professional Email
                    </label>
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  </div>
                  <div className="h-4 mt-1 ml-2">
                    <ErrorMessage name="email" component="p" className="text-[9px] text-[var(--color-danger)] font-black uppercase tracking-widest animate-pulse" />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-[var(--color-primary)] text-white h-14 rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95 shadow-xl shadow-[var(--color-primary)]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-[var(--color-secondary)] -translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <SendHorizontal size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </Form>
            )}
          </Formik>

          {/* FOOTER NAVIGATION */}
          <div className="mt-12 pt-8 border-t border-[var(--color-accent)] flex flex-col items-center gap-4">
            <NavLink
              to="/login"
              className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Security Gate
            </NavLink>

            <div className="flex items-center gap-2 opacity-30">
              <CheckCircle2 size={12} className="text-[var(--color-mutedGreen)]" />
              <span className="text-[8px] font-black text-[var(--color-darkGray)] uppercase tracking-widest">
                Pellisco ID Protection
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
