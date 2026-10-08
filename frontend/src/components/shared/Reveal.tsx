import { useEffect, useRef, useState, type ReactNode } from "react";
export function Reveal({
  children,
  stagger = 0,
  className = "",
}: {
  children: ReactNode;
  stagger?: 0 | 1 | 2 | 3;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal reveal--${stagger} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
