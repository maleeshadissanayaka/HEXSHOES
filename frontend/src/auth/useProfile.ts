/* oxlint-disable react/set-state-in-effect -- auth transitions intentionally reset remote profile state */
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getProfile, updateProfile, type UserProfile } from "../services/api/profile.api";

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); setMessage(""); return; }
    const controller = new AbortController();
    setLoading(true); setMessage("");
    void getProfile(user, controller.signal)
      .then((next) => { if (!controller.signal.aborted) setProfile(next); })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setMessage("We couldn’t load your saved profile right now.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user]);

  return {
    profile,
    loading,
    message,
    saveDisplayName: async (displayName: string) => {
      if (!user) return;
      setMessage("");
      try { setProfile(await updateProfile(user, displayName)); }
      catch { setMessage("We couldn’t update your profile right now."); throw new Error("Profile update failed"); }
    },
  };
}
