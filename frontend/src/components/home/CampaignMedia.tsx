import { useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { PresentationImage } from "../shared/PresentationImage";
import { Icon } from "../shared/Icon";

/** The current campaign uses an optimized still with restrained CSS motion. */
export function CampaignMedia() {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  return (
    <>
      <div
        className={`hero__media ${paused || reducedMotion ? "hero__media--paused" : ""}`}
      >
        <PresentationImage
          asset="hero"
          alt="Performance footwear campaign study with directional silver light"
          sizes="100vw"
          priority
        />
      </div>
      <button
        className="campaign-motion"
        type="button"
        onClick={() => setPaused((value) => !value)}
        disabled={reducedMotion}
        aria-label={
          reducedMotion
            ? "Background motion disabled by your preference"
            : paused
              ? "Resume background motion"
              : "Pause background motion"
        }
      >
        <Icon name={paused || reducedMotion ? "play" : "pause"} size={14} />
        <span>
          {reducedMotion
            ? "Still perspective"
            : paused
              ? "Resume motion"
              : "Pause motion"}
        </span>
      </button>
    </>
  );
}
