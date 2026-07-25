'use client';

import BrandMark from '@/components/brand/BrandMark';

// An error boundary must always offer a way out (Nielsen: help users recover).
export default function Error({ error, reset }) {
  return (
    <section
      role="alert"
      className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"
    >
      <BrandMark size={88} />
      <h1 className="section-title mt-6">Something went wrong</h1>
      <p className="mt-3 max-w-md text-gray-600">
        We hit a problem loading this page. Please try again.
      </p>
      <button onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && error?.message && (
        <pre className="mt-6 max-w-xl overflow-auto rounded-lg bg-red-50 p-4 text-left text-xs text-red-700">
          {error.message}
        </pre>
      )}
    </section>
  );
}
