import type { Product } from "../types/product.js";

export type AgentIntent = "PRODUCT_SEARCH" | "PRODUCT_COMPARE" | "SIMILAR_PRODUCTS" | "PERSONALIZED_RECOMMENDATION" | "WISHLIST_VIEW" | "WISHLIST_ADD" | "WISHLIST_REMOVE" | "CART_VIEW" | "CART_ADD" | "CART_REMOVE" | "CART_UPDATE" | "ACCOUNT_STATUS" | "HELP" | "UNSUPPORTED" | "UNKNOWN";
export type AgentActionType = "WISHLIST_ADD" | "WISHLIST_REMOVE" | "CART_ADD" | "CART_REMOVE" | "CART_UPDATE";
export interface AgentContext { currentProductId?: string; referencedProductIds?: string[]; lastIntent?: AgentIntent }
export interface ParsedIntent { intent: AgentIntent; quantity?: number; maximumPrice?: number; category?: string; targetUseCase?: string; productTerms: string[]; unsupportedTopic?: "inventory" | "delivery" | "size" | "returns" }
export interface PendingAction { type: AgentActionType; productId: string; productName: string; quantity?: number; confirmationToken: string; expiresAt: string }
export interface AgentResponse { reply: string; intent: AgentIntent; products?: readonly Product[]; comparison?: { products: readonly Product[]; priceDifference: number; cheaperProductId?: string }; cartSummary?: { lines: Array<{ product: Product; quantity: number; size?: string }>; itemCount: number; subtotal: number }; wishlistSummary?: { products: readonly Product[] }; pendingAction?: PendingAction; suggestedPrompts: string[]; context: { referencedProductIds: string[]; lastIntent: AgentIntent }; authRequired?: boolean }
export interface AgentAction { type: AgentActionType; productId: string; quantity?: number }
