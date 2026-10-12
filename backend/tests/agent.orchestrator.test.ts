import { describe, expect, it, vi } from "vitest";
import { AgentOrchestrator } from "../src/agent/agent.orchestrator.js";
import type { AgentTools } from "../src/agent/agent.tools.js";
import type { AgentConfirmationService } from "../src/agent/agent.confirmation.js";
import { products } from "../src/data/products.js";

const user = { uid: "owner", name: "Member" };
const setup = () => {
  const execute = vi.fn();
  const tools = { catalog: vi.fn(async () => products), resolve: vi.fn(async (term: string) => products.filter((p) => [p.id, p.code.toLowerCase(), p.name.toLowerCase(), p.name.toLowerCase().replace("hex ", "")].includes(term.toLowerCase()))), products: vi.fn(async (ids: string[]) => products.filter((p) => ids.includes(p.id))), search: vi.fn(async () => [products[1]!]), similar: vi.fn(async () => [{ product: products[1] }]), personalized: vi.fn(async () => ({ personalized: true, results: [{ product: products[3] }] })), wishlist: vi.fn(async () => [products[1]!]), cart: vi.fn(async () => [{ product: products[0]!, quantity: 2 }]), profile: vi.fn(async () => ({ displayName: "Member" })), execute } as unknown as AgentTools;
  const confirmations = { issue: vi.fn(() => ({ token: "signed", expiresAt: "future" })), consume: vi.fn(() => ({ type: "CART_ADD", productId: "hx-01", quantity: 1 })) } as unknown as AgentConfirmationService;
  return { agent: new AgentOrchestrator(tools, confirmations), tools, confirmations, execute };
};
describe("agent orchestration", () => {
  it("uses search, comparison, similarity, and personalization tools", async () => {
    const { agent, tools } = setup();
    expect((await agent.message("show me trail shoes", {}, undefined)).products?.[0]?.id).toBe("hx-02");
    expect((await agent.message("compare runner and trail", {}, undefined)).comparison?.priceDifference).toBe(36);
    expect((await agent.message("show similar to runner", {}, undefined)).products?.[0]?.id).toBe("hx-02");
    expect((await agent.message("recommend for me", {}, user)).products?.[0]?.id).toBe("hx-04");
    expect(vi.mocked(tools.search)).toHaveBeenCalled();
  });
  it("uses grounded attribute search instead of personalization for an explicit product modifier", async () => {
    const { agent, tools } = setup();
    const response = await agent.message("Recommend me a shoe similar to HEX Runner but better for trails", {}, user);
    expect(response).toMatchObject({ intent: "SIMILAR_PRODUCTS", products: [{ id: "hx-02", name: "HEX Trail" }] });
    expect(tools.search).toHaveBeenCalledWith("trails shoe");
    expect(tools.personalized).not.toHaveBeenCalled();
    expect(response.reply).not.toContain("saved styles");
  });
  it("keeps generic recommendations on saved and cart personalization", async () => {
    const { agent, tools } = setup();
    const response = await agent.message("recommend something for me", {}, user);
    expect(response.reply).toBe("Based only on your saved styles and cart signals.");
    expect(tools.personalized).toHaveBeenCalledWith("owner");
  });
  it("handles auth, reads, context, and pending mutations without executing", async () => {
    const { agent, execute } = setup();
    expect((await agent.message("show my wishlist", {}, undefined)).authRequired).toBe(true);
    expect((await agent.message("show my cart", {}, user)).cartSummary?.itemCount).toBe(2);
    expect((await agent.message("which one is cheaper", { referencedProductIds: ["hx-01", "hx-02"] })).comparison?.cheaperProductId).toBe("hx-01");
    expect((await agent.message("add trail to wishlist", {}, user)).pendingAction?.confirmationToken).toBe("signed");
    expect(execute).not.toHaveBeenCalled();
  });
  it("executes only after valid confirmation", async () => {
    const { agent, execute } = setup(); await agent.confirm("signed", user); expect(execute).toHaveBeenCalledWith("owner", { type: "CART_ADD", productId: "hx-01", quantity: 1 });
  });
  it("prepares quantity updates without mutating and rejects incomplete or invalid requests", async () => {
    const { agent, confirmations, execute } = setup();
    const valid = await agent.message("Change HEX Runner quantity to 2", {}, user);
    expect(valid.pendingAction).toMatchObject({ type: "CART_UPDATE", productId: "hx-01", quantity: 2 });
    expect(confirmations.issue).toHaveBeenCalledWith("owner", { type: "CART_UPDATE", productId: "hx-01", quantity: 2 });
    expect(execute).not.toHaveBeenCalled();
    expect((await agent.message("Change HEX Runner quantity to 0", {}, user)).pendingAction).toBeUndefined();
    expect((await agent.message("Change HEX Runner quantity to 11", {}, user)).pendingAction).toBeUndefined();
    expect((await agent.message("Change quantity to 2", {}, user)).pendingAction).toBeUndefined();
    expect((await agent.message("Change HEX Runner quantity", {}, user)).pendingAction).toBeUndefined();
  });
});
