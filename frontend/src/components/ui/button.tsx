import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Variant styles ────────────────────────────────────────────────────
const variantStyles: Record<string, string> = {
  default:
    "bg-orange-500 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] hover:bg-orange-600 hover:shadow-[0_6px_24px_rgba(249,115,22,0.5)]",
  destructive:
    "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)]",
  outline:
    "border border-orange-200 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-400 hover:shadow-[0_4px_12px_rgba(249,115,22,0.18)]",
  secondary:
    "bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 hover:border-orange-200 hover:shadow-[0_4px_10px_rgba(249,115,22,0.12)]",
  ghost: "text-orange-600 hover:bg-orange-50 hover:text-orange-700",
  link: "text-orange-600 underline-offset-4 hover:underline hover:text-orange-700 shadow-none",
};

const sizeStyles: Record<string, string> = {
  default: "h-10 px-5 py-2.5",
  sm: "h-9 rounded-lg px-4 text-xs",
  lg: "h-12 rounded-xl px-8 text-base",
  icon: "h-10 w-10",
};

const baseStyles = [
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
  "transition-all duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  "active:scale-[0.97]",
  "hover:-translate-y-[1px]",
].join(" ");

// ─── Types ─────────────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  asChild?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    // asChild: render the first child element with button styles
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(
          classes,
          (children as React.ReactElement<any>).props.className,
        ),
        ref,
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
