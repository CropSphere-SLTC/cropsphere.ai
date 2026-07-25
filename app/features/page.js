import { getFeatures } from '@/lib/data';
import Reveal from '@/components/motion/Reveal';

export const revalidate = 60;
export const metadata = { title: 'Features — Cropsphere.ai' };

export default async function FeaturesPage() {
  const features = await getFeatures();

  return (
    <section className="container-site py-16">
      <h1 className="section-title text-center">Features</h1>
      <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
        Everything Cropsphere.ai offers to help you farm smarter.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((f, i) => (
          <Reveal key={i} delay={Math.min(i, 5) * 80} className="h-full">
            <div className="card-static flex h-full gap-5 items-start">
              <div className="text-4xl shrink-0" aria-hidden="true">{f.icon}</div>
              <div>
                <h3 className="font-bold text-leaf-800 text-lg">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
