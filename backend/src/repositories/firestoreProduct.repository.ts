import type { Firestore } from "firebase-admin/firestore";
import type { Product, ProductAudience, ProductFilters } from "../types/product.js";
import type { ProductRepository } from "./product.repository.js";

export class MalformedProductDocumentError extends Error {
  constructor(documentId: string, reason: string) {
    super(`Malformed product document "${documentId}": ${reason}`);
    this.name = "MalformedProductDocumentError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
const isAudience = (value: unknown): value is ProductAudience =>
  value === "men" || value === "women" || value === "unisex";

export const mapFirestoreProduct = (documentId: string, value: unknown): Product => {
  if (!isRecord(value)) throw new MalformedProductDocumentError(documentId, "data must be an object");

  const stringFields = ["id", "code", "name", "category", "currency", "description", "shortDescription", "image"] as const;
  for (const field of stringFields) {
    if (typeof value[field] !== "string" || value[field].trim() === "") {
      throw new MalformedProductDocumentError(documentId, `${field} must be a non-empty string`);
    }
  }
  if (value.id !== documentId) throw new MalformedProductDocumentError(documentId, "id must match the document ID");
  if (value.currency !== "USD") throw new MalformedProductDocumentError(documentId, "currency must be USD");
  if (!isAudience(value.audience)) throw new MalformedProductDocumentError(documentId, "audience is invalid");
  if (typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0) {
    throw new MalformedProductDocumentError(documentId, "price must be a non-negative number");
  }
  if (!isStringArray(value.images)) throw new MalformedProductDocumentError(documentId, "images must be a string array");
  if (!isStringArray(value.colors)) throw new MalformedProductDocumentError(documentId, "colors must be a string array");
  if (!isNumberArray(value.sizes)) throw new MalformedProductDocumentError(documentId, "sizes must be a number array");
  if (typeof value.isNew !== "boolean") throw new MalformedProductDocumentError(documentId, "isNew must be a boolean");

  return {
    id: value.id as string, code: value.code as string, name: value.name as string,
    category: value.category as string, audience: value.audience, price: value.price,
    currency: "USD", description: value.description as string,
    shortDescription: value.shortDescription as string, image: value.image as string,
    images: value.images, colors: value.colors, sizes: value.sizes, isNew: value.isNew,
  };
};

const matchesFilters = (product: Product, filters: ProductFilters): boolean =>
  (filters.category === undefined || product.category === filters.category) &&
  (filters.audience === undefined || product.audience === filters.audience) &&
  (filters.isNew === undefined || product.isNew === filters.isNew);

export class FirestoreProductRepository implements ProductRepository {
  constructor(private readonly database: Firestore) {}

  async findAll(filters: ProductFilters = {}): Promise<readonly Product[]> {
    const snapshot = await this.database.collection("products").get();
    const mapped = snapshot.docs.map((document) => {
      try {
        return mapFirestoreProduct(document.id, document.data());
      } catch (error) {
        console.error(`Invalid Firestore product document: ${document.id}`);
        throw error;
      }
    });
    return mapped.filter((product) => matchesFilters(product, filters));
  }

  async findById(id: string): Promise<Product | undefined> {
    const document = await this.database.collection("products").doc(id).get();
    if (!document.exists) return undefined;
    try {
      return mapFirestoreProduct(document.id, document.data());
    } catch (error) {
      console.error(`Invalid Firestore product document: ${document.id}`);
      throw error;
    }
  }
}
