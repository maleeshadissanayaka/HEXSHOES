export type ProductAudience = "men" | "women" | "unisex";
export type ProductCurrency = "USD";

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  audience: ProductAudience;
  price: number;
  currency: ProductCurrency;
  description: string;
  shortDescription: string;
  image: string;
  images: readonly string[];
  colors: readonly string[];
  sizes: readonly number[];
  isNew: boolean;
}

export interface ProductFilters {
  category?: string;
  audience?: ProductAudience;
  isNew?: boolean;
}
