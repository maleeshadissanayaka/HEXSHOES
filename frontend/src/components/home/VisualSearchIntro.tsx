import { Button } from "../shared/Button";
import { VisualSearchConsole } from "./VisualSearchConsole";
import { PageContainer } from "../shared/PageContainer";
import { PresentationImage } from "../shared/PresentationImage";
import { Reveal } from "../shared/Reveal";

export function VisualSearchIntro() {
  return (
    <section className="visual-search section">
      <PresentationImage
        asset="texture"
        alt=""
        sizes="100vw"
        className="visual-search__backdrop"
      />
      <PageContainer className="visual-search__grid">
        <Reveal>
          <div className="visual-search__copy">
            <p className="eyebrow">
              <span className="signal-dot" />A new lens on discovery
            </p>
            <h2>
              See it.
              <br />
              Find it.
              <br />
              <span>Wear it.</span>
            </h2>
            <p>Some things catch your eye before you know what to call them.</p>
            <p>
              In a future phase, a footwear image will become a CLIP embedding.
              Cosine similarity will connect that visual inspiration to similar
              catalog styles.
            </p>
            <Button to="/visual-search" variant="light">
              Discover visual search
            </Button>
            <p className="visual-search__status eyebrow">AI foundation</p>
          </div>
        </Reveal>
        <Reveal stagger={1}>
          <VisualSearchConsole />
        </Reveal>
      </PageContainer>
    </section>
  );
}
