import type { AuthenticatedUser } from "../types/auth.js";
import type { ProfileUpdateInput, UserProfile } from "../types/user.js";

export interface UserRepository {
  findByUid(uid: string): Promise<UserProfile | undefined>;
  upsertFromAuth(user: AuthenticatedUser): Promise<UserProfile>;
  updateProfile(uid: string, input: ProfileUpdateInput): Promise<UserProfile>;
}
