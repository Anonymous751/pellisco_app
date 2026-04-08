import User from "../models/userModel.js";
import UserLog from "../models/userLogModel.js";
import handleAsyncError from "../middlewares/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import { sendToken } from "../utils/jwtToken.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createUserLog } from "../utils/createUserLog.js";
import {
  validatePassword,
  getPasswordValidationMessage,
} from "../utils/validatePassword.js";
import crypto from "crypto";
import QRCode from "qrcode";
import Order from "../models/orderModel.js";
import Shipping from "../models/shippingModel.js";

import { v2 as cloudinary } from "cloudinary";

import speakeasy from "speakeasy";

// @desc    Step 1: Request 2FA Setup (Generate QR)
// @route   POST /api/v1/2fa/setup
export const setup2FA = handleAsyncError(async (req, res, next) => {
  // 1. Fetch user AND the secret (which is usually hidden by 'select: false')
  const user = await User.findById(req.user.id).select("+twoFactorSecret");

  let secretBase32;

  // 2. CHECK: If user already has a secret saved, REUSE IT.
  if (user.twoFactorSecret) {
    secretBase32 = user.twoFactorSecret;
  } else {
    // 3. Only generate a NEW one if the database is empty
    const secret = speakeasy.generateSecret({
      name: `Pellisco:${user.email}`,
    });
    secretBase32 = secret.base32;
    user.twoFactorSecret = secretBase32;
    await user.save();
  }

  // 4. Generate the QR code using the STABLE secret
  const otpauth_url = `otpauth://totp/Pellisco:${user.email}?secret=${secretBase32}&issuer=Pellisco`;
  const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);

  res.status(200).json({
    success: true,
    qrCode: qrCodeDataURL,
    manualKey: secretBase32,
  });
});

// @desc    Step 2: Verify Token & Enable 2FA
// @route   POST /api/v1/2fa/verify
export const verifyAndEnable2FA = handleAsyncError(async (req, res, next) => {
  const { token } = req.body;

  // Validation: Ensure 6-digit numeric string
  if (!token || !/^\d{6}$/.test(token)) {
    return next(
      new HandleError("Please provide a valid 6-digit security code", 400)
    );
  }

  const user = await User.findById(req.user.id).select("+twoFactorSecret");

  if (!user.twoFactorSecret) {
    return next(
      new HandleError("2FA setup session expired. Please try again.", 400)
    );
  }

  // Verify code against secret
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return next(
      new HandleError("Invalid or expired code. Please check your app.", 400)
    );
  }

  // Finalize 2FA activation
  user.twoFactorEnabled = true;
  await user.save();

  await createUserLog({
    user: user._id,
    action: "2FA_ENABLED_SUCCESS",
    req,
  });

  res.status(200).json({
    success: true,
    message: "Security Ritual Complete: 2FA is now active.",
  });
});

/**
 * @desc    Step 3: Verify 2FA Code During Login Flow
 * @route   POST /api/v1/auth/login/2fa
 * @access  Public (Requires userId and token)
 */
export const loginVerify2FA = handleAsyncError(async (req, res, next) => {
  const { userId, token } = req.body;

  // 1. Validation
  if (!userId || !token) {
    return next(
      new HandleError("Identification and security code are required.", 400)
    );
  }

  // 2. Find user and explicitly select the hidden secret
  const user = await User.findById(userId).select("+twoFactorSecret +password");

  if (!user) {
    return next(new HandleError("User session not found.", 404));
  }

  // 3. Verify the TOTP token using speakeasy
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1, // High-value fix: allows for ±30 seconds time drift between phone and server
  });

  if (!verified) {
    return next(
      new HandleError("Invalid or expired code. Please check your app.", 401)
    );
  }

  // 4. Success! Update login metadata
  user.lastLogin = Date.now();
  await user.save();

  // 5. Create a security log
  await createUserLog({
    user: user._id,
    action: "LOGIN_SUCCESS_2FA",
    req,
  });

  // 6. Generate and send the actual JWT token
  sendToken(user, 200, res);
});

// @desc    Disable 2FA (Requires Password for Security)
// @route   POST /api/v1/2fa/disable
export const disable2FA = handleAsyncError(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  // 1. Verify password before allowing a security downgrade
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new HandleError("Invalid password", 401));
  }

  // 2. HARD RESET: Wipe everything related to 2FA
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined; // This deletes the field in MongoDB
  user.twoFactorBackupCodes = [];

  await user.save();

  res.status(200).json({
    success: true,
    message: "2FA has been completely reset and disabled.",
  });
});

