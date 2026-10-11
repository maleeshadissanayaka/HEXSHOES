import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useExperience } from "../../hooks/useExperience";
import { confirmAgentAction, sendAgentMessage, type AgentContext, type AgentResponse } from "../../services/api/agent.api";
import { formatPrice } from "../../utils/formatPrice";
import { agentErrorMessage, confirmationLabel, nextAgentContext } from "./agentState";
import { Icon } from "../shared/Icon";

type Message = { role: "assistant" | "user"; text: string; data?: AgentResponse };
const initial: Message = { role: "assistant", text: "Welcome to HEXSHOES. I can search the real catalog, compare styles, find similar products, and help with signed-in wishlist or cart actions." };
export function HexAssistant() {
  const { close, refreshAccountState } = useExperience();
  const auth = useAuth();
  const location = useLocation();
  const currentProductId = /^\/product\/(hx-0[1-4])$/i.exec(location.pathname)?.[1]?.toLowerCase();
  const [messages, setMessages] = useState<Message[]>([initial]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<AgentContext>(() => nextAgentContext(currentProductId));
  const [loading, setLoading] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, loading]);
  async function send(text: string) {
    const trimmed = text.trim(); if (!trimmed || loading) return;
    setMessages((items) => [...items.slice(-18), { role: "user", text: trimmed }]); setInput(""); setLoading(true);
    try { const data = await sendAgentMessage(trimmed, { ...context, ...(currentProductId ? { currentProductId } : {}) }, auth.user); setContext(nextAgentContext(currentProductId, data)); setMessages((items) => [...items, { role: "assistant", text: data.reply, data }]); }
    catch (error) { setMessages((items) => [...items, { role: "assistant", text: agentErrorMessage(error) }]); }
    finally { setLoading(false); }
  }
  async function confirm(data: AgentResponse) {
    if (!data.pendingAction || !auth.user || loading) return; setLoading(true);
    try { const result = await confirmAgentAction(data.pendingAction.confirmationToken, auth.user); await refreshAccountState(); setMessages((items) => [...items, { role: "assistant", text: result.reply, data: result }]); }
    catch (error) { setMessages((items) => [...items, { role: "assistant", text: agentErrorMessage(error) }]); }
    finally { setLoading(false); }
  }
  function cancel() { setMessages((items) => [...items, { role: "assistant", text: "Action cancelled. Nothing was changed." }]); }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(input); }
  const suggestions = [...messages].reverse().find(({ data }) => data)?.data?.suggestedPrompts ?? ["Show me a trail shoe", "Compare HEX Runner and HEX Trail", "What can you do?"];
  return <div className="hex-assistant">
    <div className="hex-assistant__header"><span className="assistant-mark" aria-hidden="true">H<span>+</span></span><div><p className="eyebrow">Grounded shopping tools</p><h3>HEX Assistant</h3></div></div>
    <div className="hex-assistant__messages" role="log" aria-label="Assistant conversation" aria-live="polite" ref={log}>
      {messages.map((message, index) => <div key={index} className={`assistant-message assistant-message--${message.role}`}><span className="sr-only">{message.role === "assistant" ? "HEX Assistant" : "You"}: </span><p>{message.text}</p>
        {message.data?.products.length ? <div className="assistant-products">{message.data.products.map((product) => <Link key={product.id} to={`/product/${product.id}`} onClick={close}><span><strong>{product.name}</strong><small>{product.category} · {formatPrice(product.price, product.currency)}</small></span><Icon name="arrow" size={15} /></Link>)}</div> : null}
        {message.data?.comparison && <div className="assistant-comparison"><span className="eyebrow">Canonical comparison</span>{message.data.comparison.products.map((product) => <p key={product.id}><strong>{product.name}</strong> · {product.category} · {product.audience} · {formatPrice(product.price, product.currency)} · {product.isNew ? "New" : "Catalog"}</p>)}</div>}
        {message.data?.cartSummary && <p className="assistant-summary">Subtotal: {formatPrice(message.data.cartSummary.subtotal, "USD")} · {message.data.cartSummary.itemCount} items</p>}
        {message.data?.pendingAction && <div className="assistant-confirm"><span className="eyebrow">{confirmationLabel(message.data.pendingAction.type)}</span><strong>{message.data.pendingAction.productName}</strong>{message.data.pendingAction.quantity && <span>Quantity {message.data.pendingAction.quantity}</span>}<div><button type="button" onClick={() => void confirm(message.data!)} disabled={loading}>Confirm</button><button type="button" onClick={cancel} disabled={loading}>Cancel</button></div></div>}
        {message.data?.authRequired && <Link to="/account" onClick={close} className="text-link">Sign in <Icon name="arrow" size={16} /></Link>}
      </div>)}
      {loading && <div className="assistant-message" role="status"><p>Using HEX tools…</p></div>}
    </div>
    <div className="hex-assistant__suggestions" aria-label="Suggested prompts">{suggestions.slice(0, 3).map((prompt) => <button key={prompt} onClick={() => void send(prompt)} disabled={loading}>{prompt}<Icon name="diagonal" size={14}/></button>)}</div>
    <form onSubmit={submit} className="hex-assistant__form"><label className="sr-only" htmlFor="assistant-message">Message HEX Assistant</label><input id="assistant-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Ask about HEXSHOES…" autoComplete="off"/><button type="submit" aria-label="Send message" disabled={!input.trim() || loading}><Icon name="arrow" size={20}/></button></form>
    <p className="quiet-note">Deterministic agent · Real catalog and AI tools · Mutations require confirmation.</p>
  </div>;
}
export function AssistantLauncher() { const { open } = useExperience(); return <button className="assistant-launcher" aria-label="Open HEX Assistant" aria-haspopup="dialog" onClick={() => open({ kind: "assistant" })}><span className="assistant-mark" aria-hidden="true">H<span>+</span></span><span>Ask HEX<small>Grounded shopping tools</small></span><Icon name="diagonal" size={16}/></button>; }
