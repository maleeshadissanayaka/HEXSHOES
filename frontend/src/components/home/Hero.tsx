import { Button } from "../shared/Button";
import { Icon } from "../shared/Icon";
import { PageContainer } from "../shared/PageContainer";
import { CampaignMedia } from "./CampaignMedia";
import { useExperience } from "../../hooks/useExperience";

export function Hero() {
  const { open } = useExperience();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <CampaignMedia />
      <PageContainer className="hero__composition">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">
            <span className="signal-dot" />
            HEXSHOES / Performance system
          </p>
          <h1 id="hero-title">
            BUILT
            <br />
            <span className="hero__headline-line">FOR WHAT'S</span>
            <br />
            <span>NEXT.</span>
          </h1>
          <p className="hero__description">
            Performance footwear shaped by movement,
            <br className="desktop-break" /> design, and intelligent discovery.
          </p>
          <div className="hero__actions">
            <Button to="/shop" variant="light">
              Explore collection
            </Button>
            <LinkButton />
          </div>
        </div>
        <div className="hero__visual">
          <button
            type="button"
            className="hero__preview eyebrow"
            onClick={() => open({ kind: "campaign" })}
          >
            <Icon name="play" size={16} /> Explore the campaign
          </button>
          <div className="hero__annotation">
            <span className="hero__annotation-line" />
            <p className="eyebrow">
              Movement / Design study
              <br />
              <span>A study in forward motion</span>
            </p>
          </div>
        </div>
        <div className="hero__bottom">
          <p className="eyebrow">Footwear. Design. Discovery.</p>
          <a href="#philosophy" className="hero__scroll eyebrow">
            Explore the perspective <Icon name="arrow" size={15} />
          </a>
          <p className="eyebrow hero__index">01 / Movement study</p>
        </div>
      </PageContainer>
    </section>
  );
}
function LinkButton() {
  return (
    <Button to="/visual-search" variant="outline" className="hero__secondary">
      Visual search
    </Button>
  );
}
