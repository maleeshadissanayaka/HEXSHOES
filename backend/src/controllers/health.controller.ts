import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { databaseStatus } from "../repositories/index.js";

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
      backend: "READY", database: databaseStatus, authentication: "NOT_CONNECTED",
      aiService: "NOT_CONNECTED", commerce: "FOUNDATION",
    },
  });
};
