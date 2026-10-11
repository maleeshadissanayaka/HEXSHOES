import { cartService } from "../services/cart.service.js";
import { productRepository } from "../repositories/index.js";
import { recommendationService } from "../services/recommendation.service.js";
import { userService } from "../services/user.service.js";
import { visualSearchService } from "../services/visualSearch.service.js";
import { wishlistService } from "../services/wishlist.service.js";
import type { AuthenticatedUser } from "../types/auth.js";
import type { Product } from "../types/product.js";

export class AgentTools {
  async catalog() { return productRepository.findAll(); }
  async resolve(term: string): Promise<Product[]> {
    const normalized = term.toLowerCase().replace(/^hex\s+/, "").trim();
    return (await this.catalog()).filter((product) => product.id.toLowerCase() === normalized || product.code.toLowerCase() === normalized || product.name.toLowerCase() === term.toLowerCase() || product.name.toLowerCase().replace(/^hex\s+/, "") === normalized);
  }
  async products(ids: string[]) { const values = await Promise.all(ids.map((id) => productRepository.findById(id))); return values.filter((item): item is Product => Boolean(item)); }
  async search(query: string) { return (await visualSearchService.text(query, 4)).results.map((item) => item.product); }
  similar(productId: string) { return recommendationService.similar(productId, 3); }
  personalized(uid: string) { return recommendationService.personalized(uid); }
  wishlist(uid: string) { return wishlistService.list(uid); }
  cart(uid: string) { return cartService.list(uid); }
  profile(user: AuthenticatedUser) { return userService.getProfile(user); }
  execute(uid: string, action: { type: string; productId: string; quantity?: number }) {
    if (action.type === "WISHLIST_ADD") return wishlistService.add(uid, action.productId);
    if (action.type === "WISHLIST_REMOVE") return wishlistService.remove(uid, action.productId);
    if (action.type === "CART_ADD") return cartService.add(uid, action.productId, { quantity: action.quantity ?? 1 });
    if (action.type === "CART_REMOVE") return cartService.remove(uid, action.productId);
    if (action.type === "CART_UPDATE") return cartService.update(uid, action.productId, { quantity: action.quantity });
    throw new Error("INVALID_ACTION");
  }
}
export const agentTools = new AgentTools();
