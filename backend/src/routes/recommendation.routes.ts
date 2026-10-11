import { Router } from "express";
import { personalizedRecommendations } from "../controllers/recommendation.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const recommendationRouter = Router();
recommendationRouter.get("/", authenticate, personalizedRecommendations);
