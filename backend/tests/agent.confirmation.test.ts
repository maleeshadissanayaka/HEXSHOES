import { describe, expect, it } from "vitest";
import { AgentConfirmationService } from "../src/agent/agent.confirmation.js";

describe("agent confirmation security", () => {
  it("binds a single-use action to the correct user", () => {
    const service = new AgentConfirmationService("a-secure-test-secret", 1000, () => 100);
    const issued = service.issue("owner", { type: "CART_ADD", productId: "hx-01", quantity: 2 });
    expect(service.consume(issued.token, "owner")).toEqual({ type: "CART_ADD", productId: "hx-01", quantity: 2 });
    expect(() => service.consume(issued.token, "owner")).toThrow("USED_CONFIRMATION");
  });
  it("rejects tampering, expiry, and the wrong user", () => {
    let now = 100;
    const service = new AgentConfirmationService("a-secure-test-secret", 10, () => now);
    const wrong = service.issue("owner", { type: "WISHLIST_ADD", productId: "hx-02" });
    expect(() => service.consume(wrong.token, "other")).toThrow("WRONG_CONFIRMATION_USER");
    expect(() => service.consume(`${wrong.token}x`, "owner")).toThrow("INVALID_CONFIRMATION");
    const expired = service.issue("owner", { type: "CART_REMOVE", productId: "hx-02" }); now = 111;
    expect(() => service.consume(expired.token, "owner")).toThrow("EXPIRED_CONFIRMATION");
  });
});
