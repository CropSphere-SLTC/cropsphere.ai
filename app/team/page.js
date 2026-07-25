import { getTeam } from '@/lib/data';
import Reveal from '@/components/motion/Reveal';

export const revalidate = 60;
export const metadata = { title: 'Our Team — AgriBot' };

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Our Team</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        The students behind AgriBot — TCC Group.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {team.map((m, i) => (
          <Reveal key={m.id ?? i} delay={Math.min(i, 5) * 80} className="h-full">
            <div className="card-static h-full text-center">
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full bg-leaf-100 text-4xl flex items-center justify-center mx-auto"
                  aria-hidden="true"
                >
                  👤
                </div>
              )}
              <h3 className="mt-4 font-bold text-leaf-900">{m.name}</h3>
              <p className="text-sm text-leaf-600 font-medium">{m.role}</p>
              {m.bio && <p className="mt-2 text-sm text-gray-600">{m.bio}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
