import type { User } from "firebase/auth";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  configured: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}
