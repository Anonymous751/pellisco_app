export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

 const options = {
    expires: new Date(
      // Ensure it's a Number, default to 7 days if missing
      Date.now() + (Number(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "lax",
    // Recommended: Use an environment check for security
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token
    });
};
