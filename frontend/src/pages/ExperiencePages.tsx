import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageContainer } from "../components/shared/PageContainer";
import { PresentationImage } from "../components/shared/PresentationImage";
import { Reveal } from "../components/shared/Reveal";
import { ProductCard } from "../components/products/ProductCard";
import { VisualSearchConsole } from "../components/home/VisualSearchConsole";
import { IntelligenceStory } from "../components/home/IntelligenceStory";
import { Newsletter } from "../components/home/Newsletter";
import { presentationProducts } from "../data/presentationProducts";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Icon } from "../components/shared/Icon";
import { useExperience } from "../hooks/useExperience";
import { formatPrice } from "../utils/formatPrice";

const directions = [
  { value: "", label: "All footwear", style: "" },
  { value: "run", label: "Running", style: "runner" },
  { value: "trail", label: "Trail", style: "trail" },
  { value: "lifestyle", label: "Lifestyle", style: "mono" },
  { value: "slides", label: "Slides", style: "slide" },
];
export function ShopPage() {
  useDocumentTitle("Find your direction");
  const [params, setParams] = useSearchParams();
  const direction =
    directions.find((item) => item.value === params.get("category")) ??
    directions[0]!;
  const products = presentationProducts.filter(
    (item) => !direction.style || item.style === direction.style,
  );
  return (
    <div className="route-enter collection-page">
      <section className="collection-banner">
        <PresentationImage
          asset="story"
          alt="Urban movement campaign study"
          sizes="100vw"
          priority
        />
        <PageContainer>
          <p className="eyebrow">HEX / The design collection</p>
          <h1>
            FIND YOUR
            <br />
            DIRECTION.
          </h1>
          <p>Different paths. The same forward perspective.</p>
        </PageContainer>
      </section>
      <section className="paper section collection-content">
        <PageContainer>
          <div className="collection-toolbar">
            <div
              className="collection-filters"
              aria-label="Footwear directions"
            >
              {directions.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  aria-pressed={direction.value === item.value}
                  onClick={() =>
                    setParams(item.value ? { category: item.value } : {})
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="eyebrow">Form / Function / Possibility</span>
          </div>
          <div className="collection-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="quiet-note collection-note">
            Original presentation studies with illustrative prices. A first look
            at the HEXSHOES direction; purchasing is not yet available.
          </p>
        </PageContainer>
      </section>
      <Newsletter />
    </div>
  );
}

export function VisualSearchPage() {
  useDocumentTitle("Visual discovery");
  return (
    <div className="route-enter discovery-page">
      <section className="section">
        <PageContainer>
          <div className="discovery-page__grid">
            <div className="page-heading">
              <p className="eyebrow">
                <span className="signal-dot" />
                AI foundation / Visual discovery
              </p>
              <h1>
                SEE IT.
                <br />
                FIND IT.
                <br />
                <span>WEAR IT.</span>
              </h1>
              <p>When words fall short, start with a different perspective.</p>
              <p className="muted">
                Explore the interface through sample images and the planned
                retrieval pipeline. Future image search will connect visual
                inspiration to the catalog using CLIP embeddings and cosine
                similarity.
              </p>
              <a href="#discovery-details" className="text-link">
                Behind the discovery <Icon name="arrow" size={18} />
              </a>
            </div>
            <VisualSearchConsole />
          </div>
        </PageContainer>
      </section>
      <section className="paper section" id="discovery-details">
        <PageContainer>
          <div className="editorial-heading">
            <p className="eyebrow">A new lens on footwear</p>
            <h2>
              Less searching.
              <br />
              More possibility.
            </h2>
          </div>
          <div className="editorial-columns">
            <article>
              <span className="eyebrow">01 / Bring inspiration</span>
              <h3>Start with an image.</h3>
              <p>
                A silhouette. A texture. A shape that stays with you. A future
                upload flow will turn an image into a starting point.
              </p>
            </article>
            <article>
              <span className="eyebrow">02 / Find a connection</span>
              <h3>Discover through detail.</h3>
              <p>
                OpenCLIP and PyTorch will encode images. Cosine similarity will
                compare embeddings across a verified catalog.
              </p>
            </article>
            <article>
              <span className="eyebrow">03 / Keep it transparent</span>
              <h3>A considered result.</h3>
              <p>
                The current panel uses fixed presentation samples. No retrieval,
                ranking scores, or image analysis runs yet.
              </p>
            </article>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

export function AboutPage() {
  useDocumentTitle("Our perspective");
  return (
    <div className="route-enter">
      <section className="brand-page-hero">
        <PresentationImage
          asset="story"
          alt="Movement through contemporary concrete architecture"
          sizes="100vw"
          priority
        />
        <PageContainer>
          <p className="eyebrow">HEXSHOES / An independent perspective</p>
          <h1>
            MOVEMENT
            <br />
            IS ONLY THE
            <br />
            BEGINNING.
          </h1>
          <p>
            For the way we move.
            <br />
            For the way we discover.
          </p>
        </PageContainer>
      </section>
      <section className="paper section">
        <PageContainer>
          <div className="brand-manifesto">
            <p className="eyebrow">The origin of a direction</p>
            <h2>
              Footwear deserves
              <br />a different perspective.
            </h2>
            <div>
              <p>
                HEXSHOES began with an idea: the experience of discovering
                footwear should be as considered as its design.
              </p>
              <p>
                We are bringing together movement, digital commerce, artificial
                intelligence, and retail intelligence. An independent vision for
                a future footwear business, built with care from its first
                interaction.
              </p>
            </div>
          </div>
          <Reveal>
            <div className="brand-detail">
              <PresentationImage
                asset="texture"
                alt="Performance textile and blue stitching detail"
                sizes="(max-width: 768px) 90vw, 55vw"
              />
              <blockquote>
                “Forward is a way
                <br />
                of thinking.”
                <span className="eyebrow">The HEX perspective</span>
              </blockquote>
            </div>
          </Reveal>
          <div className="editorial-columns">
            <article>
              <span className="eyebrow">H / Hover</span>
              <h3>Move with intention.</h3>
              <p>
                Begin with movement. Let everyday purpose shape the direction.
              </p>
            </article>
            <article>
              <span className="eyebrow">E / Elegance</span>
              <h3>Keep the essential.</h3>
              <p>
                Clear form, considered detail, and an enduring visual language.
              </p>
            </article>
            <article>
              <span className="eyebrow">X / Xperience</span>
              <h3>Discover what’s next.</h3>
              <p>
                A foundation for intelligent discovery, grounded in useful
                experiences.
              </p>
              <Link className="text-link" to="/technology">
                Our technology vision →
              </Link>
            </article>
          </div>
        </PageContainer>
      </section>
      <Newsletter />
    </div>
  );
}

const architecture = [
  {
    step: "01",
    title: "Frontend",
    stack: "React + TypeScript",
    status: "Current foundation",
    detail:
      "Responsive storefront, shared design system, accessible navigation, and local presentation interactions.",
  },
  {
    step: "02",
    title: "Commerce API",
    stack: "Node.js + Express",
    status: "Architecture defined",
    detail:
      "A future REST boundary for catalog operations and commerce workflows.",
  },
  {
    step: "03",
    title: "Data & identity",
    stack: "Firebase / Firestore / Auth",
    status: "Planned integration",
    detail:
      "Verified catalog data and authenticated experiences, with access controls designed before integration.",
  },
  {
    step: "04",
    title: "AI service",
    stack: "FastAPI + Python",
    status: "Service structure",
    detail:
      "A dedicated service boundary for image preparation, embedding requests, and retrieval.",
  },
  {
    step: "05",
    title: "Deep learning",
    stack: "PyTorch + OpenCLIP",
    status: "Model direction",
    detail:
      "Image embeddings from a pretrained vision-language model, with reproducible preprocessing.",
  },
  {
    step: "06",
    title: "Retrieval",
    stack: "Embeddings + Cosine similarity",
    status: "Planned",
    detail:
      "Normalized vector comparison against catalog embeddings, evaluated using appropriate relevance judgments.",
  },
];
export function TechnologyPage() {
  useDocumentTitle("The intelligence architecture");
  return (
    <div className="route-enter technology-page">
      <section className="technology-hero section">
        <PresentationImage asset="texture" alt="" sizes="100vw" priority />
        <PageContainer>
          <p className="eyebrow">AI / ML / DL / Data Science</p>
          <h1>
            INTELLIGENCE.
            <br />
            BY DESIGN.
          </h1>
          <div className="technology-hero__bottom">
            <p>
              An expressive storefront.
              <br />A considered system underneath.
            </p>
            <p className="quiet-note">
              CURRENT FOUNDATION / React + TypeScript
              <br />
              SERVICE AND DATA INTEGRATIONS / Planned
            </p>
          </div>
        </PageContainer>
      </section>
      <section className="paper section">
        <PageContainer>
          <div className="editorial-heading">
            <p className="eyebrow">
              CURRENT FOUNDATION / System architecture
            </p>
            <h2>
              Built in layers.
              <br />
              Designed to connect.
            </h2>
          </div>
          <div
            className="architecture-map"
            aria-label="Planned architecture: React to Express to Firebase, and React to FastAPI to PyTorch and OpenCLIP to cosine similarity retrieval"
          >
            <div className="architecture-map__entry">
              <span className="eyebrow">Experience</span>
              <strong>React + TypeScript</strong>
            </div>
            <div className="architecture-map__branches">
              <div>
                <span className="eyebrow">Commerce path</span>
                <strong>Express API</strong>
                <span aria-hidden="true">↓</span>
                <strong>Firestore / Auth</strong>
              </div>
              <div>
                <span className="eyebrow">Intelligence path</span>
                <strong>FastAPI</strong>
                <span aria-hidden="true">↓</span>
                <strong>PyTorch / OpenCLIP</strong>
                <span aria-hidden="true">↓</span>
                <strong>Cosine similarity</strong>
              </div>
            </div>
          </div>
          <div className="architecture-details">
            {architecture.map((item) => (
              <Reveal key={item.step}>
                <article>
                  <span className="eyebrow">{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p className="architecture-stack">{item.stack}</p>
                  </div>
                  <p>{item.detail}</p>
                  <span className="module-status eyebrow">{item.status}</span>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="technology-status">
            <div>
              <p className="eyebrow">Current foundation</p>
              <p>
                React and TypeScript power the customer-facing storefront.
                Node.js / Express architecture and a FastAPI service structure
                define the application boundaries.
              </p>
            </div>
            <div>
              <p className="eyebrow">Planned integrations</p>
              <p>
                Firebase catalog and identity services are planned. PyTorch and
                OpenCLIP are the model direction; image retrieval is not
                connected.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>
      <section className="paper section technology-roadmap">
        <PageContainer>
          <div className="editorial-heading">
            <p className="eyebrow">Planned intelligence</p>
            <h2>Research directions, clearly marked.</h2>
          </div>
          <IntelligenceStory />
        </PageContainer>
      </section>
    </div>
  );
}

export function ContactPage() {
  useDocumentTitle("Start a conversation");
  const [status, setStatus] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      "Your message preview is ready. Nothing was sent or stored.",
    );
  }
  return (
    <div className="route-enter contact-page section">
      <PageContainer>
        <div className="contact-grid">
          <div className="page-heading">
            <p className="eyebrow">HEXSHOES / Contact</p>
            <h1>
              LET’S MOVE
              <br />
              FORWARD.
            </h1>
            <p>
              A question. A perspective.
              <br />A possibility worth exploring.
            </p>
            <div className="contact-topics">
              <article>
                <h2>Brand & partnerships</h2>
                <p>
                  Shared ideas, considered collaborations, and new directions.
                </p>
              </article>
              <article>
                <h2>Technology & discovery</h2>
                <p>
                  Conversations around intelligent commerce and the future of
                  retail.
                </p>
              </article>
            </div>
          </div>
          <form className="contact-form" onSubmit={submit}>
            <p className="eyebrow">Start a conversation</p>
            <label htmlFor="contact-name">Your name</label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Name"
            />
            <label htmlFor="contact-email">Email address</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
            <label htmlFor="contact-subject">What’s on your mind?</label>
            <select
              id="contact-subject"
              name="subject"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a direction
              </option>
              <option>General enquiry</option>
              <option>Brand partnership</option>
              <option>Technology conversation</option>
              <option>Collection enquiry</option>
            </select>
            <label htmlFor="contact-message">Your message</label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              minLength={10}
              maxLength={2000}
              placeholder="Tell us a little more…"
              aria-describedby="contact-note"
            />
            <button type="submit" className="button button--light">
              Preview message <Icon name="arrow" size={18} />
            </button>
            <p id="contact-note" className="quiet-note">
              This is a local form preview. Messages are not sent or stored.
            </p>
            <p role="status" className="contact-status">
              {status}
            </p>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}

export function EmptyCollectionPage({ kind }: { kind: "cart" | "wishlist" }) {
  const wishlist = kind === "wishlist";
  useDocumentTitle(wishlist ? "Your inspiration" : "Your bag");
  const experience = useExperience();
  const savedProducts = presentationProducts.filter((product) =>
    experience.wishlist.includes(product.id),
  );
  const subtotal = experience.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  if (wishlist && savedProducts.length > 0) {
    return (
      <div className="route-enter saved-styles-page">
        <PageContainer>
          <section className="saved-styles-heading section">
            <p className="eyebrow">PERSONAL SPACE / SAVED STYLES</p>
            <h1>KEEP WHAT MOVES YOU.</h1>
            <p>Styles saved during this visit. Reloading clears this list.</p>
          </section>
          <div className="collection-grid retail-grid saved-styles-grid">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="quiet-note retail-disclaimer">
            Presentation concepts only. Saved styles are held in memory for this visit.
          </p>
        </PageContainer>
      </div>
    );
  }

  if (!wishlist && experience.cart.length > 0) {
    return (
      <div className="route-enter cart-page">
        <PageContainer>
          <section className="cart-heading section">
            <p className="eyebrow">SHOPPING / VISIT-ONLY BAG</p>
            <h1>YOUR NEXT MOVE.</h1>
            <p>Presentation selections held in memory for this visit.</p>
          </section>
          <div className="cart-layout">
            <div className="cart-lines">
              {experience.cart.map((line) => (
                <article className="cart-line" key={`${line.product.id}:${line.size}`}>
                  <Link className="cart-line__image" to={`/product/${line.product.id}`}>
                    <PresentationImage
                      asset={line.product.style}
                      alt={`${line.product.name} presentation study`}
                      sizes="(max-width: 600px) 30vw, 180px"
                    />
                  </Link>
                  <div className="cart-line__details">
                    <p className="eyebrow muted">{line.product.code} / DESIGN STUDY</p>
                    <Link to={`/product/${line.product.id}`}><h2>{line.product.name}</h2></Link>
                    <p className="cart-line__size">Presentation size / {line.size}</p>
                    <div className="cart-line__actions">
                      <div className="product-quantity" aria-label={`Quantity for ${line.product.name}`}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => experience.updateCartQuantity(line.product.id, line.size, line.quantity - 1)}
                        >−</button>
                        <output aria-live="polite">{line.quantity}</output>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => experience.updateCartQuantity(line.product.id, line.size, line.quantity + 1)}
                        >+</button>
                      </div>
                      <button
                        type="button"
                        className="cart-line__remove"
                        onClick={() => experience.removeCartItem(line.product.id, line.size)}
                      >Remove</button>
                    </div>
                  </div>
                  <span className="cart-line__price">
                    {formatPrice(line.product.price * line.quantity, line.product.currency)}
                    <span>Illustrative</span>
                  </span>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <p className="eyebrow">PRESENTATION SUMMARY</p>
              <div><span>Illustrative subtotal</span><strong>{formatPrice(subtotal, "USD")}</strong></div>
              <p className="quiet-note">No shipping, taxes, checkout, or payment are calculated.</p>
              <Link className="button button--outline" to="/shop">Continue exploring <Icon name="arrow" size={18} /></Link>
            </aside>
          </div>
          <p className="quiet-note retail-disclaimer">This visit-only bag clears when the page is reloaded. No order is created.</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="route-enter empty-collection paper">
      <PageContainer>
        <section className="empty-collection__hero">
          <div>
            <p className="eyebrow">
              {wishlist ? "PERSONAL SPACE / SAVED STYLES" : "SHOPPING / YOUR BAG"}
            </p>
            <h1>
              {wishlist ? (
                <>
                  KEEP YOUR
                  <br />
                  NEXT MOVE
                  <br />
                  CLOSE.
                </>
              ) : (
                <>
                  ROOM FOR
                  <br />
                  WHAT’S NEXT.
                </>
              )}
            </h1>
            <p>
              {wishlist
                ? "A considered place for the concepts that catch your eye. Start with a direction that feels like you."
                : "Every new direction starts somewhere. Explore the footwear studies shaping the HEXSHOES perspective."}
            </p>
            <Link to="/shop" className="button">
              Explore collection <Icon name="arrow" size={18} />
            </Link>
            <p className="quiet-note">
              {wishlist
                ? "Saved styles stay in memory for this visit and clear when the page is reloaded."
                : "The bag is a local presentation only. Checkout and payment are not available."}
            </p>
          </div>
          <PresentationImage
            asset={wishlist ? "mono" : "runner"}
            alt="Footwear design study"
            sizes="(max-width: 768px) 90vw, 45vw"
            priority
          />
        </section>
        <section className="empty-collection__teaser">
          <div className="editorial-heading">
            <p className="eyebrow">A little inspiration</p>
            <h2>Find your starting point.</h2>
          </div>
          <div className="collection-grid">
            {presentationProducts.slice(0, 2).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="quiet-note collection-note">
            Presentation studies / Illustrative prices
          </p>
        </section>
      </PageContainer>
    </div>
  );
}
