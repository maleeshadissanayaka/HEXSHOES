export interface WishlistEntry {
  productId: string;
  addedAt: string;
}

export interface WishlistRepository {
  findAll(uid: string): Promise<WishlistEntry[]>;
  add(uid: string, productId: string): Promise<void>;
  remove(uid: string, productId: string): Promise<void>;
  has(uid: string, productId: string): Promise<boolean>;
}
