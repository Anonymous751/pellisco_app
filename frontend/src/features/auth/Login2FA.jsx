import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginVerify2FA, clearErrors } from "../auth/authSlice";

const Login2FA = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, tempUserId } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if we have the user ID before dispatching
    if (!tempUserId) {
      toast.error("Session expired. Please login again.");
      return navigate("/login");
    }

    // FIX: Changed 'otpValue' to 'otp' to match your useState variable
    dispatch(loginVerify2FA({ userId: tempUserId, token: otp }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
      toast.success("Welcome back!");
    }
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-3xl shadow-xl w-full max-w-md text-center border border-[var(--color-accent)]">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Final Security Check</h2>
        <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">Enter the 6-digit code from your app</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="000000"
            className="w-full text-center text-3xl font-black tracking-[0.4em] py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 ring-[var(--color-secondary)]"
            value={otp}
            maxLength="6"
            // Keeps only numbers
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <button
            type="submit"
            disabled={otp.length !== 6 || loading}
            className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-secondary)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying Ritual..." : "Unlock Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login2FA;
