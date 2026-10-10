import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { ProductState } from "../products/ProductState";
import { ProductCard } from "../products/ProductCard";
import { Icon } from "../shared/Icon";
import { PageContainer } from "../shared/PageContainer";
import { Reveal } from "../shared/Reveal";
import { SectionHeader } from "../shared/SectionHeader";
export function NewDrops() {
  const { data: products, loading, error, retry } = useProducts({ new: true });
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
        {loading ? <ProductState kind="loading" /> : error ? <ProductState kind="error" onRetry={retry} /> : products.length === 0 ? <ProductState kind="empty" /> : <div className="products-grid">
          {products.slice(0, 4).map((product, i) => (
            <Reveal key={product.id} stagger={i as 0 | 1 | 2 | 3}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>}
        <p className="section-note eyebrow">
          Generated presentation concepts & illustrative USD prices / Not
          available for purchase
        </p>
      </PageContainer>
    </section>
  );
}
