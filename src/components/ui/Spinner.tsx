export type SpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

export const Spinner = ({
  size = 18,
  className = "",
  label = "Cargando",
}: SpinnerProps) => (
  <svg
    role="status"
    aria-label={label}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`animate-spin ${className}`}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="3"
    />
    <path
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default Spinner;
