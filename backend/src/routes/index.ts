import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { productRouter } from "./product.routes.js";
import { authRouter } from "./auth.routes.js";
import { profileRouter } from "./profile.routes.js";
import { wishlistRouter } from "./wishlist.routes.js";
import { cartRouter } from "./cart.routes.js";

export const apiRouter = Router();
apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/products", productRouter);
