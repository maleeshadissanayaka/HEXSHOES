import type { RequestHandler } from "express";

export const getCurrentUser: RequestHandler = (request, response) => {
  if (!request.authUser) {
    response.status(401).json({ success: false, error: { message: "Authentication required" } });
    return;
  }
  response.status(200).json({ success: true, data: request.authUser });
};
