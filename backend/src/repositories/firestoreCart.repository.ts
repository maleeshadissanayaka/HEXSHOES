import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import type { CartEntry, CartRepository } from "./cart.repository.js";

const iso = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();

export class FirestoreCartRepository implements CartRepository {
  constructor(private readonly getDatabase: () => Firestore) {}

  private collection(uid: string) {
    return this.getDatabase().collection("users").doc(uid).collection("cart");
  }

  async findAll(uid: string): Promise<CartEntry[]> {
    const snapshot = await this.collection(uid).orderBy("updatedAt", "desc").get();
    return snapshot.docs.map((document) => ({
      productId: document.id,
      quantity: document.get("quantity"),
      ...(typeof document.get("size") === "string" ? { size: document.get("size") as string } : {}),
      addedAt: iso(document.get("addedAt")),
      updatedAt: iso(document.get("updatedAt")),
    }));
  }

  async setQuantity(uid: string, productId: string, quantity: number, size?: string): Promise<CartEntry> {
    const reference = this.collection(uid).doc(productId);
    await this.getDatabase().runTransaction(async (transaction) => {
      const existing = await transaction.get(reference);
      transaction.set(reference, {
        productId, quantity, ...(size === undefined ? {} : { size }),
        updatedAt: FieldValue.serverTimestamp(),
        ...(existing.exists ? {} : { addedAt: FieldValue.serverTimestamp() }),
      }, { merge: true });
    });
    return { productId, quantity, ...(size === undefined ? {} : { size }), addedAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() };
  }

  async add(uid: string, productId: string, quantity: number, maximum: number, size?: string): Promise<CartEntry> {
    const database = this.getDatabase();
    const reference = this.collection(uid).doc(productId);
    const nextQuantity = await database.runTransaction(async (transaction) => {
      const existing = await transaction.get(reference);
      const current = existing.exists && Number.isInteger(existing.get("quantity")) ? existing.get("quantity") as number : 0;
      const next = Math.min(maximum, current + quantity);
      transaction.set(reference, {
        productId,
        quantity: next,
        ...(size === undefined ? {} : { size }),
        updatedAt: FieldValue.serverTimestamp(),
        ...(existing.exists ? {} : { addedAt: FieldValue.serverTimestamp() }),
      }, { merge: true });
      return next;
    });
    return { productId, quantity: nextQuantity, ...(size === undefined ? {} : { size }), addedAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() };
  }

  async remove(uid: string, productId: string): Promise<void> {
    await this.collection(uid).doc(productId).delete();
  }

  async clear(uid: string): Promise<void> {
    const snapshot = await this.collection(uid).get();
    if (snapshot.empty) return;
    const batch = this.getDatabase().batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}
