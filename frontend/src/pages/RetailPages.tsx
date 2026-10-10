import { useState } from "react";
import { PageContainer } from "../components/shared/PageContainer";
import { PresentationImage } from "../components/shared/PresentationImage";
import { ProductCard } from "../components/products/ProductCard";
import { Icon } from "../components/shared/Icon";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { FootwearStyle } from "../types/product";
import { useProducts } from "../hooks/useProducts";
import { ProductState } from "../components/products/ProductState";
import { productsForAudience } from "../services/productCollections";

const filters: { value: "all" | FootwearStyle; label: string }[] = [
  { value: "all", label: "All studies" },
  { value: "runner", label: "Running" },
  { value: "trail", label: "Trail" },
  { value: "mono", label: "Lifestyle" },
  { value: "slide", label: "Slides" },
];

function CollectionFilters({
  selected,
  onChange,
}: {
  selected: "all" | FootwearStyle;
  onChange: (value: "all" | FootwearStyle) => void;
}) {
  return (
    <div className="retail-filters" aria-label="Filter design studies">
      {filters.map((filter) => (
        <button
          type="button"
          key={filter.value}
          aria-pressed={selected === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

function CollectionGrid({
  audience,
}: {
  audience: "men" | "women";
}) {
  const [selected, setSelected] = useState<"all" | FootwearStyle>("all");
  const { data: direct, loading: directLoading, error: directError, retry: retryDirect } = useProducts({ audience });
  const { data: unisex, loading: unisexLoading, error: unisexError, retry: retryUnisex } = useProducts({ audience: "unisex" });
  const audienceProducts = productsForAudience(audience, [...direct, ...unisex]).filter(
    (product, index, all) => all.findIndex((item) => item.id === product.id) === index,
  );
  const products = audienceProducts.filter(
    (product) => selected === "all" || product.style === selected,
  );
  const loading = directLoading || unisexLoading;
  const error = directError ?? unisexError;
  const retry = () => { retryDirect(); retryUnisex(); };
  return (
    <section className="retail-products section">
      <PageContainer>
        <div className="retail-products__top">
          <div>
            <p className="eyebrow">{audience.toUpperCase()} / Design collection</p>
            <h2>Four directions. Room to move.</h2>
          </div>
          <span className="eyebrow muted">Presentation studies / {String(audienceProducts.length).padStart(2, "0")}</span>
        </div>
        <div className="retail-products__toolbar">
          <CollectionFilters selected={selected} onChange={setSelected} />
          <span className="eyebrow muted">{products.length} design studies</span>
        </div>
        {loading ? <ProductState kind="loading" /> : error ? <ProductState kind="error" onRetry={retry} /> : products.length === 0 ? <ProductState kind="empty" /> : <div className="collection-grid retail-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>}
        <p className="quiet-note retail-disclaimer">
          Original presentation concepts with illustrative prices. These studies
          are not available to purchase.
        </p>
      </PageContainer>
    </section>
  );
}

export function MenPage() {
  useDocumentTitle("Men's collection");
  return (
    <div className="route-enter retail-page retail-page--men">
      <section className="retail-campaign retail-campaign--men">
        <PresentationImage
          asset="hero"
          alt="HEXSHOES performance footwear campaign study"
          sizes="100vw"
          priority
        />
        <PageContainer>
          <p className="eyebrow"><span className="signal-dot" /> MEN / HEXSHOES</p>
          <h1>
            BUILT FOR
            <br />
            WHAT MOVES.
          </h1>
          <p>
            Form follows forward motion. Explore four footwear design studies
            shaped by different ways of moving.
          </p>
          <a className="button" href="#men-studies">
            Explore the studies <Icon name="arrow" size={18} />
          </a>
          <span className="retail-campaign__index eyebrow">MOVEMENT / 01—04</span>
        </PageContainer>
      </section>
      <div id="men-studies"><CollectionGrid audience="men" /></div>
    </div>
  );
}

export function WomenPage() {
  useDocumentTitle("Women's collection");
  return (
    <div className="route-enter retail-page retail-page--women">
      <section className="women-campaign">
        <PageContainer className="women-campaign__inner">
          <div className="women-campaign__copy">
            <p className="eyebrow"><span className="signal-dot" /> WOMEN / HEXSHOES</p>
            <h1>
              FIND
              <br />
              YOUR
              <br />
              OWN LINE.
            </h1>
            <p>
              A fresh perspective on movement, proportion, and everyday form.
              Four design studies, each with its own direction.
            </p>
            <a className="button" href="#women-studies">
              Explore the studies <Icon name="arrow" size={18} />
            </a>
            <span className="eyebrow women-campaign__note">AN OPEN STUDY IN FORM</span>
          </div>
          <div className="women-campaign__image">
            <PresentationImage
              asset="story"
              alt="Footwear movement study in contemporary architecture"
              sizes="(max-width: 800px) 100vw, 55vw"
              priority
            />
            <span className="eyebrow">FORM / FUNCTION / POSSIBILITY</span>
          </div>
        </PageContainer>
      </section>
      <div id="women-studies"><CollectionGrid audience="women" /></div>
    </div>
  );
}

export function NewDropsPage() {
  useDocumentTitle("New drops");
  const { data: products, loading, error, retry } = useProducts({ new: true });
  return (
    <div className="route-enter new-drops-page">
      <section className="new-drops-intro">
        <PresentationImage
          asset="texture"
          alt="HEXSHOES material and movement visual study"
          sizes="100vw"
          priority
        />
        <PageContainer>
          <p className="eyebrow"><span className="signal-dot" /> NEW DROPS / DESIGN STUDIES</p>
          <h1>
            THE NEXT
            <br />
            FORM TAKES SHAPE.
          </h1>
          <div className="new-drops-intro__bottom">
            <p>Four original concepts. A first look at the HEXSHOES direction.</p>
            <span className="eyebrow">01—04 / ILLUSTRATIVE PRICES</span>
          </div>
        </PageContainer>
      </section>
      <section className="new-drops-products section">
        <PageContainer>
          <div className="new-drops-products__heading">
            <p className="eyebrow">Current presentation / {String(products.length).padStart(2, "0")} styles</p>
            <p>Explore each study, open a quick view, or save a style for this visit.</p>
          </div>
          {loading ? <ProductState kind="loading" /> : error ? <ProductState kind="error" onRetry={retry} /> : products.length === 0 ? <ProductState kind="empty" /> : <div className="collection-grid retail-grid new-drops-grid">
            {products.map((product, index) => (
              <div className="new-drops-item" key={product.id}>
                <span className="new-drops-item__index eyebrow">0{index + 1} / {product.code}</span>
                <ProductCard product={product} />
              </div>
            ))}
          </div>}
          <p className="quiet-note retail-disclaimer">
            Presentation concepts and illustrative prices only. No inventory,
            checkout, or payment is connected.
          </p>
        </PageContainer>
      </section>
    </div>
  );
}
