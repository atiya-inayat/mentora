const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, code: "WEAK_PASSWORD", message: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, code: "WEAK_PASSWORD", message: "Password must include at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, code: "WEAK_PASSWORD", message: "Password must include at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, code: "WEAK_PASSWORD", message: "Password must include at least one number" };
  }

  return { valid: true };
};

export default validatePasswordStrength;
