import BrandMark from './BrandMark';

/**
 * The full branded wait indicator: the sprout grows, then breathes.
 *
 * Not a client component — it renders as plain markup so it can be used
 * directly inside `loading.js` server components without shipping any JS.
 *
 * Below ~56px the seven seeds and two leaves collapse into a smudge; use
 * <Spinner /> for anything smaller.
 */
export default function BrandLoader({
  size = 88,
  label = 'Loading…',
  showLabel = true,
  className = '',
}) {
  return (
    <div
      role="status"
      data-motion="status"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <BrandMark size={size} variant="loop" />
      {showLabel ? (
        <p className="text-sm font-medium text-leaf-700">{label}</p>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
