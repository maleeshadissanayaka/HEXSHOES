import type { User } from "firebase/auth";
import { ApiError } from "./apiClient";
import { authenticatedApiRequest } from "./auth.api";

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

function parseProfileResponse(value: unknown): UserProfile {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) throw new ApiError("The API returned an invalid profile response.");
  const data = value.data;
  if (typeof data.uid !== "string" || typeof data.createdAt !== "string" || typeof data.updatedAt !== "string") throw new ApiError("The API returned an invalid profile.");
  const profile: UserProfile = { uid: data.uid, createdAt: data.createdAt, updatedAt: data.updatedAt };
  for (const key of ["email", "displayName", "photoURL", "provider"] as const) {
    if (data[key] !== undefined) {
      if (typeof data[key] !== "string") throw new ApiError("The API returned an invalid profile.");
      profile[key] = data[key];
    }
  }
  return profile;
}

export async function getProfile(user: User, signal?: AbortSignal) {
  return parseProfileResponse(await authenticatedApiRequest(user, "/profile", { signal }));
}

export async function updateProfile(user: User, displayName: string) {
  return parseProfileResponse(await authenticatedApiRequest(user, "/profile", { method: "PATCH", body: { displayName } }));
}
