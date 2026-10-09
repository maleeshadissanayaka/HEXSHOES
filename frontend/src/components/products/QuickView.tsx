import { Link } from "react-router-dom";
import type { PresentationProduct } from "../../types/product";
import { useExperience } from "../../hooks/useExperience";
import { formatPrice } from "../../utils/formatPrice";
import { PresentationImage } from "../shared/PresentationImage";
import { Icon } from "../shared/Icon";

export function QuickView({ product }: { product: PresentationProduct }) {
  const { close, wishlist, toggleWishlist } = useExperience();
  const isSaved = wishlist.includes(product.id);
  return (
    <div className="quick-view">
      <div className="quick-view__media">
        <PresentationImage
          asset={product.style}
          alt={`${product.name} presentation study`}
          sizes="(max-width: 700px) 90vw, 460px"
          priority
        />
        <span className="eyebrow">HEX / Form in motion</span>
      </div>
      <div className="quick-view__copy">
        <p className="eyebrow muted">{product.code} / Design collection</p>
        <h3>{product.name}</h3>
        <p className="quick-view__price">
          {formatPrice(product.price, product.currency)}{" "}
          <span>Illustrative price</span>
        </p>
        <p>
          Considered form. A distinct direction. An early look at the footwear
          perspective shaping HEXSHOES.
        </p>
        <div className="quick-view__detail">
          <span>Movement</span>
          <span>
            {product.style === "runner"
              ? "Running"
              : product.style === "mono"
                ? "Everyday"
                : product.style === "trail"
                  ? "Outdoors"
                  : "Recovery & downtime"}
          </span>
        </div>
        <p className="quiet-note">
          Presentation concept. Product specifications and purchasing will
          follow a verified collection.
        </p>
        <Link
          className="button button--light"
          to={`/product/${product.id}`}
          onClick={close}
        >
          Explore the concept <Icon name="arrow" size={18} />
        </Link>
        <button
          className="text-link"
          type="button"
          aria-pressed={isSaved}
          onClick={() => toggleWishlist(product.id)}
        >
          <Icon name="heart" size={17} />
          <span>{isSaved ? "Saved to wishlist" : "Save this style"}</span>
        </button>
      </div>
    </div>
  );
}
