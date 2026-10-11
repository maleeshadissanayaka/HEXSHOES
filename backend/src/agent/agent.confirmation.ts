import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { AgentAction } from "./agent.types.js";
import { env } from "../config/env.js";

interface Claims extends AgentAction { uid: string; exp: number; jti: string }
const actionTypes = new Set(["WISHLIST_ADD", "WISHLIST_REMOVE", "CART_ADD", "CART_REMOVE", "CART_UPDATE"]);
export const resolveActionSecret = (configured: string | undefined, environment = env.nodeEnv) => {
  const value = configured?.trim();
  if (environment === "production" && (!value || value.length < 32)) {
    throw new Error("AGENT_ACTION_SECRET must contain at least 32 characters in production");
  }
  return value || randomBytes(32).toString("hex");
};
const secret = resolveActionSecret(env.agent.actionSecret);
export class AgentConfirmationService {
  private readonly used = new Set<string>();
  constructor(private readonly signingSecret = secret, private readonly ttlMs = 5 * 60_000, private readonly now = () => Date.now()) {}
  issue(uid: string, action: AgentAction) {
    const claims: Claims = { ...action, uid, exp: this.now() + this.ttlMs, jti: randomUUID() };
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const signature = createHmac("sha256", this.signingSecret).update(payload).digest("base64url");
    return { token: `${payload}.${signature}`, expiresAt: new Date(claims.exp).toISOString() };
  }
  consume(token: string, uid: string): AgentAction {
    const [payload, provided] = token.split(".");
    if (!payload || !provided) throw new Error("INVALID_CONFIRMATION");
    const expected = createHmac("sha256", this.signingSecret).update(payload).digest();
    let received: Buffer;
    try { received = Buffer.from(provided, "base64url"); } catch { throw new Error("INVALID_CONFIRMATION"); }
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error("INVALID_CONFIRMATION");
    let claims: Claims;
    try { claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Claims; } catch { throw new Error("INVALID_CONFIRMATION"); }
    if (!claims.jti || !actionTypes.has(claims.type) || typeof claims.productId !== "string" || !claims.productId || (claims.quantity !== undefined && (!Number.isInteger(claims.quantity) || claims.quantity < 1 || claims.quantity > 10)) || claims.uid !== uid || !Number.isFinite(claims.exp) || claims.exp <= this.now()) throw new Error(claims.uid !== uid ? "WRONG_CONFIRMATION_USER" : claims.exp <= this.now() ? "EXPIRED_CONFIRMATION" : "INVALID_CONFIRMATION");
    if (this.used.has(claims.jti)) throw new Error("USED_CONFIRMATION");
    this.used.add(claims.jti);
    return { type: claims.type, productId: claims.productId, ...(claims.quantity === undefined ? {} : { quantity: claims.quantity }) };
  }
}
export const agentConfirmationService = new AgentConfirmationService();
