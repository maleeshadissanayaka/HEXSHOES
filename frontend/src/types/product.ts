export type FootwearStyle = "runner" | "trail" | "slide" | "mono";
export type ProductAudience = "men" | "women" | "unisex";
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  audience: ProductAudience;
  price: number;
  currency: "USD";
  description: string;
  shortDescription: string;
  image: string;
  images: readonly string[];
  colors: readonly string[];
  sizes: readonly number[];
  isNew: boolean;
  style: FootwearStyle;
}

export interface CartLine {
  product: Product;
  size: string;
  quantity: number;
}
