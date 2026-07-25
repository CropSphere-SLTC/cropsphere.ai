import BrandLoader from '@/components/brand/BrandLoader';
import { SkeletonRegion, ArticleSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <article className="container-site py-16 max-w-3xl">
      <SkeletonRegion label="Loading article">
        <ArticleSkeleton />
      </SkeletonRegion>

      <div className="loader-fallback hidden justify-center py-20">
        <BrandLoader size={80} label="Loading article…" />
      </div>
    </article>
  );
}
