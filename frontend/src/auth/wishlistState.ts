export const dedupeWishlistIds = (ids: readonly string[]): string[] => [...new Set(ids)];
export const mergeWishlistIds = (remote: readonly string[], guest: readonly string[]): string[] => dedupeWishlistIds([...remote, ...guest]);
export const toggleWishlistId = (ids: readonly string[], productId: string): string[] =>
  ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
