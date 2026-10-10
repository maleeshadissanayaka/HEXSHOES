import type { RequestHandler } from "express";
import { userService } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const requireUser = (request: Parameters<RequestHandler>[0]) => request.authUser;

export const getProfile = asyncHandler(async (request, response) => {
  const user = requireUser(request);
  if (!user) { response.status(401).json({ success: false, error: { message: "Authentication required" } }); return; }
  response.status(200).json({ success: true, data: await userService.getProfile(user) });
});

export const updateProfile = asyncHandler(async (request, response) => {
  const user = requireUser(request);
  if (!user) { response.status(401).json({ success: false, error: { message: "Authentication required" } }); return; }
  const body = request.body as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ success: false, error: { message: "A valid profile update is required" } }); return;
  }
  const record = body as Record<string, unknown>;
  if (Object.keys(record).some((key) => key !== "displayName") || typeof record.displayName !== "string") {
    response.status(400).json({ success: false, error: { message: "Only displayName can be updated" } }); return;
  }
  try {
    response.status(200).json({ success: true, data: await userService.updateDisplayName(user, record.displayName) });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_DISPLAY_NAME") {
      response.status(400).json({ success: false, error: { message: "Display name must be between 1 and 80 characters" } }); return;
    }
    throw error;
  }
});
