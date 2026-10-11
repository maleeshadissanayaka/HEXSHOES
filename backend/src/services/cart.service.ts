import { cartRepository, productRepository } from "../repositories/index.js";
import type { CartRepository } from "../repositories/cart.repository.js";
import type { ProductRepository } from "../repositories/product.repository.js";

export const CART_MAX_QUANTITY = 10;

export class CartService {
  constructor(private readonly cart: CartRepository, private readonly products: ProductRepository) {}

  private quantity(value: unknown, fallback?: number): number {
    const quantity = value === undefined ? fallback : value;
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > CART_MAX_QUANTITY) throw new Error("INVALID_QUANTITY");
    return quantity as number;
  }

  private size(value: unknown): string | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "string" || value.trim() === "") throw new Error("INVALID_SIZE");
    return value.trim();
  }

  private async product(productId: string) {
    const normalized = productId.trim();
    const product = normalized ? await this.products.findById(normalized) : undefined;
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product;
  }

  async list(uid: string) {
    const entries = await this.cart.findAll(uid);
    const resolved = await Promise.all(entries.map(async (entry) => ({ entry, product: await this.products.findById(entry.productId) })));
    return resolved.filter((item) => item.product !== undefined).map(({ entry, product }) => ({ product: product!, quantity: entry.quantity, ...(entry.size ? { size: entry.size } : {}) }));
  }

  async add(uid: string, productId: string, input: { quantity?: unknown; size?: unknown } = {}) {
    const product = await this.product(productId);
    const entry = await this.cart.add(uid, product.id, this.quantity(input.quantity, 1), CART_MAX_QUANTITY, this.size(input.size));
    return { product, quantity: entry.quantity, ...(entry.size ? { size: entry.size } : {}) };
  }

  async update(uid: string, productId: string, input: { quantity?: unknown; size?: unknown }) {
    const product = await this.product(productId);
    const entry = await this.cart.setQuantity(uid, product.id, this.quantity(input.quantity), this.size(input.size));
    return { product, quantity: entry.quantity, ...(entry.size ? { size: entry.size } : {}) };
  }

  async remove(uid: string, productId: string) { const product = await this.product(productId); await this.cart.remove(uid, product.id); return { productId: product.id }; }
  async clear(uid: string) { await this.cart.clear(uid); return { cleared: true }; }
}

export const cartService = new CartService(cartRepository, productRepository);
