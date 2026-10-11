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
              Visual discovery / OpenCLIP live
            </p>
            <h2>
              Find your next
              <br />
              pair with AI.
            </h2>
            <p>Some things catch your eye before you know what to call them.</p>
            <p>
              Search the canonical catalog with a sample or local image.
              Express forwards it to OpenCLIP and resolves ranked product IDs
              into trusted catalog data.
            </p>
            <Button to="/visual-search" variant="primary">
              Discover visual search
            </Button>
            <p className="visual-search__status eyebrow">OpenCLIP connected</p>
          </div>
        </Reveal>
        <Reveal stagger={1}>
          <VisualSearchConsole compactPipeline />
        </Reveal>
      </PageContainer>
    </section>
  );
}