export const updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // 1. Safety Check: Only delete from Cloudinary if it's NOT a Google photo
    // We check if public_id exists AND doesn't start with our custom 'google_' prefix
    if (
      user.avatar?.public_id &&
      !user.avatar.public_id.startsWith("google_")
    ) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (cloudErr) {
        console.error("Cloudinary Delete Failed:", cloudErr.message);
        // We continue anyway so the user can still upload their new photo
      }
    }

    // 2. Upload the new image (req.body.image should be the Base64 string)
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "pellisco/users",
      width: 150,
      crop: "thumb", // 'thumb' is often better than 'scale' for avatars
      gravity: "face",
      quality: "auto", // Pellisco brand: keep it crisp but optimized
      fetch_format: "auto",
    });

    // 3. Update the database
    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    // If they were a Google user, we mark the provider as updated or
    // simply keep the googleId for reference but use the new avatar.
    await user.save();

    res.status(200).json({
      success: true,
      message: "Ritualist Profile Image Synchronized",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to synchronize media: " + error.message,
    });
  }
};

export const sendContactInquiry = handleAsyncError(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  // 1. Enhanced Validation
  if (!name || !email || !message) {
    return next(
      new HandleError("Please provide name, email, and message.", 400)
    );
  }

  // Simple Email Regex check to prevent spam/errors
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new HandleError("Please provide a valid email address.", 400));
  }

  // 2. Professional Email Formatting
  const emailMessage = `
    NEW INQUIRY: Pellisco Ritualist Community
    ------------------------------------------
    From:    ${name}
    Email:   ${email}
    Subject: ${subject || "General Inquiry"}
    Date:    ${new Date().toLocaleString()}

    Message Body:
    ${message}
    ------------------------------------------
    End of message.
  `;

  try {
    // 3. Send email to Admin Inbox
    await sendEmail({
      email: process.env.SMTP_EMAIL,
      subject: `[Contact Form] ${subject || "New Inquiry"} - ${name}`,
      message: emailMessage,
    });

    // 4. Log the action for Admin Audit
    // This helps you track how many people are contacting you
    await createUserLog({
      user: null, // Guest or identified user
      action: "CONTACT_INQUIRY_SENT",
      req,
      performedBy: user._id,
      metadata: {
        senderName: name,
        senderEmail: email,
        subject: subject,
      },
    });

    res.status(200).json({
      success: true,
      message:
        "Your message has been received. Our team will get back to you shortly.",
    });
  } catch (error) {
    // Detailed error logging for your server console
    console.error("Mail Error:", error);
    return next(
      new HandleError(
        "We're experiencing technical issues with our mail server. Please try again later.",
        500
      )
    );
  }
});

/* =======================================
  HELPER: Tier Calculation Logic
  Matches React UI: Brown, Silver, Gold
======================================= */
const calculateTier = (totalSpent) => {
  if (totalSpent >= 500000) return "Gold"; // Over 500k
  if (totalSpent >= 150000) return "Silver"; // 150k - 499k
  return "Brown"; // Default / Entry
};

/* =======================================
  1️⃣ Register New User
======================================= */
export const registerUser = handleAsyncError(async (req, res, next) => {
  // 1. Destructure from req.body (Matched 'avatar', 'role', and 'accountStatus' to your Modal)
  const { name, email, password, phone, avatar, role, accountStatus } =
    req.body;

  // 2. Validation
  const passwordMessage = getPasswordValidationMessage(password);
  if (passwordMessage) return next(new HandleError(passwordMessage, 400));

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return next(new HandleError("User already exists with this email", 400));

  // 3. Cloudinary Upload (Using 'avatar' from frontend)
  let avatarData = {
    public_id: "",
    url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  };

  if (avatar && typeof avatar === "string" && avatar.length > 0) {
    const result = await cloudinary.uploader.upload(avatar, {
      folder: "pellisco/users",
      width: 250,
      height: 250,
      crop: "fill",
      gravity: "face",
      quality: "auto",
      fetch_format: "auto",
    });

    avatarData = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  // 4. User Creation
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || "user", // Captures 'admin' or 'user' from your Modal
    accountStatus: accountStatus || "active", // Captures status from your Modal
    tier: "Brown",
    avatar: avatarData,
  });

  // 5. OTP Generation
  const otp = generateOTP();
  user.emailOTPVerificationToken = otp;
  user.emailOTPVerificationExpire = Date.now() + 10 * 60 * 1000;

  // validateBeforeSave: false ensures password isn't re-hashed by pre-save hook
  await user.save({ validateBeforeSave: false });

  // 6. External Services (Email & Logging)
  await sendEmail({
    email: user.email,
    subject: "Email Verification OTP",
    message: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
  });

  await createUserLog({
    user: user._id,
    action: "REGISTER",
    req,
    performedBy: user._id,
    metadata: { email, phone, initialTier: "Brown", role: user.role },
  });

  // 7. Success Response
  res.status(201).json({
    success: true,
    message: "Registration successful. Please verify your email.",
    user, // Returning user object so you can see the avatar URL in Postman/UI
  });
});
/* =======================================
  2️⃣ Verify Email OTP
======================================= */
/* =======================================
  2️⃣ Verify Email OTP
======================================= */
export const verifyEmailOTP = handleAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  // 1. Find user and EXPLICITLY include the hidden fields
  const user = await User.findOne({ email }).select(
    "+emailOTPVerificationToken +emailOTPVerificationExpire"
  );

  if (!user) return next(new HandleError("User not found", 404));

  // 2. Validate OTP
  // Convert both to String to avoid Type mismatches (Number vs String)
  if (String(user.emailOTPVerificationToken) !== String(otp)) {
    return next(new HandleError("Invalid OTP", 400));
  }

  if (user.emailOTPVerificationExpire < Date.now()) {
    return next(new HandleError("OTP expired", 400));
  }

  // 3. Update Status
  user.isVerified = true;
  user.emailOTPVerificationToken = undefined;
  user.emailOTPVerificationExpire = undefined;

  // Important for Pellisco: bypass hashing and validation during status update
  await user.save({ validateBeforeSave: false });

  // 4. Finalize login
  sendToken(user, 200, res);
});

