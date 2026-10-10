import type { User } from "firebase/auth";
export type AccountViewState = "loading" | "signed-out" | "signed-in";
export const accountViewState = (loading: boolean, user: User | null): AccountViewState =>
  loading ? "loading" : user ? "signed-in" : "signed-out";

export function providerLabel(user: User): string {
  const providers = new Set(user.providerData.map(({ providerId }) => providerId));
  if (providers.has("google.com")) return "Google";
  if (providers.has("password")) return "Email and password";
  return "Firebase Authentication";
}
