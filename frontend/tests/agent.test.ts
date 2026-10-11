import assert from "node:assert/strict";
import test from "node:test";
import { agentErrorMessage, confirmationLabel, nextAgentContext } from "../src/components/assistant/agentState.ts";

test("agent context stays bounded to server-returned product references and current page", () => {
  const context = nextAgentContext("hx-01", { reply: "", intent: "PRODUCT_SEARCH", products: [], suggestedPrompts: [], context: { referencedProductIds: ["hx-02", "hx-03"] } });
  assert.deepEqual(context, { currentProductId: "hx-01", referencedProductIds: ["hx-02", "hx-03"], lastIntent: "PRODUCT_SEARCH" });
});
test("confirmation and error helpers provide deterministic UI copy", () => {
  assert.equal(confirmationLabel("CART_ADD"), "CART ADD");
  assert.equal(agentErrorMessage(new Error("AI search is temporarily unavailable")), "AI search is temporarily unavailable");
  assert.match(agentErrorMessage(undefined), /temporarily unavailable/);
});