// --- REWRITTEN: Admin Manual Verification Controller ---
/**
 * @desc    Admin Manual Email Verification
 * @route   PATCH /api/v1/admin/users/:id/verify-email
 * @access  Private/Admin
 */
// --- MINIMAL: Admin Manual Verification Controller ---
export const verifyUserEmailAdmin = handleAsyncError(async (req, res, next) => {
  // 1. Find the ritualist first to ensure they exist
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new HandleError("Ritualist not found", 404));
  }

  // 2. Prevent redundant processing if already verified
  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "Account is already verified",
      user,
    });
  }

  // 3. FORCE PERSISTENCE: Atomic Update
  // This ensures the change is written to MongoDB immediately
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isVerified: true,
        emailOTPVerificationToken: undefined,
        emailOTPVerificationExpire: undefined,
      },
    },
    { new: true, runValidators: false }
  );

  // 4. ADD AUDIT LOG: Track the Admin Action
  // This uses your helper to record WHO did WHAT and from WHERE
  await createUserLog({
    user: updatedUser._id, // The Ritualist affected
    action: "ADMIN_MANUAL_VERIFY", // Action type (Ensure this is in your Log Enum)
    req: req, // Passes IP and UserAgent
    performedBy: req.user._id, // The Admin's ID
    metadata: {
      method: "Manual Toggle",
      adminName: req.user.name,
    },
  });

  // 5. NOTIFICATION: Send the success email
  try {
    await sendEmail({
      email: updatedUser.email,
      subject: "Pellisco Ritualist Status: Verified",
      message: `Hello ${updatedUser.name},\n\nYour account has been manually verified by our team. Welcome to Pellisco!`,
    });
  } catch (error) {
    console.error("Email failed, but user is verified in DB:", error.message);
  }

  // 6. RESPONSE
  res.status(200).json({
    success: true,
    message: "Ritualist verified and action logged successfully",
    user: updatedUser,
  });
});

/* =======================================
  3️⃣ Resend Email OTP
======================================= */
export const resendEmailOTP = handleAsyncError(async (req, res, next) => {
  const email = req.body.email || req.body.identifier;
  if (!email) return next(new HandleError("Please provide your email", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new HandleError("User not found", 404));

  // Removed the isVerified check to allow existing users to log in with OTP

  if (user.lockUntil && user.lockUntil > Date.now())
    return next(
      new HandleError("Too many OTP attempts. Try again later.", 429)
    );

  user.otpAttempts = (user.otpAttempts || 0) + 1;
  if (user.otpAttempts > 5) {
    user.lockUntil = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    return next(
      new HandleError("Exceeded OTP attempts. Try after 30 minutes.", 429)
    );
  }

  const otp = generateOTP();
  user.emailOTPVerificationToken = otp;
  user.emailOTPVerificationExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: "Resend Email Verification OTP",
    message: `Your new OTP is ${otp}. It will expire in 10 minutes.`,
  });

  await createUserLog({
    user: user._id,
    action: "EMAIL_OTP_RESENT",
    req,
    performedBy: user._id,
    metadata: { remainingAttempts: 5 - user.otpAttempts },
  });

  res.status(200).json({ success: true });
});

