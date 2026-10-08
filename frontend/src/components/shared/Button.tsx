import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "light" | "outline";
  arrow?: boolean;
  className?: string;
};
type ButtonProps = CommonProps &
  ({ to: string } | (ButtonHTMLAttributes<HTMLButtonElement> & { to?: never }));

export function Button({
  children,
  variant = "primary",
  arrow = true,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `button button--${variant} ${className}`;
  const content = (
    <>
      {children}
      {arrow && <Icon name="arrow" size={18} />}
    </>
  );
  if (props.to !== undefined)
    return (
      <Link to={props.to} className={classes}>
        {content}
      </Link>
    );
  return (
    <button type="button" {...props} className={classes}>
      {content}
    </button>
  );
}
