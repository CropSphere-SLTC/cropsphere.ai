import Link from 'next/link';
import BrandMark from '@/components/brand/BrandMark';

export const metadata = { title: 'Page not found — AgriBot' };

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <BrandMark size={104} variant="grow" />
      <h1 className="section-title mt-6">This field is empty</h1>
      <p className="mt-3 max-w-md text-gray-600">
        We could not find that page. It may have been moved or unpublished.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/news" className="btn-secondary">Read the news</Link>
      </div>
    </section>
  );
}
