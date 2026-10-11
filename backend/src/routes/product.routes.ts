import { Router } from "express";
import { getProduct, listProducts } from "../controllers/product.controller.js";
import { similarProducts } from "../controllers/recommendation.controller.js";

export const productRouter = Router();
productRouter.get("/", listProducts);
productRouter.get("/:id/similar", similarProducts);
productRouter.get("/:id", getProduct);