/* =======================================
  4️⃣ Login User
======================================= */
export const loginUser = handleAsyncError(async (req, res, next) => {
  const { email, phone, password, otp, method } = req.body;

  const identifier = email || phone;

  // 1. VALIDATION
  if (!identifier) {
    await createUserLog({
      user: null,
      action: "LOGIN",
      req,
      metadata: {
        status: "FAILED",
        reason: "NO_IDENTIFIER",
      },
    });

    return next(new HandleError("Provide Email or Phone", 400));
  }

  // 2. FIND USER
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select(
    "+password +emailOTPVerificationToken +emailOTPVerificationExpire +twoFactorEnabled"
  );

  // ❌ USER NOT FOUND
  if (!user) {
    await createUserLog({
      user: null,
      action: "LOGIN",
      req,
      metadata: {
        status: "FAILED",
        identifier,
        reason: "USER_NOT_FOUND",
      },
    });

    return next(new HandleError("Invalid Email/Phone or Password", 400));
  }

  // 🚫 BLOCKED / SUSPENDED
  if (["blocked", "suspended"].includes(user.accountStatus)) {
    await createUserLog({
      user: user._id,
      action: "LOGIN",
      req,
      metadata: {
        status: "BLOCKED",
        reason: user.accountStatus,
      },
    });

    return next(new HandleError("Account restricted", 403));
  }

  // 🔒 ACCOUNT LOCKED
  if (user.lockUntil && user.lockUntil > Date.now()) {
    await createUserLog({
      user: user._id,
      action: "LOGIN",
      req,
      metadata: {
        status: "FAILED",
        reason: "ACCOUNT_LOCKED",
        lockUntil: user.lockUntil,
      },
    });

    return next(new HandleError("Account temporarily locked. Try later.", 429));
  }

  // 3. VERIFY CREDENTIALS
  let isAuthSuccessful = false;

  if (method === "otp") {
    const isOtpValid = user.emailOTPVerificationToken === otp;
    const isOtpNotExpired = user.emailOTPVerificationExpire > Date.now();
    isAuthSuccessful = isOtpValid && isOtpNotExpired;
  } else {
    isAuthSuccessful = await user.comparePassword(password);
  }

  // ❌ AUTH FAILED
  if (!isAuthSuccessful) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    const MAX_ATTEMPTS = 5;
    const remaining = MAX_ATTEMPTS - user.loginAttempts;

    if (user.loginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = Date.now() + 5 * 60 * 1000;
    }

    await user.save({ validateBeforeSave: false });

    await createUserLog({
      user: user._id,
      action: "LOGIN",
      req,
      metadata: {
        status: "FAILED",
        method,
        attempts: user.loginAttempts,
        remaining,
      },
    });

    const message =
      remaining > 0
        ? `Invalid credentials. ${remaining} attempts left.`
        : "Too many failed attempts. Account locked.";

    return next(new HandleError(message, 401));
  }

  // 🔐 2FA REQUIRED
  if (user.twoFactorEnabled) {
    await createUserLog({
      user: user._id,
      action: "LOGIN",
      req,
      metadata: {
        status: "2FA_REQUIRED",
        method,
      },
    });

    return res.status(200).json({
      success: true,
      requires2FA: true,
      userId: user._id,
    });
  }

  // ✅ SUCCESS
  user.loginAttempts = 0;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await createUserLog({
    user: user._id,
    action: "LOGIN",
    req,
    metadata: {
      status: "SUCCESS",
      method,
      tier: user.tier,
    },
  });

  sendToken(user, 200, res);
});
/* =======================================
  5️⃣ Logout
======================================= */
export const logout = handleAsyncError(async (req, res) => {
  console.log("🔥 LOGOUT HIT");

  // 👉 ADD IT HERE
  console.log("USER:", req.user);

  console.log("🔥 LOGOUT HIT"); // 👈 ADD HERE FIRST

  console.log("USER:", req.user);

  const userId = req.user?._id || null;

  try {
    if (userId) {
      await createUserLog({
        user: userId,
        action: "LOGOUT",
        req,
        metadata: {
          status: "SUCCESS",
        },
      });
    }
  } catch (err) {
    console.error("Logout log error:", err.message);
  }

  res.cookie("token", null, {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

/* =======================================
  6️⃣ Forgot Password - Request Reset
======================================= */
export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new HandleError("User not found", 404));

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:5173/password/reset/${resetToken}`;
  await sendEmail({
    email,
    subject: "Password Reset",
    message: `Reset: ${resetURL}`,
  });

  await createUserLog({
    user: user._id,
    action: "PASSWORD_RESET_REQUEST",
    req,
    performedBy: null,
  });

  res
    .status(200)
    .json({ success: true, message: "Password reset email sent." });
});

/* =======================================
  7️⃣ Reset Password
======================================= */

export const resetPassword = handleAsyncError(async (req, res, next) => {
  // 1. Hash the incoming token from the URL
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find the user by the hashed token
  // We check for the token FIRST without the expiry to give better error messages
  const user = await User.findOne({ resetPasswordToken });

  // Debugging logs - Check your terminal!
  console.log("--- Password Reset Debug ---");
  console.log("Token from URL:", req.params.token);
  console.log("Hashed Token:", resetPasswordToken);

  if (!user) {
    console.log("❌ ERROR: No user found with this token.");
    return next(new HandleError("Reset token is invalid", 400));
  }

  // 3. Check if the token has expired
  if (user.resetPasswordExpire <= Date.now()) {
    console.log("⚠️ ERROR: Token exists but has EXPIRED.");
    return next(new HandleError("Reset token has expired", 400));
  }

  console.log("✅ SUCCESS: User identified:", user.email);

  // 4. Validate Passwords from Request Body
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new HandleError("Please provide both passwords", 400));
  }

  if (password !== confirmPassword) {
    return next(new HandleError("Passwords do not match", 400));
  }

  // 5. Custom Password Strength Validation
  const validationMessage = getPasswordValidationMessage(password);
  if (validationMessage) {
    return next(new HandleError(validationMessage, 400));
  }

  // 6. Update User Data
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // .save() will trigger your "pre-save" password hashing middleware
  await user.save();

  // 7. Log the Activity
  await createUserLog({
    user: user._id,
    action: "PASSWORD_RESET_SUCCESS",
    req,
    performedBy: user._id,
  });

  // 8. Finalize - send JWT token and success response
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

/* =======================================
  8️⃣ Update Password
======================================= */
export const updatePassword = handleAsyncError(async (req, res, next) => {
  console.log("Controller HIT");
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new HandleError("User not found", 404));
  }
  console.log("OLD:", oldPassword);
  console.log("HASH:", user.password);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new HandleError("Old password is incorrect", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new HandleError("New passwords do not match", 400));
  }

  if (oldPassword === newPassword) {
    return next(new HandleError("New password must be different", 400));
  }

  const message = getPasswordValidationMessage(newPassword);
  if (message) return next(new HandleError(message, 400));

  user.password = newPassword;
  await user.save();

  await createUserLog({
    user: user._id,
    action: "PASSWORD_UPDATE_SUCCESS",
    req,
    performedBy: null,
  });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

/* =======================================
  9️⃣ User Profile & Admin Routes
======================================= */
// You want me to continue rewriting all admin controllers similarly

/* =======================================
  🔟 Get Logged-In User Details
======================================= */
export const getUserDetails = handleAsyncError(async (req, res) => {
  // 1. Fetch the fresh user data
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // 2. TIER AUTO-CALCULATION LOGIC
  const spent = user.totalSpent || 0;
  let calculatedTier = "Brown";

  if (spent >= 100000) calculatedTier = "Platinum";
  else if (spent >= 50000) calculatedTier = "Gold";
  else if (spent >= 10000) calculatedTier = "Silver";
  else calculatedTier = "Brown";

  // 3. SILENT SYNC: Only save if the tier has actually changed
  if (user.tier !== calculatedTier) {
    console.log(
      `✨ Tier Promotion: ${user.name} moved from ${user.tier} to ${calculatedTier}`
    );
    user.tier = calculatedTier;

    // Use validateBeforeSave: false to avoid triggering password validation etc.
    await user.save({ validateBeforeSave: false });
  }

  // 5. SEND RESPONSE
  res.status(200).json({
    success: true,
    user,
  });
});

/* =======================================
  1️⃣1️⃣ Update User Profile
======================================= */
export const updateProfile = handleAsyncError(async (req, res, next) => {
  const { name, phone, preferredCurrency, avatar } = req.body;

  // LOG 1: Check what the frontend is sending
  console.log("📥 Incoming Request Body:", {
    name,
    phone,
    preferredCurrency,
    hasAvatar: !!avatar,
  });

  // LOG 2: Check what the auth middleware is providing
  console.log("👤 Current User from Middleware:", {
    id: req.user?._id,
    spent: req.user?.totalSpent,
    currentTier: req.user?.tier,
  });

  const updates = { name, phone, preferredCurrency };

  // 2. TIER CALCULATION
  const amountSpent = Number(req.user?.totalSpent) || 0;
  let newTier = "Brown";

  if (amountSpent >= 100000) newTier = "Platinum";
  else if (amountSpent >= 50000) newTier = "Gold";
  else if (amountSpent >= 10000) newTier = "Silver";
  else newTier = "Brown";

  updates.tier = newTier;
  console.log("⚖️ Calculated New Tier:", newTier);

  // 3. Avatar Upload Logic
  if (avatar && avatar.startsWith("data:image")) {
    try {
      if (req.user?.avatar?.public_id) {
        await cloudinary.uploader.destroy(req.user.avatar.public_id);
      }
      const myCloud = await cloudinary.uploader.upload(avatar, {
        folder: "pellisco/users",
        width: 300,
        crop: "scale",
      });
      updates.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      console.log("🖼️ Avatar Uploaded to Cloudinary");
    } catch (err) {
      console.error("❌ Cloudinary Error:", err);
    }
  }

  // 4. Database Update
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  console.log("💾 Database Updated. Final Tier in DB:", user.tier);

  res.status(200).json({
    success: true,
    user,
  });
});
// ====================================
// 1️⃣2️⃣ Request Email OTP (Login or Verification)
// ======================================= */
export const requestEmailOTP = handleAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new HandleError("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new HandleError("User not found", 404));

  const otp = generateOTP();
  user.emailOTPVerificationToken = otp;
  user.emailOTPVerificationExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email,
    subject: "Your Login OTP",
    message: `Your OTP for login is ${otp}. Expires in 10 minutes.`,
  });

  await createUserLog({
    user: user._id,
    action: "EMAIL_OTP_REQUESTED",
    req,
    performedBy: null,
  });

  res.status(200).json({ success: true, message: "OTP sent to your email" });
});

/* =======================================
  1️⃣3️⃣ Verify Email OTP for Login
======================================= */
export const verifyEmailOTPLogin = handleAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return next(new HandleError("Email and OTP are required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new HandleError("User not found", 404));

  if (user.emailOTPVerificationToken !== otp)
    return next(new HandleError("Invalid OTP", 400));
  if (user.emailOTPVerificationExpire < Date.now())
    return next(new HandleError("OTP expired", 400));

  user.emailOTPVerificationToken = undefined;
  user.emailOTPVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  await createUserLog({
    user: user._id,
    action: "EMAIL_OTP_LOGIN_VERIFIED",
    req,
    performedBy: null,
  });

  sendToken(user, 200, res);
});

/* =======================================
  2️⃣0️⃣ Admin: Get All Users with Pagination
======================================= */
/* =======================================
  20. Admin: Get All Users (THE COMPLETE FIX)
======================================= */
/* =======================================
  20. Admin: Get All Users (THE COMPLETE FIX)
======================================= */
export const getAdminAllUsers = handleAsyncError(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const isMinimal = req.query.minimal === "true";

  const users = await User.find({ _id: { $ne: req.user._id } })
    .select(
      isMinimal
        ? "name email role accountStatus"
        : "name email phone role tier accountStatus totalSpent createdAt lastLogin city numOfOrders avatar isVerified"
    )
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const processedUsers = await Promise.all(
    users.map(async (user) => {
      const spent = user.totalSpent || 0;

      let correctTier =
        spent >= 100000
          ? "Platinum"
          : spent >= 50000
          ? "Gold"
          : spent >= 10000
          ? "Silver"
          : "Brown";

      if (user.tier !== correctTier) {
        User.updateOne(
          { _id: user._id },
          { $set: { tier: correctTier } }
        ).exec();

        user.tier = correctTier;
      }

      return user;
    })
  );

  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    users: processedUsers,
    totalUsers,
    page,
    totalPages: Math.ceil(totalUsers / limit),
  });
});

/* =======================================
  2️⃣1️⃣ Admin: Search Users
======================================= */
export const searchUsersByAdmin = handleAsyncError(async (req, res) => {
  const keyword = (req.query.keyword || "").trim();

  // Check if keyword is empty
  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "Please provide a search keyword (email or phone).",
    });
  }

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Simple phone regex (digits only, length 7-15)
  const phoneRegex = /^[0-9]{7,15}$/;

  // Validate keyword
  if (!emailRegex.test(keyword) && !phoneRegex.test(keyword)) {
    return res.status(400).json({
      success: false,
      message: "Keyword must be a valid email or phone number.",
    });
  }

  // Build search query
  const query = {};
  if (emailRegex.test(keyword))
    query.email = { $regex: keyword, $options: "i" };
  if (phoneRegex.test(keyword))
    query.phone = { $regex: keyword, $options: "i" };

  const users = await User.find(query).select("-password");

  // Log admin search action
  if (req.user && req.user._id) {
    await createUserLog({
      user: req.user._id, // admin ID performing the action
      performedBy: req.user._id, // same admin ID
      action: "ADMIN_SEARCH_USERS",
      req, // request object to capture IP & User-Agent
      metadata: { keyword }, // include search keyword for reference
    });
  }

  res.status(200).json({ success: true, users });
});

/* =======================================
  2️⃣2️⃣ Admin: Get Single User
======================================= */
export const getAdminSingleUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "-password -loginAttempts -lockUntil"
  );

  if (!user) return next(new HandleError("User not found", 404));

  // LOGGING: Admin viewed single user
  if (req.user && req.user._id) {
    await createUserLog({
      user: req.params.id, // user being viewed
      performedBy: req.user._id, // admin performing the action
      action: "ADMIN_VIEW_SINGLE_USER",
      req,
      metadata: { viewedByAdmin: req.user._id.toString() },
    });
  }

  res.status(200).json({ success: true, user });
});

/* =======================================
  2️⃣3️⃣ Admin: Update User
======================================= */
export const updateUserByAdmin = handleAsyncError(async (req, res, next) => {
  // Added 'tier' to allowed fields so admin can manually promote/demote
  const allowedFields = [
    "name",
    "email",
    "phone",
    "role",
    "tier",
    "accountStatus",
    "city",
  ];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    returnDocument: "after",
  });

  if (!user) return next(new HandleError("User not found", 404));

  await createUserLog({
    user: user._id,
    performedBy: req.user._id,
    action: "ADMIN_UPDATED_USER",
    req,
    metadata: { updatedFields: Object.keys(updates), newTier: user.tier },
  });

  res
    .status(200)
    .json({ success: true, message: "User updated successfully", user });
});

/* =======================================
  2️⃣4️⃣ Admin: Change User Password
======================================= */
export const adminChangeUserPassword = handleAsyncError(
  async (req, res, next) => {
    const { password } = req.body;
    if (!password) return next(new HandleError("Password is required", 400));

    const user = await User.findById(req.params.id);
    if (!user) return next(new HandleError("User not found", 404));

    user.password = password;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await createUserLog({
      user: user._id,
      performedBy: req.user._id,
      action: "ADMIN_UPDATED_USER_PASSWORD",
      req,
    });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  }
);

/* =======================================
  2️⃣5️⃣ Admin: Update User Account Status
======================================= */
export const updateUserAccountStatus = handleAsyncError(
  async (req, res, next) => {
    const { accountStatus } = req.body;
    const { id } = req.params;

    // 1. Validation check
    const allowedStatus = ["active", "blocked", "suspended"];
    if (!allowedStatus.includes(accountStatus)) {
      return next(new HandleError("Invalid account status", 400));
    }

    // 2. Find and update the user first (So we have the 'user' object)
    const user = await User.findByIdAndUpdate(
      id,
      { accountStatus },
      { new: true, runValidators: true, returnDocument: "after" }
    );

    if (!user) {
      return next(new HandleError("User not found", 404));
    }

    // 3. Prepare Email Content
    let emailSubject = "";
    let emailMessage = "";

    if (accountStatus === "active") {
      emailSubject = "Pellisco Account Notice: Your Account is Now Active";
      emailMessage = `Hello ${user.name},\n\nGood news! Your Pellisco account has been reactivated. You can now log in and continue exploring our premium skincare and beauty rituals.\n\nWelcome back to the community!`;
    } else if (accountStatus === "blocked") {
      emailSubject = "Important: Your Pellisco Account has been Blocked";
      emailMessage = `Hello ${user.name},\n\nYour account at Pellisco has been blocked due to a violation of our terms. If you believe this is an error, please contact support.`;
    } else if (accountStatus === "suspended") {
      emailSubject = "Notice: Your Pellisco Account is Suspended";
      emailMessage = `Hello ${user.name},\n\nYour Pellisco account has been temporarily suspended. Please reach out to our team for more details.`;
    }

    // 4. Trigger Email (Only if email exists and message is set)
    if (emailMessage && user.email) {
      try {
        console.log(
          `Attempting to send ${accountStatus} email to: ${user.email}`
        );
        await sendEmail({
          email: user.email,
          subject: emailSubject,
          message: emailMessage,
        });
        console.log(
          `✅ ${accountStatus.toUpperCase()} notification sent successfully.`
        );
      } catch (err) {
        // We log the error but don't stop the whole request
        console.error(`❌ Email trigger failed: ${err.message}`);
      }
    }

    // 5. Create System Log
    await createUserLog({
      user: user._id,
      performedBy: req.user._id,
      action: `ACCOUNT_${accountStatus.toUpperCase()}`,
      req,
      metadata: { newStatus: accountStatus },
    });

    res.status(200).json({
      success: true,
      message: `User account ${accountStatus} successfully`,
      user,
    });
  }
);

// update Role ?
export const updateUserRole = handleAsyncError(async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  const allowedRoles = ["user", "admin", "verified"];

  if (!allowedRoles.includes(role)) {
    return next(new HandleError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Role updated successfully",
    user,
  });
});

/* =======================================
  2️⃣6️⃣ Admin: Delete User
======================================= */
export const deleteUserProfileByAdmin = handleAsyncError(
  async (req, res, next) => {
    const userId = req.params.id;

    // 1. Safety Check: Don't let the Admin delete themselves
    if (req.user.id === userId) {
      return next(
        new HandleError("Admin cannot delete their own account", 400)
      );
    }

    // 2. Check if user exists before we start deleting related data
    const user = await User.findById(userId);
    if (!user) return next(new HandleError("User not found", 404));

    // 3. CASCADE DELETE: Clear the linked data first
    // This ensures no "Orphaned" shipments remain in your logistics dashboard
    await Order.deleteMany({ user: userId });
    await Shipping.deleteMany({ user: userId });

    // 4. LOG THE ACTION: Do this before the user is fully gone
    await createUserLog({
      user: userId,
      performedBy: req.user._id,
      action: "ADMIN_PURGED_USER_AND_DATA",
      req,
    });

    // 5. FINALLY: Delete the User profile
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and all associated orders/shipments purged successfully",
    });
  }
);

/* =======================================
  2️⃣7️⃣ Admin: View User Activity Logs
======================================= */
export const getUserActivityLogs = handleAsyncError(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const totalLogs = await UserLog.countDocuments({ user: req.params.id });
  const logs = await UserLog.find({ user: req.params.id })
    .populate("performedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  await createUserLog({
    user: req.params.id,
    performedBy: req.user._id,
    action: "USER_ACTIVITY_VIEW",
    req,
    metadata: { viewedLogs: logs.length },
  });

  res.status(200).json({ success: true, totalLogs, page, limit, logs });
});

// GET /api/v1/user/me/logs
export const getMyActivityLogs = handleAsyncError(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const totalLogs = await UserLog.countDocuments({ user: req.user._id });

  const logs = await UserLog.find({ user: req.user._id })
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    totalLogs,
    page,
    limit,
    logs,
  });
});

/* =======================================
  ADMIN: Get Customer Dashboard Stats
======================================= */
export const getCustomerStats = handleAsyncError(async (req, res, next) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const stats = await User.aggregate([
    {
      $facet: {
        totalRitualists: [{ $count: "count" }],
        tierCounts: [{ $group: { _id: "$tier", count: { $sum: 1 } } }],
        avgLTV: [{ $group: { _id: null, avgSpent: { $avg: "$totalSpent" } } }],
        repeatCustomers: [
          { $match: { numOfOrders: { $gt: 1 } } },
          { $count: "count" },
        ],
        // --- ADDED GROWTH CALCULATION ---
        growthData: [
          {
            $group: {
              _id: null,
              thisMonth: {
                $sum: {
                  $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0],
                },
              },
              lastMonth: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ["$createdAt", sixtyDaysAgo] },
                        { $lt: ["$createdAt", thirtyDaysAgo] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  const total = stats[0].totalRitualists[0]?.count || 0;
  const repeat = stats[0].repeatCustomers[0]?.count || 0;
  const growth = stats[0].growthData[0] || { thisMonth: 0, lastMonth: 0 };

  // Calculate Growth Percentage
  const growthRate =
    growth.lastMonth === 0
      ? growth.thisMonth * 100
      : ((growth.thisMonth - growth.lastMonth) / growth.lastMonth) * 100;

  const formattedStats = {
    total: total,
    platinum: stats[0].tierCounts.find((t) => t._id === "Platinum")?.count || 0,
    gold: stats[0].tierCounts.find((t) => t._id === "Gold")?.count || 0,
    silver: stats[0].tierCounts.find((t) => t._id === "Silver")?.count || 0,
    brown: stats[0].tierCounts.find((t) => t._id === "Brown")?.count || 0,
    averageLTV: Math.round(stats[0].avgLTV[0]?.avgSpent || 0),
    retentionRate: total > 0 ? `${((repeat / total) * 100).toFixed(1)}%` : "0%",
    recentGrowth: `${growthRate > 0 ? "+" : ""}${growthRate.toFixed(1)}%`, // This is now dynamic!
  };

  res.status(200).json({
    success: true,
    stats: formattedStats,
  });
});
