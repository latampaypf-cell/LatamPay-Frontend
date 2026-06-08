import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";

export type CardTone = "surface" | "highlight";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "md" | "lg" | "xl";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
  padding?: CardPadding;
  radius?: CardRadius;
  interactive?: boolean;
  as?: "div" | "article" | "section";
  children?: ReactNode;
};

const TONE_CLASSES: Record<CardTone, string> = {
  surface: "border border-white/10 bg-white/5",
  highlight:
    "border border-cyan-500/20 bg-white/5 shadow-[0_0_50px_rgba(6,182,212,0.15)]",
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const RADIUS_CLASSES: Record<CardRadius, string> = {
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
};

const INTERACTIVE =
  "transition-all hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]";

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      tone = "surface",
      padding = "md",
      radius = "lg",
      interactive = false,
      as: Tag = "div",
      className = "",
      children,
      ...rest
    },
    ref,
  ) => (
    <Tag
      ref={ref as never}
      className={`${RADIUS_CLASSES[radius]} ${TONE_CLASSES[tone]} ${
        PADDING_CLASSES[padding]
      } backdrop-blur-xl ${interactive ? INTERACTIVE : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  ),
);

Card.displayName = "Card";

export default Card;
