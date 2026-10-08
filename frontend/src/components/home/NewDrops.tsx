import { Link } from "react-router-dom";
import { presentationProducts } from "../../data/presentationProducts";
import { ProductCard } from "../products/ProductCard";
import { Icon } from "../shared/Icon";
import { PageContainer } from "../shared/PageContainer";
import { Reveal } from "../shared/Reveal";
import { SectionHeader } from "../shared/SectionHeader";
export function NewDrops() {
  return (
    <section className="new-drops section paper">
      <PageContainer>
        <Reveal>
          <SectionHeader
            eyebrow="New drops / Collection preview"
            title={<>The next rotation.</>}
            action={
              <Link to="/new-drops" className="text-link">
                <span>Explore the preview</span>
                <Icon name="arrow" size={18} />
              </Link>
            }
          />
        </Reveal>
        <div className="products-grid">
          {presentationProducts.map((product, i) => (
            <Reveal key={product.id} stagger={i as 0 | 1 | 2 | 3}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
        <p className="section-note eyebrow">
          Generated presentation concepts & illustrative USD prices / Not
          available for purchase
        </p>
      </PageContainer>
    </section>
  );
}
