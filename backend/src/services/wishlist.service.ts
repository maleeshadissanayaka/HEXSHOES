import { productRepository, wishlistRepository } from "../repositories/index.js";
import type { ProductRepository } from "../repositories/product.repository.js";
import type { WishlistRepository } from "../repositories/wishlist.repository.js";

export class WishlistService {
  constructor(
    private readonly wishlist: WishlistRepository,
    private readonly products: ProductRepository,
  ) {}

  async list(uid: string) {
    const entries = await this.wishlist.findAll(uid);
    const resolved = await Promise.all(entries.map(({ productId }) => this.products.findById(productId)));
    return resolved.filter((product) => product !== undefined);
  }

  async add(uid: string, productId: string) {
    const normalized = productId.trim();
    const product = normalized ? await this.products.findById(normalized) : undefined;
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (!(await this.wishlist.has(uid, normalized))) await this.wishlist.add(uid, normalized);
    return product;
  }

  async remove(uid: string, productId: string) {
    await this.wishlist.remove(uid, productId);
    return { productId };
  }
}

export const wishlistService = new WishlistService(wishlistRepository, productRepository);
