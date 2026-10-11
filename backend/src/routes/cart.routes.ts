import { Router } from "express";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const cartRouter = Router();
cartRouter.use(authenticate);
cartRouter.get("/", getCart);
cartRouter.post("/:productId", addCartItem);
cartRouter.patch("/:productId", updateCartItem);
cartRouter.delete("/:productId", removeCartItem);
cartRouter.delete("/", clearCart);
