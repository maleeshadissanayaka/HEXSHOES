import { getFirestoreDatabase } from "../config/firebase.js";
import { env } from "../config/env.js";
import { FirestoreProductRepository } from "./firestoreProduct.repository.js";
import { FixtureProductRepository } from "./fixtureProduct.repository.js";
import type { ProductRepository } from "./product.repository.js";

export type DatabaseStatus = "FIXTURE" | "FIRESTORE_CONNECTED";

const createProductRepository = (): { repository: ProductRepository; status: DatabaseStatus } => {
  if (env.productDataSource === "firestore") {
    return {
      repository: new FirestoreProductRepository(getFirestoreDatabase()),
      status: "FIRESTORE_CONNECTED",
    };
  }
  return { repository: new FixtureProductRepository(), status: "FIXTURE" };
};

const selection = createProductRepository();
export const productRepository = selection.repository;
export const databaseStatus = selection.status;
