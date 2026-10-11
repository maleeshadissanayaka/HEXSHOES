export const excludeRecommendationProduct = <T extends { product: { id: string } }>(items: T[], productId: string) => items.filter((item) => item.product.id !== productId);
export const recommendationHeading = (personalized: boolean) => personalized ? "Recommended for you." : "Catalog discovery.";
export const recommendationDisclosure = (personalized: boolean) => personalized
  ? "Based only on products in your saved styles and cart."
  : "No wishlist or cart history yet; these are deterministic catalog selections, not personalized recommendations.";
