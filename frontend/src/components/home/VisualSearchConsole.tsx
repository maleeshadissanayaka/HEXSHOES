import { useEffect, useId, useState } from "react";
import { PresentationImage } from "../shared/PresentationImage";
import type { FootwearStyle } from "../../types/product";
import { Icon } from "../shared/Icon";

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
      "The planned retrieval service will compare image and catalog embeddings using cosine similarity.",
  },
  {
    title: "Ranked styles",
    detail:
      "Retrieved styles will be ordered by visual similarity. These samples are a layout preview.",
  },
];
const homepageStages = [
  {
    title: "Embed",
    detail:
      "Planned: encode an inspiration image into a CLIP embedding for visual retrieval.",
  },
  {
    title: "Compare",
    detail:
      "Planned: compare the image embedding with footwear catalog embeddings using cosine similarity.",
  },
  {
    title: "Rank",
    detail:
      "Planned: return styles ordered by visual similarity. These samples are presentation concepts.",
  },
];

export function VisualSearchConsole({
  compactPipeline = false,
}: {
  compactPipeline?: boolean;
}) {
  const [sample, setSample] = useState<FootwearStyle>("runner");
  const [stage, setStage] = useState(0);
  const [upload, setUpload] = useState<{ url: string; name: string } | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const id = useId();
  const visibleStages = compactPipeline ? homepageStages : stages;
  useEffect(() => {
    if (!upload) return;
    return () => URL.revokeObjectURL(upload.url);
  }, [upload]);

  function selectUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setUploadMessage("Choose an image file under 10 MB. The image stays in this browser.");
      return;
    }
    setUpload({ url: URL.createObjectURL(file), name: file.name });
    setUploadMessage("Local image preview ready. No upload or image analysis was performed.");
  }
  return (
    <div className="discovery-console">
      <div className="discovery-console__top">
        <span className="eyebrow">HEX / Visual discovery</span>
        <span className="module-status eyebrow">AI foundation</span>
      </div>
      <div className="discovery-console__query">
        <div className="discovery-console__image">
          {upload ? (
            <img src={upload.url} alt={`Local preview: ${upload.name}`} />
          ) : (
            <PresentationImage
              key={sample}
              asset={sample}
              alt="Selected footwear inspiration sample"
              sizes="(max-width: 600px) 40vw, 240px"
            />
          )}
          <span className="eyebrow">{upload ? "Local preview" : "Image / Inspiration"}</span>
        </div>
        <div className="discovery-console__drop">
          <span className="discovery-console__plus" aria-hidden="true">
            <Icon name="upload" size={22} />
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
                onClick={() => {
                  setSample(item.asset);
                  setUpload(null);
                  setUploadMessage("");
                }}
              >
                {item.name}
              </button>
            ))}
            <label className="discovery-console__upload">
              <Icon name="upload" size={15} />
              <span>{upload ? "Choose another image" : "Choose an image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => selectUpload(event.currentTarget.files?.[0])}
              />
            </label>
          </div>
            <p className="quiet-note" role="status">
              {uploadMessage || "Local preview only. Images are not sent or analyzed."}
            </p>
        </div>
      </div>
      <div
        className="discovery-console__stages"
        aria-label="Explore the planned search pipeline"
      >
        {visibleStages.map((item, index) => (
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
        {visibleStages[stage]?.detail}
      </p>
      <div className="discovery-console__results-heading">
        <span className="eyebrow">Presentation styles / Not results</span>
        <span className="quiet-note">No similarity scores</span>
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
