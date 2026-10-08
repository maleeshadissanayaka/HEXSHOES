import { Link } from "react-router-dom";
import { PageContainer } from "../shared/PageContainer";
import { PresentationImage } from "../shared/PresentationImage";
import { Reveal } from "../shared/Reveal";
export function OurStory() {
  return (
    <section className="story-campaign">
      <PresentationImage
        asset="story"
        alt="Runner moving through a silver-lit urban walkway, a generated campaign study"
        sizes="100vw"
      />
      <PageContainer>
        <Reveal>
          <div className="story-campaign__copy">
            <p className="eyebrow">Independent perspective. Forward motion.</p>
            <h2>
              MORE THAN
              <br />
              JUST SHOES.
            </h2>
            <p>
              HEXSHOES combines performance footwear, intelligent technology,
              and data-driven discovery.
            </p>
            <Link className="text-link" to="/about">
              Our story <span aria-hidden="true">&#8594;</span>
            </Link>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
