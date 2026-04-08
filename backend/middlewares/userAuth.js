import handleAsyncError from "../middlewares/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * @description Protects routes by verifying the JWT token from cookies
 */
export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log("Cookies:", req.cookies);

  if (!token) {
    return next(new HandleError("Authentication is missing!", 401));
  }

  // If jwt.verify fails, handleAsyncError will automatically catch it and call next(err)
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decodedData.id);

  if (!user) {
    return next(new HandleError("User no longer exists.", 404));
  }

  req.user = user; // Attach the full user object
  next();
});
/**
 * @description Restricts access based on user roles (e.g., 'admin')
 * @param {...string} roles - Allowed roles
 */
export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log("❌ ACCESS DENIED: Role mismatch");
      return next(
        new HandleError(
          `Access Denied: ${req.user?.role || "Guest"} role is not authorized.`,
          403
        )
      );
    }

    // console.log("✅ ACCESS GRANTED");
    next();
  };
};
