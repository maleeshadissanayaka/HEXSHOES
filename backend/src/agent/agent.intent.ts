import type { AgentIntent, ParsedIntent } from "./agent.types.js";

const productTerms = (message: string) => {
  const matches = message.match(/(?:hex\s+)?(?:runner|trail|slide|mono)|hx-0[1-4]/gi) ?? [];
  return [...new Set(matches.map((item) => item.toLowerCase().replace(/\s+/g, " ")))];
};
export function parseAgentIntent(message: string): ParsedIntent {
  const text = message.trim().toLowerCase();
  const quantityMatch = text.match(/(?:quantity\s*(?:to|of)?|\bto|\bx)\s*(\d+)\b/) ?? text.match(/\b(\d+)\s+(?:hex\s+)?(?:runners?|trails?|slides?|monos?)\b/);
  const priceMatch = text.match(/(?:under|below|less than|max(?:imum)?)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
  const quantity = quantityMatch ? Number(quantityMatch[1]) : undefined;
  const maximumPrice = priceMatch ? Number(priceMatch[1]) : undefined;
  const category = ["running", "trail", "slides", "lifestyle"].find((item) => text.includes(item));
  const terms = productTerms(text);
  const useCaseMatch = text.match(/\b(?:better\s+for|more\s+suitable\s+for|suitable\s+for|but\s+for|for)\s+([a-z][a-z\s-]*?)(?=\s+(?:under|below|less\s+than|max(?:imum)?)\b|[?.!,]|$)/);
  const targetUseCase = useCaseMatch?.[1]?.trim();
  const explicitProductDiscovery = terms.length > 0 && (
    /\b(?:similar|like)\b/.test(text)
    || /\b(?:better\s+for|more\s+suitable\s+for|suitable\s+for|but\s+for)\b/.test(text)
    || Boolean(targetUseCase && targetUseCase !== "me")
  );
  const cartMentioned = /\bcart\b|\bbag\b/.test(text);
  const quantityUpdate = /\b(change|set|update|make)\b/.test(text) && (/\bquantity\b/.test(text) || /(?:runner|trail|slide|mono|hx-0[1-4]).*\bto\s*(?:quantity\s*)?\d+\b/.test(text));
  const wantedCartQuantity = /\bi want\s+\d+\s+(?:hex\s+)?(?:runners?|trails?|slides?|monos?)\s+in my (?:cart|bag)\b/.test(text);
  let intent: AgentIntent = "UNKNOWN";
  let unsupportedTopic: ParsedIntent["unsupportedTopic"];
  if (/\b(stock|available|availability|inventory)\b/.test(text)) { intent = "UNSUPPORTED"; unsupportedTopic = "inventory"; }
  else if (/\b(arrive|delivery|deliver|shipping)\b/.test(text)) { intent = "UNSUPPORTED"; unsupportedTopic = "delivery"; }
  else if (/\breturn policy|returns?\b/.test(text)) { intent = "UNSUPPORTED"; unsupportedTopic = "returns"; }
  else if (/\b(size|fit)\b/.test(text)) { intent = "UNSUPPORTED"; unsupportedTopic = "size"; }
  else if (/\b(help|what can you do|capabilities)\b/.test(text)) intent = "HELP";
  else if (/\b(am i signed in|account|what name)\b/.test(text)) intent = "ACCOUNT_STATUS";
  else if (/\b(compare|difference|cheaper|which one)\b/.test(text)) intent = "PRODUCT_COMPARE";
  else if (explicitProductDiscovery || /\b(similar|like this|like it)\b/.test(text)) intent = "SIMILAR_PRODUCTS";
  else if (/\b(recommend|for me|personalized)\b/.test(text)) intent = "PERSONALIZED_RECOMMENDATION";
  else if (/wishlist|saved styles/.test(text)) intent = /\b(add|save)\b/.test(text) ? "WISHLIST_ADD" : /\b(remove|delete)\b/.test(text) ? "WISHLIST_REMOVE" : "WISHLIST_VIEW";
  else if (cartMentioned && /\b(remove|delete)\b/.test(text)) intent = "CART_REMOVE";
  else if (cartMentioned && /\b(add|put)\b/.test(text)) intent = "CART_ADD";
  else if (quantityUpdate || wantedCartQuantity) intent = "CART_UPDATE";
  else if (cartMentioned) intent = "CART_VIEW";
  else if (/\b(show|find|need|looking|shoe|sneaker|slide|new|under|below)\b/.test(text)) intent = "PRODUCT_SEARCH";
  return { intent, ...(quantity === undefined ? {} : { quantity }), ...(maximumPrice === undefined ? {} : { maximumPrice }), ...(category ? { category } : {}), ...(targetUseCase && targetUseCase !== "me" ? { targetUseCase } : {}), productTerms: terms, ...(unsupportedTopic ? { unsupportedTopic } : {}) };
}
