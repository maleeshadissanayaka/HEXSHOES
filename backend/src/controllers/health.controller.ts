import type { RequestHandler } from "express";
import { env } from "../config/env.js";

export const getHealth: RequestHandler = (_request, response) => {
  response.status(200).json({
    success: true,
    data: { service: "hexshoes-api", status: "ok", environment: env.nodeEnv },
  });
};

export const getStatus: RequestHandler = (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      backend: "READY", database: "NOT_CONNECTED", authentication: "NOT_CONNECTED",
      aiService: "NOT_CONNECTED", commerce: "FOUNDATION",
    },
  });
};
