import { agentConfirmationService, type AgentConfirmationService } from "./agent.confirmation.js";
import { parseAgentIntent } from "./agent.intent.js";
import { agentTools, type AgentTools } from "./agent.tools.js";
import type { AgentAction, AgentContext, AgentIntent, AgentResponse } from "./agent.types.js";
import type { AuthenticatedUser } from "../types/auth.js";
import type { Product } from "../types/product.js";

const prompts = ["Show me a trail shoe", "Compare HEX Runner and HEX Trail", "Recommend something for me"];
const contextOf = (intent: AgentIntent, products: readonly Product[] = []) => ({ referencedProductIds: products.slice(0, 4).map(({ id }) => id), lastIntent: intent });
export class AgentOrchestrator {
  constructor(private readonly tools: AgentTools, private readonly confirmations: AgentConfirmationService) {}
  private response(reply: string, intent: AgentIntent, products: readonly Product[] = [], extra: Partial<AgentResponse> = {}): AgentResponse { return { reply, intent, ...(products.length ? { products } : {}), suggestedPrompts: prompts, context: contextOf(intent, products), ...extra }; }
  private auth(intent: AgentIntent) { return this.response(intent.includes("WISHLIST") ? "Sign in to use your saved wishlist." : "Sign in to use your persistent cart and account recommendations.", intent, [], { authRequired: true }); }
  private async resolve(parsedTerms: string[], context: AgentContext, required = 1) {
    const terms = parsedTerms.length ? parsedTerms : context.currentProductId ? [context.currentProductId] : context.referencedProductIds ?? [];
    const resolved: Product[] = [];
    for (const term of terms) { const matches = await this.tools.resolve(term); if (matches.length === 1 && !resolved.some(({ id }) => id === matches[0]!.id)) resolved.push(matches[0]!); }
    return resolved.length >= required ? resolved : [];
  }
  async message(message: string, rawContext: AgentContext, user?: AuthenticatedUser): Promise<AgentResponse> {
    const parsed = parseAgentIntent(message);
    const validContextProducts = await this.tools.products([...(rawContext.referencedProductIds ?? []).slice(0, 4), ...(rawContext.currentProductId ? [rawContext.currentProductId] : [])]);
    const context: AgentContext = { referencedProductIds: validContextProducts.map(({ id }) => id), ...(rawContext.currentProductId && validContextProducts.some(({ id }) => id === rawContext.currentProductId) ? { currentProductId: rawContext.currentProductId } : {}) };
    if (parsed.intent === "HELP") return this.response("I can search the real catalog, compare products, find similar styles, explain recommendations, and help signed-in members manage wishlist and cart actions with confirmation.", parsed.intent);
    if (parsed.intent === "UNSUPPORTED") { const copy = { inventory: "Inventory availability is not tracked yet.", delivery: "Delivery timing is not available yet.", size: "Size availability and fit are not tracked yet.", returns: "A return policy is not available because checkout is not active." }; return this.response(copy[parsed.unsupportedTopic!], parsed.intent); }
    if (parsed.intent === "PRODUCT_SEARCH") {
      let products = await this.tools.search(message);
      if (parsed.maximumPrice !== undefined) products = products.filter(({ price }) => price <= parsed.maximumPrice!);
      if (parsed.category) products = products.filter(({ category }) => category === parsed.category);
      products = products.slice(0, 4);
      return this.response(products.length ? `${products[0]!.name} is the closest grounded catalog match.` : "No catalog products match those supported filters.", parsed.intent, products);
    }
    if (parsed.intent === "PRODUCT_COMPARE") {
      const products = await this.resolve(parsed.productTerms, context, 2);
      if (products.length < 2) return this.response("I need two specific catalog products to compare. Name both styles or first view multiple results.", parsed.intent, products);
      const pair = products.slice(0, 2); const difference = Math.abs(pair[0]!.price - pair[1]!.price); const cheaper = pair[0]!.price === pair[1]!.price ? undefined : pair[0]!.price < pair[1]!.price ? pair[0]! : pair[1]!;
      return this.response(cheaper ? `${cheaper.name} is $${difference.toFixed(0)} less than ${pair.find(({ id }) => id !== cheaper.id)!.name}.` : "The two products have the same illustrative price.", parsed.intent, pair, { comparison: { products: pair, priceDifference: difference, ...(cheaper ? { cheaperProductId: cheaper.id } : {}) } });
    }
    if (parsed.intent === "SIMILAR_PRODUCTS") {
      const source = (await this.resolve(parsed.productTerms, context))[0];
      if (!source) return this.response("Name a catalog product or open its product page so I can find similar styles.", parsed.intent);
      if (parsed.targetUseCase) {
        const products = (await this.tools.search(`${parsed.targetUseCase} shoe`)).filter(({ id }) => id !== source.id).slice(0, 4);
        return this.response(products.length ? `${products[0]!.name} is the closest grounded catalog match for ${parsed.targetUseCase}, relative to ${source.name}.` : `No other catalog products match ${parsed.targetUseCase}.`, parsed.intent, products);
      }
      const results = await this.tools.similar(source.id);
      const products = results.map(({ product }) => product);
      return this.response(`These styles are visually related to ${source.name} using the real CLIP catalog index.`, parsed.intent, products);
    }
    if (parsed.intent === "PERSONALIZED_RECOMMENDATION") { if (!user) { const products = (await this.tools.catalog()).slice(0, 3); return this.response("Sign in for wishlist and cart personalization. Here is honest catalog discovery instead.", parsed.intent, products, { authRequired: true }); } const result = await this.tools.personalized(user.uid); const products = result.results.map(({ product }) => product); return this.response(result.personalized ? "Based only on your saved styles and cart signals." : "You have no wishlist or cart history yet, so these are catalog selections—not personalized recommendations.", parsed.intent, products); }
    if (parsed.intent === "ACCOUNT_STATUS") { if (!user) return this.response("You are not signed in.", parsed.intent, [], { authRequired: true }); const profile = await this.tools.profile(user); return this.response(`You are signed in${profile.displayName ? ` as ${profile.displayName}` : ""}.`, parsed.intent); }
    if (parsed.intent === "WISHLIST_VIEW") { if (!user) return this.auth(parsed.intent); const products = await this.tools.wishlist(user.uid); return this.response(products.length ? `Your wishlist contains ${products.length} ${products.length === 1 ? "style" : "styles"}.` : "Your wishlist is empty.", parsed.intent, products, { wishlistSummary: { products } }); }
    if (parsed.intent === "CART_VIEW") { if (!user) return this.auth(parsed.intent); const lines = await this.tools.cart(user.uid); const itemCount = lines.reduce((sum, item) => sum + item.quantity, 0); const subtotal = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0); return this.response(lines.length ? `Your cart contains ${itemCount} ${itemCount === 1 ? "item" : "items"}.` : "Your cart is empty.", parsed.intent, lines.map(({ product }) => product), { cartSummary: { lines, itemCount, subtotal } }); }
    if (["WISHLIST_ADD", "WISHLIST_REMOVE", "CART_ADD", "CART_REMOVE", "CART_UPDATE"].includes(parsed.intent)) {
      if (!user) return this.auth(parsed.intent);
      const product = (await this.resolve(parsed.productTerms, context))[0]; if (!product) return this.response("Name one catalog product for that action.", parsed.intent);
      if (parsed.intent === "CART_UPDATE" && parsed.quantity === undefined) return this.response("Specify the new cart quantity from 1 to 10.", parsed.intent, [product]);
      const quantity = parsed.intent === "CART_UPDATE" ? parsed.quantity : parsed.intent === "CART_ADD" ? parsed.quantity ?? 1 : undefined;
      if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1 || quantity > 10)) return this.response("Quantity must be from 1 to 10.", parsed.intent, [product]);
      const action: AgentAction = { type: parsed.intent as AgentAction["type"], productId: product.id, ...(quantity === undefined ? {} : { quantity }) };
      const signed = this.confirmations.issue(user.uid, action);
      return this.response(`Confirm ${parsed.intent.toLowerCase().replaceAll("_", " ")} for ${product.name}${quantity ? `, quantity ${quantity}` : ""}.`, parsed.intent, [product], { pendingAction: { ...action, productName: product.name, confirmationToken: signed.token, expiresAt: signed.expiresAt } });
    }
    return this.response("I couldn’t map that request to a supported shopping tool. Ask me to search, compare, find similar styles, or manage a signed-in wishlist or cart.", "UNKNOWN");
  }
  async confirm(token: string, user: AuthenticatedUser): Promise<AgentResponse> { const action = this.confirmations.consume(token, user.uid); await this.tools.execute(user.uid, action); const product = (await this.tools.products([action.productId]))[0]; return this.response(`${product?.name ?? "The product"} was ${action.type.toLowerCase().replaceAll("_", " ")} successfully.`, action.type, product ? [product] : []); }
}
export const agentOrchestrator = new AgentOrchestrator(agentTools, agentConfirmationService);
