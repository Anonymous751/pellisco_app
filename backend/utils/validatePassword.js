
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
  return passwordRegex.test(password);
};

export const getPasswordValidationMessage = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must include at least one number";
  if (!/[@$!%*?&]/.test(password)) return "Password must include at least one special character (@$!%*?&)";
  return null; // valid password
};
