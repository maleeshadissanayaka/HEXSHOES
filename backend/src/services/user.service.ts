import type { UserRepository } from "../repositories/user.repository.js";
import { userRepository } from "../repositories/index.js";
import type { AuthenticatedUser } from "../types/auth.js";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  ensureProfile(user: AuthenticatedUser) {
    return this.repository.upsertFromAuth(user);
  }

  getProfile(user: AuthenticatedUser) {
    return this.repository.upsertFromAuth(user);
  }

  async updateDisplayName(user: AuthenticatedUser, displayName: string) {
    const normalized = displayName.trim();
    if (normalized.length < 1 || normalized.length > 80) {
      throw new Error("INVALID_DISPLAY_NAME");
    }
    await this.repository.upsertFromAuth(user);
    return this.repository.updateProfile(user.uid, { displayName: normalized });
  }
}

export const userService = new UserService(userRepository);
