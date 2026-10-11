export interface CartEntry {
  productId: string;
  quantity: number;
  size?: string;
  addedAt: string;
  updatedAt: string;
}

export interface CartRepository {
  findAll(uid: string): Promise<CartEntry[]>;
  setQuantity(uid: string, productId: string, quantity: number, size?: string): Promise<CartEntry>;
  add(uid: string, productId: string, quantity: number, maximum: number, size?: string): Promise<CartEntry>;
  remove(uid: string, productId: string): Promise<void>;
  clear(uid: string): Promise<void>;
}
