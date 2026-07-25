/**
 * Placeholder shapes transcribed from the real card markup, so content lands
 * exactly where the eye already parked and the swap causes no layout shift.
 *
 * Every group is wrapped in <SkeletonRegion>, which pairs the visual
 * placeholder with a screen-reader status message (WCAG 4.1.3), and carries
 * the `skeleton-block` class the admin toggle uses to switch skeletons off.
 */

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonRegion({ label, className = '', children }) {
  return (
    <div
      role="status"
      aria-busy="true"
      data-motion="status"
      className={`skeleton-block ${className}`}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/* Matches the news cards in app/news/page.js and app/page.js */
export function PostCardSkeleton({ compact = false }) {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton className={`${compact ? 'h-40' : 'h-44'} w-full rounded-xl mb-4`} />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-5 w-4/5" />
      <Skeleton className="mt-3 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-2/3" />
    </div>
  );
}

/* Matches app/team/page.js */
export function TeamCardSkeleton() {
  return (
    <div className="card text-center" aria-hidden="true">
      <Skeleton className="mx-auto h-24 w-24 rounded-full" />
      <Skeleton className="mx-auto mt-4 h-5 w-32" />
      <Skeleton className="mx-auto mt-2 h-4 w-24" />
      <Skeleton className="mt-3 h-3.5 w-full" />
      <Skeleton className="mx-auto mt-2 h-3.5 w-5/6" />
    </div>
  );
}

/* Matches app/features/page.js */
export function FeatureCardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="mt-4 h-5 w-40" />
      <Skeleton className="mt-3 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-11/12" />
    </div>
  );
}

/* Matches app/news/[slug]/page.js */
export function ArticleSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-6 h-3 w-32" />
      <Skeleton className="mt-3 h-9 w-11/12" />
      <Skeleton className="mt-2 h-9 w-3/5" />
      <Skeleton className="mt-6 h-72 w-full rounded-2xl" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

/* Matches the stat cards in app/admin/page.js */
export function StatCardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="mt-2 h-9 w-16" />
      <Skeleton className="mt-2 h-4 w-28" />
    </div>
  );
}

/* Matches the list rows in app/admin/posts and app/admin/team */
export function AdminRowSkeleton({ avatar = false }) {
  return (
    <div className="card flex items-center gap-4" aria-hidden="true">
      {avatar && <Skeleton className="h-12 w-12 shrink-0 rounded-full" />}
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="mt-2 h-3 w-36" />
      </div>
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}
