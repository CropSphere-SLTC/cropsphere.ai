import BrandLoader from '@/components/brand/BrandLoader';
import { SkeletonRegion, TeamCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Our Team</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        The students behind Cropsphere.ai — TCC Group.
      </p>

      <SkeletonRegion
        label="Loading team members"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </SkeletonRegion>

      <div className="loader-fallback mt-12 hidden justify-center">
        <BrandLoader size={80} label="Loading team…" />
      </div>
    </section>
  );
}
