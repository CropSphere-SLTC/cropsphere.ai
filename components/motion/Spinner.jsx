/**
 * Inline wait indicator for buttons and form controls.
 *
 * Sized in `em` so it always matches the surrounding font-size — the button
 * never changes width when its label swaps to include a spinner.
 *
 * `btn-spinner` lets the admin hide it site-wide (see globals.css); the text
 * label always remains, so status is never lost when spinners are switched off.
 */
export default function Spinner({ className = '', label }) {
  return (
    <span
      data-motion="status"
      className={`btn-spinner inline-flex shrink-0 items-center ${className}`}
    >
      <svg
        className="h-[1em] w-[1em] animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
          opacity=".25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
