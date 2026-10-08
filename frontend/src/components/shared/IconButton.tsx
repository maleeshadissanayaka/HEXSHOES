import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "./Icon";

type Props = { icon: IconName; label: string; className?: string } & (
  { to: string } | (ButtonHTMLAttributes<HTMLButtonElement> & { to?: never })
);
export function IconButton({ icon, label, className = "", ...props }: Props) {
  const classes = `icon-button ${className}`;
  if (props.to !== undefined)
    return (
      <Link to={props.to} className={classes} aria-label={label}>
        <Icon name={icon} />
      </Link>
    );
  return (
    <button type="button" {...props} className={classes} aria-label={label}>
      <Icon name={icon} />
    </button>
  );
}
