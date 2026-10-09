import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageContainer } from "../components/shared/PageContainer";
import { PresentationImage } from "../components/shared/PresentationImage";
import { ProductCard } from "../components/products/ProductCard";
import { Icon } from "../components/shared/Icon";
import { useExperience } from "../hooks/useExperience";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { presentationProducts } from "../data/presentationProducts";
import { formatPrice } from "../utils/formatPrice";
import type { PresentationMediaName } from "../data/presentationMedia";
import { NotFoundPage } from "./ShellPages";

const galleryLabels: Record<PresentationMediaName, string> = {
  hero: "Campaign study",
  runner: "Runner design study",
  trail: "Trail design study",
  mono: "Everyday design study",
  slide: "Slide design study",
  story: "Movement study",
  texture: "Material direction study",
};

const designNotes = {
  runner: {
    direction: "Running",
    story: "A study in forward momentum, layered form, and a vivid cobalt detail.",
  },
  trail: {
    direction: "Trail",
    story: "A visual exploration of grounded geometry and movement beyond the expected path.",
  },
  slide: {
    direction: "Slides",
    story: "An exercise in reduction: a direct silhouette with a confident, sculptural profile.",
  },
  mono: {
    direction: "Lifestyle",
    story: "A quieter everyday study balancing considered proportion with a distinct line.",
  },
} as const;

const sizes = ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
const gallery = ["product", "story", "texture"] as const;

