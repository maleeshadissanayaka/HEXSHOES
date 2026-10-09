import { useExperience } from "../../hooks/useExperience";
import { Link } from "react-router-dom";
import type { PresentationProduct } from "../../types/product";
import { formatPrice } from "../../utils/formatPrice";
import { Icon } from "../shared/Icon";
import { PresentationImage } from "../shared/PresentationImage";
import "./product-card.css";

export function ProductCard({ product }: { product: PresentationProduct }) {
  const { open, wishlist, toggleWishlist } = useExperience();
  const isSaved = wishlist.includes(product.id);
  return (
    <article className="product-card">
      <div
        className={`product-card__visual product-card__visual--${product.style}`}
      >
        <span className="product-card__tag eyebrow">HEX / {product.code}</span>
        <button
          type="button"
          className="product-card__wishlist"
          title={isSaved ? "Remove from saved styles" : "Save this style"}
          aria-label={`${isSaved ? "Remove" : "Save"} ${product.name} ${isSaved ? "from" : "to"} saved styles`}
          aria-pressed={isSaved}
          onClick={() => toggleWishlist(product.id)}
        >
          <Icon name="heart" size={18} />
        </button>
        <Link
          to={`/product/${product.id}`}
          className="product-card__image"
          aria-label={`Explore ${product.name} concept`}
        >
          <PresentationImage
            asset={product.style}
            alt={`${product.name} — generated presentation concept`}
            sizes="(max-width: 600px) 45vw, (max-width: 1100px) 46vw, 23vw"
          />
        </Link>
        <button
          type="button"
          className="product-card__explore eyebrow"
          aria-label={`Quick view ${product.name}`}
          onClick={() => open({ kind: "quick-view", product })}
        >
          Quick view <Icon name="plus" size={14} />
        </button>
      </div>
      <Link to={`/product/${product.id}`} className="product-card__details">
        <div>
          <p className="eyebrow muted">{product.code} / Design collection</p>
          <h3>{product.name}</h3>
        </div>
        <span className="product-card__price">
          {formatPrice(product.price, product.currency)}
          <span className="sr-only"> illustrative price</span>
        </span>
      </Link>
    </article>
  );
}
