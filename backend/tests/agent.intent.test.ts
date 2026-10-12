import { describe, expect, it } from "vitest";
import { parseAgentIntent } from "../src/agent/agent.intent.js";

describe("agent intent parsing", () => {
  it.each([
    ["show me running shoes", "PRODUCT_SEARCH"], ["compare HEX Runner and HEX Trail", "PRODUCT_COMPARE"], ["show me something similar", "SIMILAR_PRODUCTS"],
    ["recommend something for me", "PERSONALIZED_RECOMMENDATION"], ["what is in my wishlist", "WISHLIST_VIEW"], ["add HEX Trail to my wishlist", "WISHLIST_ADD"],
    ["remove runner from my wishlist", "WISHLIST_REMOVE"], ["what is in my cart", "CART_VIEW"], ["add runner to cart", "CART_ADD"],
    ["remove runner from cart", "CART_REMOVE"], ["change runner quantity to 2 in my cart", "CART_UPDATE"], ["am I signed in", "ACCOUNT_STATUS"],
    ["what can you do", "HELP"], ["sing a song", "UNKNOWN"], ["is runner in stock", "UNSUPPORTED"],
  ])("maps %s to %s", (message, intent) => expect(parseAgentIntent(message).intent).toBe(intent));
  it("extracts products, quantity, category, and price ceiling", () => {
    expect(parseAgentIntent("add HX-01 quantity 3 to cart")).toMatchObject({ productTerms: ["hx-01"], quantity: 3 });
    expect(parseAgentIntent("running shoes under $140")).toMatchObject({ category: "running", maximumPrice: 140 });
  });
  it.each([
    "Change HEX Runner quantity to 2",
    "Change the quantity of HEX Runner to 2",
    "Set HEX Runner quantity to 2",
    "Set HEX Runner to quantity 2",
    "Update HEX Runner quantity to 2",
    "Make HEX Runner quantity 2",
    "Change HEX Runner to 2",
    "Set HEX Runner to 2 in my cart",
    "I want 2 HEX Runners in my cart",
  ])("routes quantity update phrasing: %s", (message) => {
    expect(parseAgentIntent(message)).toMatchObject({ intent: "CART_UPDATE", productTerms: ["hex runner"], quantity: 2 });
  });
  it("preserves invalid and missing quantities for orchestrator validation", () => {
    expect(parseAgentIntent("Change HEX Runner quantity to 0")).toMatchObject({ intent: "CART_UPDATE", quantity: 0 });
    expect(parseAgentIntent("Change HEX Runner quantity to 11")).toMatchObject({ intent: "CART_UPDATE", quantity: 11 });
    expect(parseAgentIntent("Change HEX Runner quantity")).toMatchObject({ intent: "CART_UPDATE", productTerms: ["hex runner"] });
  });
  it("does not regress cart add and remove", () => {
    expect(parseAgentIntent("Add HEX Runner quantity 2 to my cart")).toMatchObject({ intent: "CART_ADD", quantity: 2 });
    expect(parseAgentIntent("Remove HEX Runner from my cart")).toMatchObject({ intent: "CART_REMOVE" });
  });
  it.each([
    ["Recommend me a shoe similar to HEX Runner but better for trails", "trails"],
    ["Something similar to HEX Runner for hiking", "hiking"],
    ["A version of HEX Runner more suitable for trail use", "trail use"],
    ["Similar to HEX Mono but for running", "running"],
  ])("prioritizes explicit product discovery over personalization: %s", (message, targetUseCase) => {
    expect(parseAgentIntent(message)).toMatchObject({ intent: "SIMILAR_PRODUCTS", targetUseCase });
  });
  it("keeps generic recommendations personalized", () => {
    expect(parseAgentIntent("recommend something for me")).toMatchObject({ intent: "PERSONALIZED_RECOMMENDATION" });
  });
});
