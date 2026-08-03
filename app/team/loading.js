import BrandLoader from '@/components/brand/BrandLoader';
import { SkeletonRegion, TeamCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Our Team</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        Meet the team behind CropSphere. Three final-year students at SLTC
        building AI tools to help Sri Lankan farmers grow smarter.
      </p>

      <SkeletonRegion
        label="Loading team members"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </SkeletonRegion>

      <h2 className="mt-20 text-2xl sm:text-3xl font-bold text-leaf-900 text-center">
        Project Supervisors
      </h2>
      <p className="mt-3 text-center text-gray-600 max-w-2xl mx-auto">
        Our thanks to the supervisors who guided the CropSphere project and this
        website from first idea to final build.
      </p>

      <SkeletonRegion
        label="Loading supervisors"
        className="mt-10 flex flex-wrap justify-center gap-6"
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="w-full sm:w-72">
            <TeamCardSkeleton />
          </div>
        ))}
      </SkeletonRegion>

      <div className="loader-fallback mt-12 hidden justify-center">
        <BrandLoader size={80} label="Loading team…" />
      </div>
    </section>
  );
}
