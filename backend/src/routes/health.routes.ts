import { Router } from "express";
import { getHealth, getStatus } from "../controllers/health.controller.js";

export const healthRouter = Router();
healthRouter.get("/health", getHealth);
healthRouter.get("/status", getStatus);
