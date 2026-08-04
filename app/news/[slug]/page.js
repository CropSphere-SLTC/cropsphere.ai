import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/data';
import { safeImageUrl } from '@/lib/safeUrl';

export const revalidate = 60;

// The App Router's built-in route announcer reads document.title after every
// navigation. Without this, each article announces the generic site title.
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post not found — Cropsphere.ai' };
  return {
    title: `${post.title} — Cropsphere.ai`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Admin-supplied URL — anything that is not http(s) is dropped entirely.
  const cover = safeImageUrl(post.cover_url);

  return (
    // Long-form prose gets no scroll reveal — animating text as the reader
    // arrives at it fights the act of reading.
    <article className="container-site py-16 max-w-3xl">
      <Link href="/news" className="group link-underline text-leaf-600 font-medium">
        <span className="inline-block transition-transform duration-200 ease-out-expo group-hover:-translate-x-1">
          ←
        </span>{' '}
        Back to News
      </Link>
      <p className="animate-fade-up mt-6 text-sm text-gray-400">
        {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-leaf-900">{post.title}</h1>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="animate-scale-in mt-6 rounded-2xl w-full object-cover max-h-96"
        />
      )}
      <div className="mt-8 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </article>
  );
}
