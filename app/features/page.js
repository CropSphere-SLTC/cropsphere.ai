import { getFeatures } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'Features — AgriBot' };

export default async function FeaturesPage() {
  const features = await getFeatures();

  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Features</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        Everything AgriBot offers to help you farm smarter.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((f, i) => (
          <div key={i} className="card flex gap-5 items-start hover:shadow-md transition-shadow">
            <div className="text-4xl shrink-0">{f.icon}</div>
            <div>
              <h3 className="font-bold text-leaf-800 text-lg">{f.title}</h3>
              <p className="mt-2 text-gray-600">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
