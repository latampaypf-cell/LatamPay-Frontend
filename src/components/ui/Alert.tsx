import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

const VARIANTS: Record<
  AlertVariant,
  { container: string; icon: string; defaultIcon: LucideIcon }
> = {
  info: {
    container: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
    icon: "text-cyan-400",
    defaultIcon: Info,
  },
  success: {
    container: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    icon: "text-emerald-400",
    defaultIcon: CheckCircle2,
  },
  warning: {
    container: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    icon: "text-amber-400",
    defaultIcon: AlertTriangle,
  },
  error: {
    container: "border-red-500/30 bg-red-500/10 text-red-100",
    icon: "text-red-400",
    defaultIcon: XCircle,
  },
};

export const Alert = ({
  variant = "info",
  title,
  children,
  icon,
  className = "",
}: AlertProps) => {
  const v = VARIANTS[variant];
  const Icon = icon ?? v.defaultIcon;

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl ${v.container} ${className}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${v.icon}`} />
      <div className="text-sm">
        {title && <p className="font-medium text-white">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
    </div>
  );
};

export default Alert;
