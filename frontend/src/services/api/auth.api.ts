import type { User } from "firebase/auth";
import { ApiError, apiGet } from "./apiClient";
import { authenticatedGet } from "./authenticatedRequest";

export interface BackendUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  provider?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseBackendUser(value: unknown): BackendUser {
  if (!isRecord(value) || typeof value.uid !== "string" || value.uid.trim() === "") {
    throw new ApiError("The API returned an invalid authenticated user.");
  }
  const user: BackendUser = { uid: value.uid };
  for (const field of ["email", "name", "picture", "provider"] as const) {
    if (value[field] !== undefined) {
      if (typeof value[field] !== "string") throw new ApiError("The API returned an invalid authenticated user.");
      user[field] = value[field];
    }
  }
  if (value.emailVerified !== undefined) {
    if (typeof value.emailVerified !== "boolean") throw new ApiError("The API returned an invalid authenticated user.");
    user.emailVerified = value.emailVerified;
  }
  return user;
}

export async function getAuthenticatedUser(user: User | null, signal?: AbortSignal): Promise<BackendUser> {
  let response: unknown;
  try { response = await authenticatedGet(user, apiGet, "/me", signal); }
  catch (error) {
    if (!user) throw new ApiError("Sign in is required for this request.", 401, { cause: error });
    throw error;
  }
  if (!isRecord(response) || response.success !== true || !("data" in response)) {
    throw new ApiError("The API returned an invalid authentication response.");
  }
  return parseBackendUser(response.data);
}
