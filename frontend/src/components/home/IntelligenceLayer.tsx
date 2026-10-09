import { PageContainer } from "../shared/PageContainer";
import { Reveal } from "../shared/Reveal";
import { IntelligenceStory } from "./IntelligenceStory";
export function IntelligenceLayer() {
  return (
    <section className="intelligence section paper">
      <PageContainer>
        <Reveal>
          <div className="intelligence__heading">
            <div>
              <p className="eyebrow">Built with AI / ML / DL / Data Science</p>
              <h2>
                The
                <br />
                intelligence layer.
              </h2>
            </div>
            <p>
              A technical foundation for more useful footwear discovery.
              <br />
              See how the system could evolve.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <IntelligenceStory excludeVisualSearch />
        </Reveal>
      </PageContainer>
    </section>
  );
}
