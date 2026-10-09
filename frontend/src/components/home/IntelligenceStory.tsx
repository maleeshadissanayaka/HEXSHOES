import { useId, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { PresentationImage } from "../shared/PresentationImage";

const modules = [
  {
    title: "Visual search",
    status: "Foundation",
    tag: "CLIP embeddings / Cosine similarity",
    copy: "A different starting point. Turn visual inspiration into a more intuitive way to explore footwear.",
    note: "The interface is taking shape. Image encoding and retrieval are planned.",
    asset: "runner",
  },
  {
    title: "Recommendations",
    status: "Planned",
    tag: "Recommendation engine",
    copy: "Discovery that gets closer to your point of view. A considered balance of individual preference and new possibility.",
    note: "Future evaluation will consider relevance, diversity, and cold-start behavior.",
    asset: "mono",
  },
  {
    title: "Customer segmentation",
    status: "Planned",
    tag: "Behavioral segmentation",
    copy: "Understand the different ways people move through a collection, to create more useful retail experiences.",
    note: "Research will begin with appropriate data governance and meaningful behavioral features.",
    asset: "story",
  },
  {
    title: "Demand forecasting",
    status: "Planned",
    tag: "Demand intelligence",
    copy: "A clearer view of what comes next. Connect patterns in demand with thoughtful retail planning.",
    note: "Future models will be evaluated against time-based baselines using suitable real data.",
    asset: "trail",
  },
  {
    title: "Explainable AI",
    status: "Research",
    tag: "Explainable ranking",
    copy: "Good discovery deserves a clear explanation. Make the reasoning behind recommendations easier to understand.",
    note: "Research direction: useful explanations, transparent limitations, and measurable recommendation quality.",
    asset: "texture",
  },
  {
    title: "AI shopping agent",
    status: "Research",
    tag: "Agentic shopping",
    copy: "A conversation that helps you find your direction, grounded in the collection and your intent.",
    note: "The current HEX Assistant is scripted. A grounded AI agent remains a future module.",
    asset: "hero",
  },
] as const;

export function IntelligenceStory({
  excludeVisualSearch = false,
}: {
  excludeVisualSearch?: boolean;
}) {
  const visibleModules = excludeVisualSearch
    ? modules.filter((item) => item.title !== "Visual search")
    : modules;
  const [active, setActive] = useState(0);
  const id = useId();
  const module = visibleModules[active] ?? visibleModules[0]!;
  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % visibleModules.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index + visibleModules.length - 1) % visibleModules.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = visibleModules.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }
  return (
    <div className="intelligence-story">
      <div
        className="intelligence-story__tabs"
        role="tablist"
        aria-label="Intelligence roadmap"
        aria-orientation="vertical"
      >
        {visibleModules.map((item, index) => (
          <button
            key={item.title}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => handleKey(event, index)}
          >
            <span className="eyebrow">0{index + 1}</span>
            <span>{item.title}</span>
            <span className="eyebrow">{item.status}</span>
          </button>
        ))}
      </div>
      <div
        className="intelligence-story__panel"
        role="tabpanel"
        tabIndex={0}
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
      >
        <PresentationImage
          key={module.asset}
          asset={module.asset}
          alt=""
          sizes="(max-width: 768px) 90vw, 55vw"
        />
        <div className="intelligence-story__content" key={module.title}>
          <p className="eyebrow">{module.tag}</p>
          <h3>{module.title}.</h3>
          <p>{module.copy}</p>
          <p className="quiet-note">{module.note}</p>
          <Link to="/technology" className="text-link">
            Explore the architecture →
          </Link>
        </div>
      </div>
    </div>
  );
}
