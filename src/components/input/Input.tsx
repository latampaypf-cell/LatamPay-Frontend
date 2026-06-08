import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  rightSlot?: ReactNode;
  togglePassword?: boolean;
  wrapperClassName?: string;
};

const INPUT_BASE =
  "w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightSlot,
      togglePassword = false,
      wrapperClassName = "",
      className = "",
      type = "text",
      id,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const effectiveType =
      isPassword && togglePassword && showPassword ? "text" : type;

    const borderClass = error
      ? "border-red-500/50 focus:border-red-500/60"
      : "border-white/10";

    const paddingLeft = LeftIcon ? "pl-10" : "";
    const hasRightContent = rightSlot || (isPassword && togglePassword);
    const paddingRight = hasRightContent ? "pr-12" : "";

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <LeftIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`${INPUT_BASE} ${borderClass} ${paddingLeft} ${paddingRight} ${className}`}
            {...rest}
          />

          {isPassword && togglePassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-cyan-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : (
            rightSlot && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                {rightSlot}
              </div>
            )
          )}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-red-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
