import { getContent } from '@/lib/data';
import Reveal from '@/components/motion/Reveal';

export const revalidate = 60;
export const metadata = { title: 'About — Cropsphere.ai' };

export default async function AboutPage() {
  const about = await getContent('about');

  return (
    <section className="container-site py-16 max-w-3xl">
      <h1 className="section-title">{about.title}</h1>
      <div className="mt-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
        {about.body}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Reveal className="h-full">
          <div className="card-static h-full">
            <h3 className="font-bold text-leaf-800">
              <span aria-hidden="true">🎯</span> Our Mission
            </h3>
            <p className="mt-2 text-gray-600 text-sm">
              Help every Sri Lankan farmer grow the right crops, at the right time, 
              and sell at the best price. It doesn't matter where you live or 
              what you know. CropSphere puts expert farming knowledge in your hands.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100} className="h-full">
          <div className="card-static h-full">
            <h3 className="font-bold text-leaf-800">
              <span aria-hidden="true">🌏</span> Our Vision
            </h3>
            <p className="mt-2 text-gray-600 text-sm">
              We see a Sri Lanka where every farmer has access to the same crop data, 
              weather forecasts, and market information that large farms use. 
              And it should be completely free for everyone.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
