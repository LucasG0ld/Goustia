import type { ButtonHTMLAttributes } from "react";

import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-brand bg-brand text-white hover:border-brand-hover hover:bg-brand-hover active:translate-y-px",
  secondary:
    "border-border bg-surface text-foreground hover:border-brand hover:bg-brand-soft",
  ghost:
    "border-transparent bg-transparent text-foreground hover:bg-surface-muted",
  danger:
    "border-danger bg-danger text-white hover:brightness-90 active:translate-y-px",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-12 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
