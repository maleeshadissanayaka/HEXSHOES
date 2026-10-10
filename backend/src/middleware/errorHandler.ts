import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (env.nodeEnv !== "test") console.error(error);
  response.status(500).json({ success: false, error: { message: "Internal server error" } });
};
