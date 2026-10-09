import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExperienceContext } from "../../hooks/useExperience";
import type { ExperienceDialog } from "../../types/experience";
import { PremiumModal } from "../shared/PremiumModal";
import { PresentationImage } from "../shared/PresentationImage";
import { Icon } from "../shared/Icon";
import { QuickView } from "../products/QuickView";
import { HexAssistant, AssistantLauncher } from "../assistant/HexAssistant";
import type { CartLine } from "../../types/product";

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ExperienceDialog | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const openDialog = useMemo(
    () => (next: ExperienceDialog) => setDialog(next),
    [],
  );
  const closeDialog = useMemo(() => () => setDialog(null), []);
  const api = useMemo(
    () => ({
      open: openDialog,
      close: closeDialog,
      cart,
      wishlist,
      toggleWishlist: (productId: string) =>
        setWishlist((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        ),
      addToCart: (product: CartLine["product"], size: string, quantity: number) =>
        setCart((current) => {
          const existing = current.find(
            (item) => item.product.id === product.id && item.size === size,
          );
          return existing
            ? current.map((item) =>
                item === existing
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...current, { product, size, quantity }];
        }),
      updateCartQuantity: (productId: string, size: string, quantity: number) =>
        setCart((current) =>
          current.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        ),
      removeCartItem: (productId: string, size: string) =>
        setCart((current) =>
          current.filter(
            (item) => item.product.id !== productId || item.size !== size,
          ),
        ),
      removeWishlistItem: (productId: string) =>
        setWishlist((current) => current.filter((id) => id !== productId)),
    }),
    [cart, wishlist, openDialog, closeDialog],
  );
  const title =
    dialog?.kind === "quick-view"
      ? `${dialog.product.name} quick view`
      : dialog?.kind === "information"
        ? dialog.title
        : dialog?.kind === "assistant"
          ? "HEX Assistant"
          : dialog?.kind === "search"
            ? "search information"
            : "campaign preview";
  return (
    <ExperienceContext.Provider value={api}>
      {children}
      <AssistantLauncher />
      <PremiumModal
        open={dialog !== null}
        onClose={api.close}
        title={title}
        variant={
          dialog?.kind === "assistant"
            ? "assistant"
            : dialog?.kind === "quick-view" || dialog?.kind === "campaign"
              ? "wide"
              : dialog?.kind === "search"
                ? "search"
                : "standard"
        }
      >
        {dialog?.kind === "quick-view" && (
          <QuickView product={dialog.product} />
        )}
        {dialog?.kind === "assistant" && <HexAssistant />}
        {dialog?.kind === "campaign" && (
          <div className="campaign-preview">
            <PresentationImage
              asset="hero"
              alt="HEXSHOES generated footwear campaign study"
              sizes="(max-width: 700px) 94vw, 1000px"
              priority
            />
            <div className="dialog-copy">
              <p className="eyebrow">HEX / Movement study</p>
              <h3>Built for what’s next.</h3>
              <p>
                A study in motion, material, and possibility. Original generated
                campaign imagery.
              </p>
              <Link to="/shop" onClick={api.close} className="text-link">
                <span>Explore the collection</span>
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
        )}
        {dialog?.kind === "information" && (
          <div className="dialog-copy">
            <p className="eyebrow">HEXSHOES / Good to know</p>
            <h3>{dialog.title}</h3>
            <p>{dialog.description}</p>
            <button className="button button--light" onClick={api.close}>
              Got it
              <Icon name="check" size={18} />
            </button>
          </div>
        )}
        {dialog?.kind === "search" && (
          <div className="dialog-copy">
            <p className="eyebrow">A different way to discover</p>
            <h3>
              Your next pair.
              <br />A new perspective.
            </h3>
            <p>
              Explore the collection by direction, or try the visual-discovery
              presentation. Connected catalog search will arrive with the
              collection.
            </p>
            <Link
              className="button button--light"
              to="/visual-search"
              onClick={api.close}
            >
              Visual search
              <Icon name="arrow" size={18} />
            </Link>
            <Link to="/shop" onClick={api.close} className="text-link">
              <span>Explore all footwear</span>
              <Icon name="arrow" size={18} />
            </Link>
          </div>
        )}
      </PremiumModal>
    </ExperienceContext.Provider>
  );
}
