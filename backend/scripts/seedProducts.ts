import { getFirestoreDatabase } from "../src/config/firebase.js";
import { products } from "../src/data/products.js";

const seedProducts = async (): Promise<void> => {
  const database = getFirestoreDatabase();
  const batch = database.batch();

  for (const product of products) {
    batch.set(database.collection("products").doc(product.id), product, { merge: true });
  }

  await batch.commit();
  for (const product of products) console.log(`Seeded products/${product.id}`);
  console.log(`Seeded ${products.length} canonical HEXSHOES products`);
};

try {
  await seedProducts();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown seed failure";
  console.error(`Product seed failed: ${message}`);
  process.exitCode = 1;
}
