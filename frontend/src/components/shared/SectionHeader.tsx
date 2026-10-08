import type { ReactNode } from "react";
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {description && (
        <p className="section-header__description">{description}</p>
      )}
      {action}
    </div>
  );
}
