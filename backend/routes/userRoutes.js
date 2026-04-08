import express from "express";
import passport from "passport";

import {
  registerUser,
  verifyEmailOTP,
  loginUser,
  logout,
  resendEmailOTP,
  requestPasswordReset,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  verifyEmailOTPLogin,
  requestEmailOTP,
  getAdminAllUsers,
  getAdminSingleUser,
  deleteUserProfileByAdmin,
  searchUsersByAdmin,
  updateUserByAdmin,
  adminChangeUserPassword,
  updateUserAccountStatus,
  getUserActivityLogs,
  getMyActivityLogs,
  sendContactInquiry,
  getCustomerStats,
  updateProfileImage,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  loginVerify2FA,
  verifyUserEmailAdmin,
  updateUserRole,
} from "../controllers/userController.js";

import { roleBasedAccess, verifyUserAuth } from "../middlewares/userAuth.js";
import { loginLimiter, authLimiter } from "../middlewares/rateLimiter.js";
import { activityLogger } from "../middlewares/activityLogger.js";

const router = express.Router();

/* ========================================================================
   🔐 MIDDLEWARE GROUPS
======================================================================== */
const protect = verifyUserAuth;
const admin = [verifyUserAuth, roleBasedAccess("admin")];

/* ========================================================================
   🌐 PUBLIC ROUTES
======================================================================== */

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = req.user.getJWTToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: (Number(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Public APIs
router.post("/contact/send", sendContactInquiry);

/* ========================================================================
   🔑 AUTH ROUTES
======================================================================== */

router.post("/auth/register", registerUser);

router.post("/auth/verify-email", verifyEmailOTP);

router.post("/auth/resend-otp", authLimiter, resendEmailOTP);

router.post("/auth/login", loginLimiter, activityLogger("LOGIN"), loginUser);

// ✅ FIXED (IMPORTANT)
router.post("/auth/logout", verifyUserAuth, activityLogger("LOGOUT"), logout);

router.post("/auth/otp/request", authLimiter, requestEmailOTP);

router.post("/auth/otp/verify", authLimiter, verifyEmailOTPLogin);

router.post("/auth/password/forgot", authLimiter, requestPasswordReset);

router.put("/auth/password/reset/:token", resetPassword);

router.post("/auth/login/2fa", loginVerify2FA);

/* ========================================================================
   👤 USER ROUTES (ALL PROTECTED)
======================================================================== */

router.get("/me", protect, getUserDetails);

router.put("/me/update", protect, updateProfile);

router.put("/me/update/avatar", protect, updateProfileImage);

router.put("/me/password/update", protect, updatePassword);

router.get("/me/activity-logs", protect, getMyActivityLogs);

// 2FA
router.post("/me/2fa/setup", protect, setup2FA);

router.post("/me/2fa/verify", protect, verifyAndEnable2FA);

router.post("/me/2fa/disable", protect, disable2FA);

/* ========================================================================
   🛡️ ADMIN ROUTES (PROTECTED + ROLE)
======================================================================== */

router.get("/admin/stats/customers", admin, getCustomerStats);

router.get("/admin/users", admin, getAdminAllUsers);

router.get("/admin/users/search", admin, searchUsersByAdmin);

router.patch("/admin/users/:id/status", admin, updateUserAccountStatus);

router.patch("/admin/users/:id/role", admin, updateUserRole);

router.patch("/admin/users/:id/verify-email", admin, verifyUserEmailAdmin);

router.patch("/admin/users/:id/password", admin, adminChangeUserPassword);

router.get("/admin/users/:id/activity-logs", admin, getUserActivityLogs);

// CRUD
router
  .route("/admin/users/:id")
  .get(admin, getAdminSingleUser)
  .put(admin, updateUserByAdmin)
  .delete(admin, deleteUserProfileByAdmin);

export default router;
