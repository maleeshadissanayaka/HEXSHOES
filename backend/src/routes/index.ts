import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { productRouter } from "./product.routes.js";

export const apiRouter = Router();
apiRouter.use(healthRouter);
apiRouter.use("/products", productRouter);
