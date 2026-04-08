import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail, clearErrors, resetVerification, resendOTP, clearMessage } from './authSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false); // Local state for resend loading
  const inputRefs = useRef([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem('userEmail') || "your registered email";
  const { loading, error, isVerified, message } = useSelector((state) => state.auth);

  // Timer Logic
  useEffect(() => {
    let interval = timer > 0 && setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP pasting
  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").trim();
    if (data.length === 6 && !isNaN(data)) {
      setOtp(data.split(""));
      inputRefs.current[5].focus();
    }
  };

  // Handle Individual Input Change
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace Navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Resend OTP Action
  const handleResend = async () => {
    if (timer === 0) {
      setIsResending(true);
      await dispatch(resendOTP(email));
      setIsResending(false);
      setTimer(60);
    }
  };

  // Final Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      return toast.error("Please enter the full 6-digit code");
    }
    dispatch(verifyEmail({ email, otp: otpString }));
  };

  // Listen for Success, Errors, and Messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (message) {
      toast.info(message);
      dispatch(clearMessage());
    }

    if (isVerified) {
      toast.success("Identity Confirmed Successfully");
      localStorage.removeItem('userEmail');
      navigate('/login');
      dispatch(resetVerification());
    }
  }, [error, isVerified, message, navigate, dispatch]);

  return (
    <div className="h-screen w-full bg-lightGray flex items-center justify-center p-6 overflow-hidden selection:bg-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full max-w-[480px] bg-white border border-accent flex flex-col justify-between p-10 md:p-14 rounded-sm shadow-sm"
      >
        <div className="space-y-12">
          <header className="space-y-6">
            <div className="w-12 h-12 bg-lightGray rounded-full flex items-center justify-center border border-accent">
              <ShieldCheck size={22} strokeWidth={1.2} className="text-secondary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-serif italic text-primary leading-tight tracking-tight">
                Verify Identity
              </h1>
              <p className="text-[13px] text-darkGray/60 leading-relaxed font-sans">
                A secure 6-digit code was dispatched to: <br />
                <span className="text-secondary font-semibold border-b border-mutedGreen/30 italic">
                  {email}
                </span>
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} onPaste={handlePaste} className="space-y-10">
            <div className="flex gap-3 justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                  className="w-full h-14 text-center text-2xl bg-transparent border-b border-mutedGreen/40 focus:border-secondary focus:outline-none transition-all duration-500 text-primary font-light cursor-pointer"
                  placeholder="0"
                  disabled={loading}
                />
              ))}
            </div>

            <button
              className="w-full h-14 bg-primary text-white hover:bg-secondary transition-all duration-700 text-[11px] tracking-[0.4em] uppercase font-bold flex items-center justify-center group cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <span className="flex items-center gap-3">
                    Confirm Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </AnimatePresence>
            </button>
          </form>
        </div>

        <footer className="mt-16 pt-8 flex flex-col gap-2 items-center border-t border-accent/60">
          <p className="text-[10px] uppercase tracking-widest text-darkGray/40">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || isResending || loading}
            className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-500 cursor-pointer ${
              timer > 0 || isResending ? 'text-mutedGreen opacity-40 cursor-not-allowed' : 'text-secondary hover:text-primary underline underline-offset-8'
            }`}
          >
            {isResending ? "Sending..." : (timer > 0 ? `Resend available in ${timer}s` : "Request New Code")}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
