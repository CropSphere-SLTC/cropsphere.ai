import BrandLoader from '@/components/brand/BrandLoader';
import { SkeletonRegion, FeatureCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Features</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        Everything Cropsphere.ai offers to help you farm smarter.
      </p>

      <SkeletonRegion
        label="Loading features"
        className="mt-12 grid gap-6 sm:grid-cols-2"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <FeatureCardSkeleton key={i} />
        ))}
      </SkeletonRegion>

      <div className="loader-fallback mt-12 hidden justify-center">
        <BrandLoader size={80} label="Loading features…" />
      </div>
    </section>
  );
}
