import { getSteps } from '@/lib/data';

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
      <ol className="mt-12 space-y-8">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-5 items-start">
            <span className="shrink-0 w-12 h-12 rounded-full bg-leaf-600 text-white font-bold text-lg flex items-center justify-center">
              {i + 1}
            </span>
            <div className="card flex-1">
              <h3 className="font-bold text-leaf-800 text-lg">{s.title}</h3>
              <p className="mt-1 text-gray-600">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
