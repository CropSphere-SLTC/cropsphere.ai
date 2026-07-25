import { getSteps } from '@/lib/data';
import Reveal from '@/components/motion/Reveal';

export const revalidate = 60;
export const metadata = { title: 'How It Works — AgriBot' };

export default async function HowItWorksPage() {
  const steps = await getSteps();

  return (
    <section className="container-site py-16 max-w-3xl">
      <h1 className="section-title text-center">How It Works</h1>
      <p className="mt-4 text-center text-gray-600">
        From question to answer in seconds.
      </p>
      <ol className="mt-12">
        {steps.map((s, i) => (
          <Reveal
            as="li"
            key={i}
            delay={Math.min(i, 5) * 120}
            className="relative flex gap-5 items-start pb-8 last:pb-0"
          >
            {/* Connector between consecutive steps — draws top to bottom. */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="step-connector absolute left-6 top-12 bottom-0 w-0.5 -translate-x-1/2 bg-leaf-200"
              />
            )}
            <span className="relative shrink-0 w-12 h-12 rounded-full bg-leaf-600 text-white font-bold text-lg flex items-center justify-center">
              {i + 1}
            </span>
            <div className="card flex-1">
              <h3 className="font-bold text-leaf-800 text-lg">{s.title}</h3>
              <p className="mt-1 text-gray-600">{s.description}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
