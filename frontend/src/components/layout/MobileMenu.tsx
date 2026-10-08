import { NavLink } from "react-router-dom";
import { primaryNavigation } from "../../data/navigation";
import { useModal } from "../../hooks/useModal";
import { IconButton } from "../shared/IconButton";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useModal(open);
  return (
    <dialog
      ref={ref}
      className="mobile-menu"
      aria-labelledby="mobile-menu-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mobile-menu__header">
        <span id="mobile-menu-title" className="wordmark">
          HEXSHOES<span aria-hidden="true">+</span>
        </span>
        <IconButton icon="close" label="Close navigation" onClick={onClose} />
      </div>
      <p className="eyebrow muted">Move in a new direction</p>
      <nav aria-label="Mobile primary navigation">
        <ul>
          {primaryNavigation.map((item, i) => (
            <li key={item.to}>
              <NavLink to={item.to} onClick={onClose}>
                <span className="eyebrow muted">0{i + 1}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mobile-menu__utilities">
        <NavLink to="/wishlist" onClick={onClose}>
          Wishlist
        </NavLink>
        <NavLink to="/cart" onClick={onClose}>
          Cart
        </NavLink>
        <NavLink to="/account" onClick={onClose}>
          Account
        </NavLink>
      </div>
      <p className="eyebrow muted">Built for what's next.</p>
    </dialog>
  );
}
