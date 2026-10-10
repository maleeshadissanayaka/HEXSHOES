import { createContext, useContext } from "react";
import type { ExperienceDialog } from "../types/experience";
import type { CartLine, Product } from "../types/product";
export const ExperienceContext = createContext<{
  open: (dialog: ExperienceDialog) => void;
  close: () => void;
  cart: CartLine[];
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  addToCart: (
    product: Product,
    size: string,
    quantity: number,
  ) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  removeCartItem: (productId: string, size: string) => void;
  removeWishlistItem: (productId: string) => void;
} | null>(null);
export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context)
    throw new Error("Experience components require ExperienceProvider");
  return context;
}
