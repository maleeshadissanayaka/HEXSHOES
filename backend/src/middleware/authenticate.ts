import type { RequestHandler } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { verifyFirebaseIdToken } from "../services/tokenVerifier.js";
import type { AuthenticatedUser } from "../types/auth.js";

const bearerPattern = /^Bearer ([^\s]+)$/;
const optionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

export function authenticatedUserFromClaims(claims: DecodedIdToken): AuthenticatedUser {
  const user: AuthenticatedUser = { uid: claims.uid };
  const email = optionalString(claims.email);
  const name = optionalString(claims.name);
  const picture = optionalString(claims.picture);
  const provider = optionalString(claims.firebase?.sign_in_provider);
  if (email) user.email = email;
  if (typeof claims.email_verified === "boolean") user.emailVerified = claims.email_verified;
  if (name) user.name = name;
  if (picture) user.picture = picture;
  if (provider) user.provider = provider;
  return user;
}

export const authenticate: RequestHandler = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (!authorization) {
    response.status(401).json({ success: false, error: { message: "Authentication required" } });
    return;
  }
  const match = bearerPattern.exec(authorization);
  if (!match?.[1]) {
    response.status(401).json({ success: false, error: { message: "Authentication required" } });
    return;
  }
  try {
    request.authUser = authenticatedUserFromClaims(await verifyFirebaseIdToken(match[1]));
    next();
  } catch {
    response.status(401).json({ success: false, error: { message: "Invalid or expired authentication" } });
  }
};
