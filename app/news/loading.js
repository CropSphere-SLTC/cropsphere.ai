import BrandLoader from '@/components/brand/BrandLoader';
import { SkeletonRegion, PostCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <section className="container-site py-16">
      {/* Identical to app/news/page.js so the heading never moves. */}
      <h1 className="section-title text-center">News &amp; Newsletters</h1>
      <p className="mt-4 text-center text-gray-600">
        Updates from the AgriBot project.
      </p>

      <SkeletonRegion
        label="Loading news articles"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </SkeletonRegion>

      {/* Shown instead of the skeletons when the admin disables placeholders. */}
      <div className="loader-fallback mt-12 hidden justify-center">
        <BrandLoader size={80} label="Loading news…" />
      </div>
    </section>
  );
}
