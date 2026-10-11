import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const backendRequire = createRequire(path.join(root, "backend/package.json"));
backendRequire("dotenv").config({ path: path.join(root, "backend/.env"), quiet: true });
const { cert, getApps, initializeApp } = backendRequire("firebase-admin/app");
const { getFirestore } = backendRequire("firebase-admin/firestore");

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

async function main() {
  const app = getApps()[0] ?? initializeApp({ credential: cert({
    projectId: required("FIREBASE_PROJECT_ID"),
    clientEmail: required("FIREBASE_CLIENT_EMAIL"),
    privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  }) });
  const database = getFirestore(app);
  const users = await database.collection("users").get();
  const products = new Map();
  const entry = (productId) => {
    const current = products.get(productId) ?? { wishlistCount: 0, cartUserCount: 0, cartQuantity: 0 };
    products.set(productId, current);
    return current;
  };
  let wishlistItems = 0;
  let cartItems = 0;
  for (const user of users.docs) {
    const [wishlist, cart] = await Promise.all([user.ref.collection("wishlist").get(), user.ref.collection("cart").get()]);
    wishlistItems += wishlist.size;
    cartItems += cart.size;
    wishlist.docs.forEach((document) => { entry(document.id).wishlistCount += 1; });
    cart.docs.forEach((document) => {
      const aggregate = entry(document.id);
      aggregate.cartUserCount += 1;
      const quantity = document.get("quantity");
      if (Number.isInteger(quantity) && quantity > 0) aggregate.cartQuantity += quantity;
    });
  }
  console.log(JSON.stringify({
    privacy: "Aggregate product counts only; no UIDs, emails, names, or document contents are exported.",
    profileDocumentCount: users.size,
    wishlistItemCount: wishlistItems,
    cartItemCount: cartItems,
    products: [...products.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([productId, counts]) => ({ productId, ...counts })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Interaction analytics failed");
  process.exitCode = 1;
});
