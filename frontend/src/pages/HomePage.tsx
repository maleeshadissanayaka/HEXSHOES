import { BrandPhilosophy } from "../components/home/BrandPhilosophy";
import { Categories } from "../components/home/Categories";
import { Hero } from "../components/home/Hero";
import { IntelligenceLayer } from "../components/home/IntelligenceLayer";
import { NewDrops } from "../components/home/NewDrops";
import { Newsletter } from "../components/home/Newsletter";
import { OurStory } from "../components/home/OurStory";
import { VisualSearchIntro } from "../components/home/VisualSearchIntro";
import { PageContainer } from "../components/shared/PageContainer";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "../components/home/home.css";

export function HomePage() {
  useDocumentTitle("Built for what's next");
  return (
    <div className="home-page route-enter">
      <Hero />
      <div className="brand-values">
        <PageContainer>
          <ul>
            {[
              "Designed for movement",
              "Intelligent discovery",
              "Data-driven experience",
              "Built for what's next",
            ].map((value) => (
              <li key={value}>
                <span aria-hidden="true">+</span>
                {value}
              </li>
            ))}
          </ul>
        </PageContainer>
      </div>
      <BrandPhilosophy />
      <Categories />
      <NewDrops />
      <VisualSearchIntro />
      <IntelligenceLayer />
      <OurStory />
      <Newsletter />
    </div>
  );
}
