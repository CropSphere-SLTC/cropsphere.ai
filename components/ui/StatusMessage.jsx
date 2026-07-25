/** Errors interrupt: role="alert" is announced immediately. */
export function ErrorMessage({ children, className = '' }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={`animate-fade-up flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${className}`}
    >
      <span aria-hidden="true">⚠️</span>
      <span>{children}</span>
    </p>
  );
}

/**
 * Progress and success messages: polite, so they wait for a pause.
 *
 * Stays MOUNTED with a non-breaking space when there is nothing to say. A
 * role="status" node that appears at the same moment as its text is frequently
 * not announced at all — the live region has to exist before the text lands.
 */
export function StatusMessage({ children, className = '' }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-sm text-leaf-700 ${children ? 'animate-fade-in' : ''} ${className}`}
    >
      {children || ' '}
    </p>
  );
}
