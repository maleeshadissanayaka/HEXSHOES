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
              <span className="signal-dot" />
              Visual discovery / AI foundation
            </p>
            <h2>
              Find your next
              <br />
              pair with AI.
            </h2>
            <p>Some things catch your eye before you know what to call them.</p>
            <p>
              The panel previews sample images and local uploads. Image
              encoding and catalog retrieval with CLIP and cosine similarity
              are planned, but are not connected.
            </p>
            <Button to="/visual-search" variant="primary">
              Discover visual search
            </Button>
            <p className="visual-search__status eyebrow">AI foundation</p>
          </div>
        </Reveal>
        <Reveal stagger={1}>
          <VisualSearchConsole compactPipeline />
        </Reveal>
      </PageContainer>
    </section>
  );
}
