import { useRef, type PointerEvent } from "react";
/** A maximum 3px media shift. Disabled for touch and reduced-motion users. */
export function usePointerDepth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  function onPointerMove(event: PointerEvent<T>) {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      -3,
      Math.min(3, ((event.clientX - bounds.left) / bounds.width - 0.5) * 6),
    );
    const y = Math.max(
      -3,
      Math.min(3, ((event.clientY - bounds.top) / bounds.height - 0.5) * 6),
    );
    event.currentTarget.style.setProperty("--pointer-x", `${x}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}px`);
  }
  function onPointerLeave() {
    ref.current?.style.removeProperty("--pointer-x");
    ref.current?.style.removeProperty("--pointer-y");
  }
  return { ref, onPointerMove, onPointerLeave };
}
