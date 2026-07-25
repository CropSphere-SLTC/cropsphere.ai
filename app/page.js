import Link from 'next/link';
import { getContent, getFeatures, getPosts } from '@/lib/data';

export const revalidate = 60;

export default async function HomePage() {
  const [hero, features, posts] = await Promise.all([
    getContent('hero'),
    getFeatures(),
    getPosts(),
  ]);
  const latest = posts.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-leaf-50 to-cream">
        <div className="container-site py-20 sm:py-28 text-center">
          <span className="inline-block bg-leaf-100 text-leaf-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🇱🇰 Built for Sri Lankan Farmers
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-leaf-900 leading-tight max-w-3xl mx-auto">
            {hero.title}
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a href={hero.cta_link || '#'} className="btn-primary">{hero.cta}</a>
            <Link href="/how-it-works" className="btn-secondary">How It Works</Link>
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="container-site py-16">
        <h2 className="section-title text-center">What AgriBot Can Do</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="card text-center hover:shadow-md transition-shadow">
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-3 font-bold text-leaf-800">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest news */}
      <section className="bg-leaf-50">
        <div className="container-site py-16">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Latest News</h2>
            <Link href="/news" className="text-leaf-600 font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <Link key={p.id} href={`/news/${p.slug}`} className="card hover:shadow-md transition-shadow">
                {p.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_url} alt="" className="rounded-xl h-40 w-full object-cover mb-4" />
                ) : (
                  <div className="rounded-xl h-40 w-full bg-leaf-100 flex items-center justify-center text-4xl mb-4">🌾</div>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="mt-1 font-bold text-leaf-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-site py-16 text-center">
        <div className="card bg-leaf-700 border-none py-12">
          <h2 className="text-3xl font-bold text-white">Ready to grow smarter?</h2>
          <p className="mt-3 text-leaf-100 max-w-xl mx-auto">
            Join farmers across Sri Lanka using AgriBot to plan better and earn more.
          </p>
          <a href={hero.cta_link || '#'} className="btn-secondary mt-6">{hero.cta}</a>
        </div>
      </section>
    </>
  );
}
