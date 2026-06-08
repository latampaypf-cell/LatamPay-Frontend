import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Spinner } from "../ui/Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  children?: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-500 text-slate-950 hover:scale-[1.02] focus-visible:ring-cyan-400",
  secondary:
    "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 focus-visible:ring-cyan-400",
  ghost:
    "text-slate-300 hover:bg-white/5 focus-visible:ring-cyan-400",
  danger:
    "bg-red-500 text-white hover:scale-[1.02] focus-visible:ring-red-400",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-3 text-base gap-2",
  lg: "px-6 py-3.5 text-base gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      className = "",
      type = "button",
      disabled,
      children,
      ...rest
    },
    ref,
  ) => {
    const iconSize = size === "sm" ? 14 : 18;
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...rest}
      >
        {isLoading ? (
          <Spinner size={iconSize} />
        ) : (
          LeftIcon && <LeftIcon size={iconSize} />
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && RightIcon && <RightIcon size={iconSize} />}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
