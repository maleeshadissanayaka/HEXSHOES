import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import type { WishlistEntry, WishlistRepository } from "./wishlist.repository.js";

export class FirestoreWishlistRepository implements WishlistRepository {
  constructor(private readonly getDatabase: () => Firestore) {}

  private collection(uid: string) {
    return this.getDatabase().collection("users").doc(uid).collection("wishlist");
  }

  async findAll(uid: string): Promise<WishlistEntry[]> {
    const snapshot = await this.collection(uid).orderBy("addedAt", "desc").get();
    return snapshot.docs.map((document) => {
      const addedAt = document.get("addedAt");
      return {
        productId: document.id,
        addedAt: addedAt instanceof Timestamp ? addedAt.toDate().toISOString() : new Date(0).toISOString(),
      };
    });
  }

  async add(uid: string, productId: string): Promise<void> {
    await this.collection(uid).doc(productId).set(
      { productId, addedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }

  async remove(uid: string, productId: string): Promise<void> {
    await this.collection(uid).doc(productId).delete();
  }

  async has(uid: string, productId: string): Promise<boolean> {
    return (await this.collection(uid).doc(productId).get()).exists;
  }
}
