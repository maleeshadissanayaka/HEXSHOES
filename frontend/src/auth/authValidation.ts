export interface AuthValidationResult { valid: boolean; message: string }
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignIn(email: string, password: string): AuthValidationResult {
  if (!emailPattern.test(email.trim())) return { valid: false, message: "Enter a valid email address." };
  if (password.length < 6) return { valid: false, message: "Password must be at least 6 characters." };
  return { valid: true, message: "" };
}

export function validateRegistration(email: string, password: string, confirmation: string): AuthValidationResult {
  const signIn = validateSignIn(email, password);
  if (!signIn.valid) return signIn;
  if (password !== confirmation) return { valid: false, message: "Passwords must match." };
  return { valid: true, message: "" };
}
