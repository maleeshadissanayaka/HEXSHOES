import { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../../hooks/useModal";
import { IconButton } from "./IconButton";
import "./premium-modal.css";

export function PremiumModal({
  open,
  title,
  children,
  onClose,
  variant = "standard",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  variant?: "standard" | "wide" | "assistant" | "search";
}) {
  const ref = useModal(open);
  const id = useId();
  return createPortal(
    <dialog
      ref={ref}
      className={`premium-modal premium-modal--${variant} ${variant === "search" ? "search-dialog" : ""}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="premium-modal__surface">
        <h2 id={id} className="sr-only">
          {title}
        </h2>
        <IconButton
          icon="close"
          label={`Close ${title}`}
          onClick={onClose}
          className="premium-modal__close"
        />
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
