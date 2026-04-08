import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ShieldCheck, CreditCard, LogOut, ChevronRight,
  Lock, X, Eye, EyeOff, Loader2
} from 'lucide-react';
  import { toast } from 'react-toastify';
  import {
    updatePassword,
    setup2FA,
    verifyAndEnable2FA,
    disable2FA,
    clearErrors,
    clearMessage
  } from '../auth/authSlice';

const UAccountPage = () => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="animate-in fade-in duration-700 max-w-3xl mx-auto space-y-8 pb-10">
      {/* Security Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Security</h3>
        <div className="bg-white border border-[var(--color-accent)] rounded-2xl divide-y divide-[var(--color-accent)] shadow-sm">

          {/* Password Row */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Lock size={20} /></div>
              <div>
                <p className="text-sm font-bold text-[var(--color-primary)]">Password</p>
                <p className="text-xs text-gray-500">Secure your digital identity</p>
              </div>
            </div>
            <button
              onClick={() => setIsPassModalOpen(true)}
              className="px-5 py-2 border border-[var(--color-mutedGreen)] text-[var(--color-primary)] text-xs font-bold rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer"
            >
              Change Password
            </button>
          </div>

          {/* 2FA Row */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-sm font-bold text-[var(--color-primary)]">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">
                  {user?.twoFactorEnabled ? "Active: Extra layer of security enabled." : "Add a secondary layer of protection."}
                </p>
              </div>
            </div>
            <button
              onClick={() => user?.twoFactorEnabled ? setIsDisableModalOpen(true) : setIs2FAModalOpen(true)}
              className={`text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 rounded-xl border ${
                user?.twoFactorEnabled
                ? 'border-red-100 text-red-500 hover:bg-red-50 cursor-pointer'
                : 'border-[var(--color-accent)] text-[var(--color-secondary)] hover:underline cursor-pointer'
              }`}
            >
              {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </section>

      {/* Billing Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Billing & Plan</h3>
        <div className="bg-white border border-[var(--color-accent)] rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><CreditCard size={20} /></div>
            <div>
              <p className="text-sm font-bold text-[var(--color-primary)]">Payment Method</p>
              <p className="text-xs text-gray-500">Manage your subscription details</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </section>

      {/* Logout */}
      <div className="pt-6 border-t border-[var(--color-accent)]">
        <button className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity cursor-pointer">
          <LogOut size={16} />
          Sign Out of Account
        </button>
      </div>

      {/* Modals */}
      {isPassModalOpen && <PasswordModal onClose={() => setIsPassModalOpen(false)} />}
      {is2FAModalOpen && <TwoFactorModal onClose={() => setIs2FAModalOpen(false)} />}
      {isDisableModalOpen && <Disable2FAModal onClose={() => setIsDisableModalOpen(false)} />}
    </div>
  );
};

/* --- DISABLE 2FA MODAL --- */
const Disable2FAModal = ({ onClose }) => {
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  const handleDisable = (e) => {
    e.preventDefault();
    dispatch(disable2FA({ password }));
  };

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearErrors()); }
    if (message) {
      toast.success("Security Ritual Reversed: 2FA Disabled");
      dispatch(clearMessage());
      onClose();
    }
  }, [error, message, dispatch, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-red-600 font-serif">Disable 2FA</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Enter your password to confirm disabling Two-Factor Authentication.
          </p>
          <form onSubmit={handleDisable} className="space-y-4 text-left">
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-accent)] rounded-xl outline-none focus:ring-2 ring-red-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 bg-red-500 text-white text-xs font-bold uppercase rounded-xl hover:bg-red-600 shadow-lg cursor-pointer flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Confirm Disable"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* --- 2FA MODAL --- */
const TwoFactorModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [otp, setOtp] = useState("");

  // Get loading state from Redux
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true; // Prevents state updates if component unmounts

    // ONLY dispatch if we don't have a QR code AND we aren't already loading
    if (!qrCode && !loading) {
      dispatch(setup2FA()).unwrap()
        .then((data) => {
          if (isMounted && data.qrCode) {
            setQrCode(data.qrCode);
            setManualKey(data.manualKey);
          }
        })
        .catch((err) => {
          if (isMounted) toast.error(err || "Failed to load ritual sequence");
        });
    }

    return () => { isMounted = false; }; // Cleanup function
  }, [dispatch, qrCode, loading]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
        dispatch(verifyAndEnable2FA(otp));
    }
  };

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearErrors()); }
    if (message) {
      toast.success("2FA Security Enabled Successfully!");
      dispatch(clearMessage());
      onClose();
    }
  }, [error, message, dispatch, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[var(--color-primary)] font-serif">2FA Setup</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Scan ritual pattern with Authenticator App</p>
          <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-[var(--color-accent)] min-h-[180px] items-center">
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-[var(--color-secondary)]" size={32} />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Generating...</p>
              </div>
            )}
          </div>
          {manualKey && (
             <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[8px] text-gray-400 font-bold uppercase mb-1">Backup Key</p>
                <code className="text-[10px] text-[var(--color-primary)] font-mono break-all">{manualKey}</code>
             </div>
          )}
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              placeholder="000 000"
              className="w-full px-4 py-4 bg-gray-50 border border-[var(--color-accent)] rounded-xl outline-none text-center text-2xl tracking-[0.4em] font-black focus:ring-2 ring-[var(--color-secondary)]"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-[var(--color-primary)] text-white text-xs font-bold uppercase rounded-xl hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify & Enable"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* --- PASSWORD MODAL --- */
const PasswordModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);
  const [showPass, setShowPass] = useState(false);

  const formik = useFormik({
    initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Required'),
      newPassword: Yup.string().min(8, 'Too short').required('Required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Mismatch').required('Required'),
    }),
    onSubmit: (values) => dispatch(updatePassword(values)),
  });

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearErrors()); }
    if (message) { toast.success(message); dispatch(clearMessage()); onClose(); }
  }, [error, message, dispatch, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-primary)] font-serif">Security Ritual</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <input name="oldPassword" type={showPass ? "text" : "password"} {...formik.getFieldProps('oldPassword')} placeholder="Current Key" className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-accent)] rounded-xl outline-none" />
            <div className="relative">
                <input name="newPassword" type={showPass ? "text" : "password"} {...formik.getFieldProps('newPassword')} placeholder="New Secret" className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-accent)] rounded-xl outline-none" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <input name="confirmPassword" type={showPass ? "text" : "password"} {...formik.getFieldProps('confirmPassword')} placeholder="Confirm Secret" className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-accent)] rounded-xl outline-none" />
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-[var(--color-primary)] text-white text-xs font-bold uppercase rounded-xl shadow-lg">
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UAccountPage;
