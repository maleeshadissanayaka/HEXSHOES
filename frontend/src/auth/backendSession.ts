import type { BackendUser } from "../services/api/auth.api";

export type BackendSessionState =
  | { status: "idle" | "loading"; user: null; message: "" }
  | { status: "verified"; user: BackendUser; message: "" }
  | { status: "error"; user: null; message: string };

export const initialBackendSession: BackendSessionState = { status: "idle", user: null, message: "" };
export const loadingBackendSession = (): BackendSessionState => ({ status: "loading", user: null, message: "" });
export const verifiedBackendSession = (user: BackendUser): BackendSessionState => ({ status: "verified", user, message: "" });
export const failedBackendSession = (): BackendSessionState => ({
  status: "error", user: null, message: "We couldn’t verify the secure backend session right now.",
});
