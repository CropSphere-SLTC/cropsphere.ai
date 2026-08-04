import { getTeam } from '@/lib/data';
import { safeImageUrl } from '@/lib/safeUrl';
import Reveal from '@/components/motion/Reveal';

export const revalidate = 60;
export const metadata = { title: 'Our Team — Cropsphere.ai' };

// Shared by both blocks below — supervisors and students carry the same shape,
// so they get the same card and the same 👤 fallback avatar.
function PersonCard({ person }) {
  // Sanitised before the ternary so a rejected URL shows the 👤 fallback.
  const photo = safeImageUrl(person.photo_url);
  return (
    <div className="card-static h-full text-center">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={person.name}
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
      <h3 className="mt-4 font-bold text-leaf-900">{person.name}</h3>
      <p className="text-sm text-leaf-600 font-medium">{person.role}</p>
      {person.bio && <p className="mt-2 text-sm text-gray-600">{person.bio}</p>}
    </div>
  );
}

export default async function TeamPage() {
  const all = await getTeam();
  // Rows saved before the `category` column existed read as undefined, which
  // lands them in the students grid — the safe default.
  const members = all.filter((m) => m.category !== 'supervisor');
  const supervisors = all.filter((m) => m.category === 'supervisor');

  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Our Team</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        Meet the team behind CropSphere. Three final-year students at SLTC
        building AI tools to help Sri Lankan farmers grow smarter.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {members.map((m, i) => (
          <Reveal key={m.id ?? i} delay={Math.min(i, 5) * 80} className="h-full">
            <PersonCard person={m} />
          </Reveal>
        ))}
      </div>

      {supervisors.length > 0 && (
        <>
          <h2 className="mt-20 text-2xl sm:text-3xl font-bold text-leaf-900 text-center">
            Project Supervisors
          </h2>
          <p className="mt-3 text-center text-gray-600 max-w-2xl mx-auto">
            The lecturers who supervised and supported us throughout 
            the CropSphere project.
          </p>
          {/* Centred flex rather than a grid: there are usually only one or two
              supervisors, and a grid would strand a lone card on the left. */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {supervisors.map((s, i) => (
              <Reveal
                key={s.id ?? i}
                delay={Math.min(i, 5) * 80}
                className="w-full sm:w-72"
              >
                <PersonCard person={s} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
