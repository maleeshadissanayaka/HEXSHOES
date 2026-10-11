import type { AgentContext, AgentResponse } from "../../services/api/agent.api";
export const nextAgentContext = (currentProductId: string | undefined, response?: AgentResponse): AgentContext => ({ ...(currentProductId ? { currentProductId } : {}), ...(response?.context.referencedProductIds?.length ? { referencedProductIds: response.context.referencedProductIds } : {}), ...(response?.intent ? { lastIntent: response.intent } : {}) });
export const confirmationLabel = (type: string) => type.replaceAll("_", " ");
export const agentErrorMessage = (error: unknown) => error instanceof Error ? error.message : "The assistant is temporarily unavailable.";
