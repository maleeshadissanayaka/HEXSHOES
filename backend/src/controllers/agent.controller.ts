import { agentOrchestrator } from "../agent/agent.orchestrator.js";
import type { AgentContext } from "../agent/agent.types.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const agentMessage = asyncHandler(async (request, response) => {
  const message = request.body?.message; if (typeof message !== "string" || !message.trim() || message.length > 500) { response.status(400).json({ success: false, error: { message: "Message must be from 1 to 500 characters" } }); return; }
  const raw = request.body?.context; const context: AgentContext = raw && typeof raw === "object" ? { ...(typeof raw.currentProductId === "string" ? { currentProductId: raw.currentProductId } : {}), ...(Array.isArray(raw.referencedProductIds) && raw.referencedProductIds.length <= 4 && raw.referencedProductIds.every((id: unknown) => typeof id === "string") ? { referencedProductIds: raw.referencedProductIds } : {}) } : {};
  try { response.status(200).json({ success: true, data: await agentOrchestrator.message(message.trim(), context, request.authUser) }); }
  catch (error) { if (error instanceof Error && /AI service|fetch failed|unavailable/i.test(error.message)) { response.status(503).json({ success: false, error: { message: "AI search is temporarily unavailable; non-AI account tools remain available." } }); return; } throw error; }
});
export const agentConfirm = asyncHandler(async (request, response) => {
  if (!request.authUser) { response.status(401).json({ success: false, error: { message: "Authentication required" } }); return; }
  const token = request.body?.confirmationToken; if (typeof token !== "string" || token.length > 2048) { response.status(400).json({ success: false, error: { message: "Invalid confirmation" } }); return; }
  try { response.status(200).json({ success: true, data: await agentOrchestrator.confirm(token, request.authUser) }); }
  catch (error) { if (error instanceof Error && ["INVALID_CONFIRMATION", "WRONG_CONFIRMATION_USER", "EXPIRED_CONFIRMATION", "USED_CONFIRMATION"].includes(error.message)) { response.status(400).json({ success: false, error: { message: "Confirmation is invalid, expired, or already used" } }); return; } throw error; }
});
