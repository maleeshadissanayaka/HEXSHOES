import type { FootwearStyle, Product, ProductAudience } from "../../types/product";

type ApiProduct = Omit<Product, "style">;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const isNumbers = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
const isAudience = (value: unknown): value is ProductAudience =>
  value === "men" || value === "women" || value === "unisex";

function styleFor(category: string, image: string): FootwearStyle {
  const value = `${category} ${image}`.toLowerCase();
  if (value.includes("trail")) return "trail";
  if (value.includes("slide")) return "slide";
  if (value.includes("lifestyle") || value.includes("mono")) return "mono";
  return "runner";
}

export function adaptProduct(value: unknown): Product {
  if (!isRecord(value)) throw new Error("Product must be an object.");
  const strings = ["id", "code", "name", "category", "description", "shortDescription", "image"] as const;
  if (strings.some((key) => typeof value[key] !== "string" || value[key].trim() === "") ||
      value.currency !== "USD" || !isAudience(value.audience) ||
      typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0 ||
      !isStrings(value.images) || !isStrings(value.colors) || !isNumbers(value.sizes) ||
      typeof value.isNew !== "boolean") {
    throw new Error("Product does not match the API contract.");
  }
  const product = value as unknown as ApiProduct;
  return { ...product, style: styleFor(product.category, product.image) };
}
