import type { HTMLAttributes } from "react";
export function PageContainer({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`container ${className}`} {...props} />;
}
