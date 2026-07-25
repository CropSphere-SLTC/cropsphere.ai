import BrandLoader from '@/components/brand/BrandLoader';

// Fallback Suspense boundary for any route segment without its own loading.js.
// Navbar and Footer live in the layout, so they stay mounted — the loader
// appears inside a stable frame rather than replacing the whole screen.
export default function Loading() {
  return (
    <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
      <BrandLoader size={96} label="Growing your page…" />
    </div>
  );
}
