import type { RequestHandler } from "express";
import { authenticatedUserFromClaims } from "./authenticate.js";
import { verifyFirebaseIdToken } from "../services/tokenVerifier.js";
const bearer = /^Bearer ([^\s]+)$/;
export const optionalAuthenticate: RequestHandler = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (!authorization) { next(); return; }
  const token = bearer.exec(authorization)?.[1];
  if (!token) { response.status(401).json({ success: false, error: { message: "Invalid or expired authentication" } }); return; }
  try { request.authUser = authenticatedUserFromClaims(await verifyFirebaseIdToken(token)); next(); }
  catch { response.status(401).json({ success: false, error: { message: "Invalid or expired authentication" } }); }
};
