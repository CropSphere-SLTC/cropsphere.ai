import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/data';

export const revalidate = 60;

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="container-site py-16 max-w-3xl">
      <Link href="/news" className="text-leaf-600 font-medium hover:underline">
        ← Back to News
      </Link>
      <p className="mt-6 text-sm text-gray-400">
        {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-leaf-900">{post.title}</h1>
      {post.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_url} alt="" className="mt-6 rounded-2xl w-full object-cover max-h-96" />
      )}
      <div className="mt-8 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </article>
  );
}
