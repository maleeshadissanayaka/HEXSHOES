import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import type { AuthenticatedUser } from "../types/auth.js";
import type { ProfileUpdateInput, UserProfile } from "../types/user.js";
import type { UserRepository } from "./user.repository.js";

const timestampString = (value: unknown): string =>
  value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();

const profileFromData = (uid: string, data: FirebaseFirestore.DocumentData): UserProfile => {
  const profile: UserProfile = {
    uid,
    createdAt: timestampString(data.createdAt),
    updatedAt: timestampString(data.updatedAt),
  };
  for (const key of ["email", "displayName", "photoURL", "provider"] as const) {
    if (typeof data[key] === "string") profile[key] = data[key];
  }
  return profile;
};

export class FirestoreUserRepository implements UserRepository {
  constructor(private readonly getDatabase: () => Firestore) {}

  async findByUid(uid: string): Promise<UserProfile | undefined> {
    const snapshot = await this.getDatabase().collection("users").doc(uid).get();
    return snapshot.exists ? profileFromData(uid, snapshot.data() ?? {}) : undefined;
  }

  async upsertFromAuth(user: AuthenticatedUser): Promise<UserProfile> {
    const reference = this.getDatabase().collection("users").doc(user.uid);
    await this.getDatabase().runTransaction(async (transaction) => {
      const existing = await transaction.get(reference);
      if (existing.exists) {
        const current = existing.data() ?? {};
        const updates: Record<string, unknown> = {};
        if (user.email && current.email !== user.email) updates.email = user.email;
        if (user.picture && current.photoURL !== user.picture) updates.photoURL = user.picture;
        if (user.provider && current.provider !== user.provider) updates.provider = user.provider;
        if (Object.keys(updates).length > 0) transaction.update(reference, { ...updates, updatedAt: FieldValue.serverTimestamp() });
        return;
      }
      const data: Record<string, unknown> = {
        uid: user.uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (user.email) data.email = user.email;
      if (user.name) data.displayName = user.name;
      if (user.picture) data.photoURL = user.picture;
      if (user.provider) data.provider = user.provider;
      transaction.create(reference, data);
    });
    const profile = await reference.get();
    return profileFromData(user.uid, profile.data() ?? {});
  }

  async updateProfile(uid: string, input: ProfileUpdateInput): Promise<UserProfile> {
    const reference = this.getDatabase().collection("users").doc(uid);
    await reference.set({ displayName: input.displayName, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const updated = await reference.get();
    return profileFromData(uid, updated.data() ?? {});
  }
}
