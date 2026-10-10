import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, firebaseConfigured } from "../config/firebase";
import { friendlyAuthError, isPopupDismissal } from "./authErrors";
import { AuthContext } from "./useAuth";

const unavailable = "Firebase Auth is not configured for this environment.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    const authInstance = auth;
    if (!authInstance) return;
    let active = true;
    let unsubscribe = () => {};
    void setPersistence(authInstance, browserLocalPersistence)
      .then(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(authInstance, (nextUser) => {
        if (active) { setUser(nextUser); setLoading(false); }
        }, () => { if (active) setLoading(false); });
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; unsubscribe(); };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authenticated: user !== null,
    configured: firebaseConfigured,
    signUpWithEmail: async (email: string, password: string) => {
      if (!auth) throw new Error(unavailable);
      try { await createUserWithEmailAndPassword(auth, email.trim(), password); }
      catch (error) { throw new Error(friendlyAuthError(error)); }
    },
    signInWithEmail: async (email: string, password: string) => {
      if (!auth) throw new Error(unavailable);
      try { await signInWithEmailAndPassword(auth, email.trim(), password); }
      catch (error) { throw new Error(friendlyAuthError(error)); }
    },
    signInWithGoogle: async () => {
      if (!auth) throw new Error(unavailable);
      try { await signInWithPopup(auth, new GoogleAuthProvider()); }
      catch (error) {
        if (isPopupDismissal(error)) return;
        throw new Error(friendlyAuthError(error));
      }
    },
    signOutUser: async () => {
      if (!auth) return;
      try { await signOut(auth); }
      catch (error) { throw new Error(friendlyAuthError(error)); }
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
