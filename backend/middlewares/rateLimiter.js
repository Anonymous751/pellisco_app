import rateLimit from "express-rate-limit";

// Login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 1 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP / Password Reset rate limiter
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many  otp requests. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});




