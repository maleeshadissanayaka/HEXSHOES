import type { RequestHandler } from "express";
import { userService } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCurrentUser: RequestHandler = asyncHandler(async (request, response) => {
  if (!request.authUser) {
    response.status(401).json({ success: false, error: { message: "Authentication required" } });
    return;
  }
  await userService.ensureProfile(request.authUser);
  response.status(200).json({ success: true, data: request.authUser });
});
