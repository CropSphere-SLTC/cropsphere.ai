import Link from 'next/link';
import { getPosts } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'News — AgriBot' };

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">News & Newsletters</h1>
      <p className="mt-4 text-center text-gray-600">
        Updates from the AgriBot project.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/news/${p.slug}`} className="card hover:shadow-md transition-shadow">
            {p.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.cover_url} alt="" className="rounded-xl h-44 w-full object-cover mb-4" />
            ) : (
              <div className="rounded-xl h-44 w-full bg-leaf-100 flex items-center justify-center text-5xl mb-4">🌾</div>
            )}
            <p className="text-xs text-gray-400">
              {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h2 className="mt-1 font-bold text-leaf-900 text-lg">{p.title}</h2>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
