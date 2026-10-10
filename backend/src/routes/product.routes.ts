import { Router } from "express";
import { getProduct, listProducts } from "../controllers/product.controller.js";

export const productRouter = Router();
productRouter.get("/", listProducts);
productRouter.get("/:id", getProduct);
