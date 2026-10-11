import type { CartLine } from "../types/product";

export const CART_MAX_QUANTITY = 10;
export const clampCartQuantity = (quantity: number) => Math.min(CART_MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));

export function addLocalCartLine(cart: readonly CartLine[], product: CartLine["product"], size: string, quantity: number): CartLine[] {
  const existing = cart.find((line) => line.product.id === product.id);
  return existing
    ? cart.map((line) => line.product.id === product.id ? { ...line, size, quantity: clampCartQuantity(line.quantity + quantity) } : line)
    : [...cart, { product, size, quantity: clampCartQuantity(quantity) }];
}

export const updateLocalCartLine = (cart: readonly CartLine[], productId: string, quantity: number): CartLine[] =>
  cart.map((line) => line.product.id === productId ? { ...line, quantity: clampCartQuantity(quantity) } : line);

export const removeLocalCartLine = (cart: readonly CartLine[], productId: string): CartLine[] =>
  cart.filter((line) => line.product.id !== productId);

export function mergeCartLines(remote: readonly CartLine[], guest: readonly CartLine[]): CartLine[] {
  return guest.reduce<CartLine[]>((current, line) => addLocalCartLine(current, line.product, line.size, line.quantity), [...remote]);
}

export const cartTotal = (cart: readonly CartLine[]) => cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
