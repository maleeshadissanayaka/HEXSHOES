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
      backend: { process: "healthy" },
      productDataSource: databaseStatus,
      firebase: {
        configured: Boolean(env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey),
        connectivity: "not-probed",
      },
      aiService: { configured: true, connectivity: "not-probed" },
      commerce: "foundation-only",
    },
  });
};
