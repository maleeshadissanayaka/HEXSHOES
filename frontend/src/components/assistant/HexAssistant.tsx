import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useExperience } from "../../hooks/useExperience";
import { Icon } from "../shared/Icon";

type Message = {
  role: "assistant" | "user";
  text: string;
  link?: { to: string; label: string };
};
function scriptedReply(text: string): Message {
  if (/visual|image|clip|photo/.test(text.toLowerCase()))
    return {
      role: "assistant",
      text: "Visual discovery starts with an image. The presentation lets you explore sample images; CLIP embeddings and cosine-similarity retrieval are planned for the AI integration phase.",
      link: { to: "/visual-search", label: "Explore visual discovery" },
    };
  if (
    /run|trail|slide|style|direction|pair|shoe|collection/.test(
      text.toLowerCase(),
    )
  )
    return {
      role: "assistant",
      text: "Start with how you move: RUNNING for rhythm, TRAIL for the outdoors, LIFESTYLE for everyday form, or SLIDES for a slower pace. Our four concept studies are available to explore.",
      link: { to: "/shop", label: "Find your direction" },
    };
  if (/ship|order|buy|size|stock|price|return|payment/.test(text.toLowerCase()))
    return {
      role: "assistant",
      text: "The collection is currently a presentation. Prices are illustrative; purchases, availability, sizing, shipping, and returns are not active. I can help you explore the design direction.",
      link: { to: "/contact", label: "Visit contact" },
    };
  if (/data|privacy|store|save/.test(text.toLowerCase()))
    return {
      role: "assistant",
      text: "This assistant uses local scripted replies. Messages stay in this panel for the current session and are not sent to a service or saved in browser storage.",
    };
  return {
    role: "assistant",
    text: "I’m a scripted guide to HEXSHOES. I can introduce the collection, explain visual discovery, or point you to our technology story. A connected AI shopping agent is planned for later.",
    link: { to: "/technology", label: "Meet the technology vision" },
  };
}
export function HexAssistant() {
  const { close } = useExperience();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Welcome to HEXSHOES. What moves you? Let’s find a direction worth exploring.",
    },
  ]);
  const [input, setInput] = useState("");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current.slice(-18),
      { role: "user", text: trimmed },
      scriptedReply(trimmed),
    ]);
    setInput("");
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }
  return (
    <div className="hex-assistant">
      <div className="hex-assistant__header">
        <span className="assistant-mark" aria-hidden="true">
          H<span>+</span>
        </span>
        <div>
          <p className="eyebrow">Your next perspective</p>
          <h3>HEX Assistant</h3>
        </div>
      </div>
      <div
        className="hex-assistant__messages"
        role="log"
        aria-label="Assistant conversation"
        aria-live="polite"
        ref={log}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`assistant-message assistant-message--${message.role}`}
          >
            <span className="sr-only">
              {message.role === "assistant" ? "HEX Assistant" : "You"}:{" "}
            </span>
            <p>{message.text}</p>
            {message.link && (
              <Link to={message.link.to} onClick={close} className="text-link">
                <span>{message.link.label}</span>
                <Icon name="arrow" size={16} />
              </Link>
            )}
          </div>
        ))}
      </div>
      <div
        className="hex-assistant__suggestions"
        aria-label="Suggested prompts"
      >
        {[
          "Find my direction",
          "How does visual search work?",
          "Explore the technology",
        ].map((prompt) => (
          <button key={prompt} onClick={() => send(prompt)}>
            {prompt}
            <Icon name="diagonal" size={14} />
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="hex-assistant__form">
        <label className="sr-only" htmlFor="assistant-message">
          Message HEX Assistant
        </label>
        <input
          id="assistant-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={500}
          placeholder="Ask about HEXSHOES…"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim()}
        >
          <Icon name="arrow" size={20} />
        </button>
      </form>
      <p className="quiet-note">
        Scripted product guide · AI agent integration comes later.
        <br />
        Messages are not sent or stored.
      </p>
    </div>
  );
}
export function AssistantLauncher() {
  const { open } = useExperience();
  return (
    <button
      className="assistant-launcher"
      aria-label="Open HEX Assistant"
      aria-haspopup="dialog"
      onClick={() => open({ kind: "assistant" })}
    >
      <span className="assistant-mark" aria-hidden="true">
        H<span>+</span>
      </span>
      <span>
        Ask HEX<small>A new perspective</small>
      </span>
      <Icon name="diagonal" size={16} />
    </button>
  );
}
