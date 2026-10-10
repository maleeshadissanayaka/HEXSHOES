const codeOf = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;

export function isPopupDismissal(error: unknown): boolean {
  const code = codeOf(error);
  return code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request";
}

export function friendlyAuthError(error: unknown): string {
  switch (codeOf(error)) {
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "We couldn’t sign you in with those details.";
    case "auth/email-already-in-use":
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Use a stronger password.";
    case "auth/network-request-failed":
      return "We couldn’t reach account services. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not available yet.";
    default:
      return "We couldn’t complete that account request right now.";
  }
}
