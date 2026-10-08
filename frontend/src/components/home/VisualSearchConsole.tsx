import { useId, useState } from "react";
import { PresentationImage } from "../shared/PresentationImage";
import type { FootwearStyle } from "../../types/product";

const samples: { asset: FootwearStyle; name: string }[] = [
  { asset: "runner", name: "Movement" },
  { asset: "trail", name: "Terrain" },
  { asset: "mono", name: "Everyday" },
];
const stages = [
  {
    title: "Image",
    detail: "A footwear image will become the starting point for discovery.",
  },
  {
    title: "CLIP embedding",
    detail:
      "OpenCLIP will encode visual features into an embedding using PyTorch.",
  },
  {
    title: "Cosine similarity",
    detail:
      "The planned retrieval service will compare the query with catalog embeddings.",
  },
  {
    title: "Ranked styles",
    detail:
      "Retrieved styles will be ordered by visual similarity. These samples are a layout preview.",
  },
];

export function VisualSearchConsole() {
  const [sample, setSample] = useState<FootwearStyle>("runner");
  const [stage, setStage] = useState(0);
  const id = useId();
  return (
    <div className="discovery-console">
      <div className="discovery-console__top">
        <span className="eyebrow">HEX / Visual discovery</span>
        <span className="module-status eyebrow">AI foundation</span>
      </div>
      <div className="discovery-console__query">
        <div className="discovery-console__image">
          <PresentationImage
            key={sample}
            asset={sample}
            alt="Selected footwear inspiration sample"
            sizes="(max-width: 600px) 40vw, 240px"
          />
          <span className="eyebrow">Image / Inspiration</span>
        </div>
        <div className="discovery-console__drop">
          <span className="discovery-console__plus" aria-hidden="true">
            +
          </span>
          <h3>
            Start with
            <br />
            what moves you.
          </h3>
          <p>Explore a sample image.</p>
          <div className="sample-options" aria-label="Inspiration samples">
            {samples.map((item) => (
              <button
                type="button"
                key={item.asset}
                aria-pressed={sample === item.asset}
                onClick={() => setSample(item.asset)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <p className="quiet-note">
            Image upload arrives with AI integration.
          </p>
        </div>
      </div>
      <div
        className="discovery-console__stages"
        aria-label="Explore the planned search pipeline"
      >
        {stages.map((item, index) => (
          <button
            type="button"
            key={item.title}
            aria-pressed={stage === index}
            aria-controls={id}
            onClick={() => setStage(index)}
          >
            <span>0{index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>
      <p id={id} className="discovery-console__explanation" role="status">
        {stages[stage]?.detail}
      </p>
      <div className="discovery-console__results-heading">
        <span className="eyebrow">Ranked styles / Preview</span>
        <span className="quiet-note">Illustrative ordering</span>
      </div>
      <ol className="discovery-console__results">
        {samples.map((item, index) => (
          <li key={item.asset}>
            <PresentationImage
              asset={item.asset}
              alt={`${item.name} concept, not a search result`}
              sizes="(max-width: 600px) 25vw, 160px"
            />
            <div>
              <span className="eyebrow">0{index + 1}</span>
              <span>{item.name}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className="discovery-console__tags eyebrow">
        <span>PyTorch</span>
        <span>OpenCLIP</span>
        <span>Vector retrieval</span>
      </div>
    </div>
  );
}
