import { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../components/shared/PageContainer";
import { PresentationImage } from "../components/shared/PresentationImage";
import { ProductCard } from "../components/products/ProductCard";
import { Icon } from "../components/shared/Icon";
import { useExperience } from "../hooks/useExperience";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { presentationProducts } from "../data/presentationProducts";
import type { FootwearStyle } from "../types/product";

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
  const products = presentationProducts.filter(
    (product) => selected === "all" || product.style === selected,
  );
  return (
    <section className="retail-products section">
      <PageContainer>
        <div className="retail-products__top">
          <div>
            <p className="eyebrow">{audience.toUpperCase()} / Design collection</p>
            <h2>Four directions. Room to move.</h2>
          </div>
          <span className="eyebrow muted">Presentation studies / 04</span>
        </div>
        <div className="retail-products__toolbar">
          <CollectionFilters selected={selected} onChange={setSelected} />
          <span className="eyebrow muted">{products.length} design studies</span>
        </div>
        <div className="collection-grid retail-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
            <p className="eyebrow">Current presentation / 04 styles</p>
            <p>Explore each study, open a quick view, or save a style for this visit.</p>
          </div>
          <div className="collection-grid retail-grid new-drops-grid">
            {presentationProducts.map((product, index) => (
              <div className="new-drops-item" key={product.id}>
                <span className="new-drops-item__index eyebrow">0{index + 1} / {product.code}</span>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <p className="quiet-note retail-disclaimer">
            Presentation concepts and illustrative prices only. No inventory,
            checkout, or payment is connected.
          </p>
        </PageContainer>
      </section>
    </div>
  );
}

const accountModules = [
  {
    index: "01",
    title: "Saved Styles",
    description: "Return to the footwear concepts you have saved this visit.",
    to: "/wishlist",
    action: "View saved styles",
  },
  {
    index: "02",
    title: "Recent Discovery",
    description: "Pick up with the latest HEXSHOES presentation studies.",
    to: "/new-drops",
    action: "Explore new drops",
  },
  {
    index: "03",
    title: "Fit Preferences",
    description: "Choose a presentation size while exploring a product concept.",
    to: "/shop",
    action: "Explore footwear",
  },
];

export function AccountPage() {
  useDocumentTitle("Your HEX space");
  const { wishlist } = useExperience();
  return (
    <div className="route-enter account-page">
      <section className="account-intro section">
        <PageContainer>
          <p className="eyebrow">ACCOUNT / PERSONAL SPACE</p>
          <h1>YOUR HEX SPACE.</h1>
          <p className="account-intro__copy">
            A considered home for the styles and ideas that move you.
          </p>
          <span className="account-intro__mark" aria-hidden="true">H<span>+</span></span>
        </PageContainer>
      </section>
      <section className="account-modules section">
        <PageContainer>
          <div className="account-modules__grid">
            {accountModules.map((module) => (
              <article key={module.index}>
                <span className="eyebrow muted">{module.index} / PERSONAL SPACE</span>
                <h2>{module.title}</h2>
                <p>{module.description}</p>
                {module.title === "Saved Styles" && wishlist.length > 0 && (
                  <span className="account-module__count">{wishlist.length} saved this visit</span>
                )}
                <Link className="text-link" to={module.to}>
                  {module.action} <Icon name="arrow" size={18} />
                </Link>
              </article>
            ))}
            <article className="account-access">
              <span className="eyebrow muted">04 / ACCOUNT ACCESS</span>
              <h2>Access, with care.</h2>
              <p>
                Account services are not connected. No sign-in or personal
                information is collected here.
              </p>
              <span className="account-access__status eyebrow">
                SECURE SIGN-IN WILL BE ENABLED WITH ACCOUNT SERVICES.
              </span>
            </article>
          </div>
          <p className="quiet-note account-note">
            Saved styles are held in this visit only and clear when the page is
            reloaded.
          </p>
        </PageContainer>
      </section>
    </div>
  );
}