export function ProductPage() {
  const { id } = useParams();
  const product = presentationProducts.find((item) => item.id === id);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const { addToCart, wishlist, toggleWishlist } = useExperience();
  useDocumentTitle(product?.name ?? "Product concept");

  if (!product) return <NotFoundPage />;

  const media = gallery[galleryIndex] === "product" ? product.style : gallery[galleryIndex]!;
  const isSaved = wishlist.includes(product.id);
  const related = presentationProducts.filter((item) => item.id !== product.id);
  const note = designNotes[product.style];

  const addPresentationItem = () => {
    if (!selectedSize) {
      setStatus("Choose a presentation size to add this concept to your visit-only bag.");
      return;
    }
    addToCart(product, selectedSize, quantity);
    setStatus(`${product.name} added to your visit-only bag.`);
  };

  return (
    <div className="route-enter product-page">
      <section className="product-detail section">
        <PageContainer>
          <div className="product-detail__layout">
            <div className="product-gallery">
              <div className="product-gallery__main">
                <PresentationImage
                  asset={media}
                  alt={`${product.name} / ${galleryLabels[media]}`}
                  sizes="(max-width: 800px) 100vw, 58vw"
                  priority
                />
                <span className="eyebrow product-gallery__caption">
                  {galleryLabels[media]} / {String(galleryIndex + 1).padStart(2, "0")}
                </span>
                <div className="product-gallery__arrows">
                  <button
                    type="button"
                    aria-label="Previous presentation image"
                    onClick={() => setGalleryIndex((galleryIndex + gallery.length - 1) % gallery.length)}
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Next presentation image"
                    onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)}
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
              <div className="product-gallery__thumbs" aria-label="Presentation image gallery">
                {gallery.map((item, index) => {
                  const asset = item === "product" ? product.style : item;
                  return (
                    <button
                      type="button"
                      key={item}
                      aria-label={`Show ${galleryLabels[asset]}`}
                      aria-pressed={galleryIndex === index}
                      onClick={() => setGalleryIndex(index)}
                    >
                      <PresentationImage
                        asset={asset}
                        alt=""
                        sizes="120px"
                      />
                    </button>
                  );
                })}
              </div>
              <p className="quiet-note product-gallery__note">
                Generated presentation imagery. Not retail photography.
              </p>
            </div>

            <div className="product-detail__copy">
              <p className="eyebrow product-detail__code">HEX / {product.code} / DESIGN STUDY</p>
              <h1>{product.name}</h1>
              <p className="product-detail__price">
                {formatPrice(product.price, product.currency)}
                <span>Illustrative price</span>
              </p>
              <p className="product-detail__description">{note.story}</p>
              <div className="product-detail__category">
                <span className="eyebrow muted">DESIGN DIRECTION</span>
                <span>{note.direction}</span>
              </div>
              <div className="product-palette">
                <div className="product-palette__heading">
                  <span className="eyebrow">Color direction</span>
                  <span className="eyebrow muted">PALETTE STUDY</span>
                </div>
                <div className="product-palette__swatches" aria-label="Ink, cobalt, and chalk palette study">
                  <span className="swatch swatch--ink" title="Ink" />
                  <span className="swatch swatch--cobalt" title="Cobalt" />
                  <span className="swatch swatch--chalk" title="Chalk" />
                  <span className="eyebrow muted">Ink / Cobalt / Chalk</span>
                </div>
              </div>

              <fieldset className="product-sizes">
                <legend>Presentation size <span>US sizing study</span></legend>
                <div>
                  {sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      aria-pressed={selectedSize === size}
                      onClick={() => {
                        setSelectedSize(size);
                        setStatus("");
                      }}
                    >
                      {size.replace("US ", "")}
                    </button>
                  ))}
                </div>
                <p className="quiet-note">Illustrative size selection only. Fit and availability are not confirmed.</p>
              </fieldset>

              <div className="product-buy-row">
                <div className="product-quantity" aria-label="Quantity">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  >−</button>
                  <output aria-live="polite">{quantity}</output>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((value) => value + 1)}
                  >+</button>
                </div>
                <button className="button product-add" type="button" onClick={addPresentationItem}>
                  Add to bag <Icon name="arrow" size={18} />
                </button>
                <button
                  className="product-save"
                  type="button"
                  aria-label={isSaved ? "Remove from saved styles" : "Save to wishlist"}
                  aria-pressed={isSaved}
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Icon name="heart" size={20} />
                </button>
              </div>
              <p className="product-detail__status" role="status" aria-live="polite">{status}</p>
              <p className="quiet-note product-detail__honesty">
                Local presentation interaction only. No real inventory, checkout,
                payment, or order is connected.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="product-story paper section">
        <PageContainer>
          <div className="product-story__intro">
            <p className="eyebrow">{product.code} / The design study</p>
            <h2>A direction, not a specification.</h2>
            <p>{note.story} This original concept explores how a footwear silhouette can express a point of view.</p>
          </div>
          <div className="product-story__details">
            <article>
              <span className="eyebrow">01 / MATERIAL DIRECTION</span>
              <h3>Visual reference only.</h3>
              <p>The generated imagery suggests texture and construction language. Confirmed materials and performance specifications are not available.</p>
            </article>
            <article>
              <span className="eyebrow">02 / FORM & MOVEMENT</span>
              <h3>Designed to explore.</h3>
              <p>{note.direction} is the creative direction for this study, not a verified product category or performance claim.</p>
            </article>
          </div>
        </PageContainer>
      </section>

      <section className="product-related section">
        <PageContainer>
          <div className="retail-products__top">
            <div>
              <p className="eyebrow">Continue exploring</p>
              <h2>Other directions.</h2>
            </div>
            <Link className="text-link" to="/shop">All footwear <Icon name="arrow" size={18} /></Link>
          </div>
          <div className="collection-grid retail-grid">
            {related.slice(0, 3).map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </PageContainer>
      </section>

      <section className="product-discovery">
        <PresentationImage asset="story" alt="HEXSHOES visual discovery campaign study" sizes="100vw" />
        <PageContainer>
          <div>
            <p className="eyebrow">AI FOUNDATION / VISUAL DISCOVERY</p>
            <h2>Start with a different perspective.</h2>
            <Link className="button" to="/visual-search">
              Explore visual search <Icon name="arrow" size={18} />
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}