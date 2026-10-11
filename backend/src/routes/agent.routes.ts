import { Router } from "express";
import { agentConfirm, agentMessage } from "../controllers/agent.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate.js";
export const agentRouter = Router();
agentRouter.post("/message", optionalAuthenticate, agentMessage);
agentRouter.post("/confirm", authenticate, agentConfirm);
