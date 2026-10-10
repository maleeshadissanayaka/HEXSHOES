import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { productRouter } from "./product.routes.js";
import { authRouter } from "./auth.routes.js";

export const apiRouter = Router();
apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use("/products", productRouter);
