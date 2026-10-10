import { Router } from "express";
import { addWishlistProduct, getWishlist, removeWishlistProduct } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const wishlistRouter = Router();
wishlistRouter.use(authenticate);
wishlistRouter.get("/", getWishlist);
wishlistRouter.post("/:productId", addWishlistProduct);
wishlistRouter.delete("/:productId", removeWishlistProduct);
