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
              <p className="eyebrow">AI / ML / DL / Data Science</p>
              <h2>
                Designed to think
                <br />
                beyond the shoe.
              </h2>
            </div>
            <p>
              A vision for discovery that goes deeper.
              <br />
              Explore the intelligence roadmap.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <IntelligenceStory />
        </Reveal>
      </PageContainer>
    </section>
  );
}
