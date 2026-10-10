import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getAuthenticatedUser } from "../services/api/auth.api";
import { failedBackendSession, initialBackendSession, loadingBackendSession, verifiedBackendSession, type BackendSessionState } from "./backendSession";

export function useBackendSession(user: User | null): BackendSessionState {
  const [state, setState] = useState<BackendSessionState>(initialBackendSession);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    // A new Firebase user must not display the previous user's backend state.
    // oxlint-disable-next-line react-hooks/set-state-in-effect
    setState(loadingBackendSession());
    getAuthenticatedUser(user, controller.signal)
      .then((backendUser) => setState(verifiedBackendSession(backendUser)))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setState(failedBackendSession());
      });
    return () => controller.abort();
  }, [user]);
  return user ? state : initialBackendSession;
}
