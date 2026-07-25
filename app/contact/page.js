import { getContent } from '@/lib/data';
import Reveal from '@/components/motion/Reveal';

export const revalidate = 60;
export const metadata = { title: 'Contact — AgriBot' };

export default async function ContactPage() {
  const contact = await getContent('contact');

  return (
    <section className="container-site py-16 max-w-2xl">
      <h1 className="section-title text-center">Contact Us</h1>
      <p className="mt-4 text-center text-gray-600">
        Questions or feedback about AgriBot? We would love to hear from you.
      </p>
      <div className="mt-10 grid gap-5">
        <Reveal>
          <div className="card-static flex items-center gap-4">
            <span className="text-3xl" aria-hidden="true">📧</span>
            <div>
              <p className="font-semibold text-leaf-800">Email</p>
              <a href={`mailto:${contact.email}`} className="link-underline text-leaf-600">
                {contact.email}
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="card flex items-center gap-4">
            <span className="text-3xl" aria-hidden="true">📞</span>
            <div>
              <p className="font-semibold text-leaf-800">Phone</p>
              <p className="text-gray-600">{contact.phone}</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="card flex items-center gap-4">
            <span className="text-3xl" aria-hidden="true">📍</span>
            <div>
              <p className="font-semibold text-leaf-800">Location</p>
              <p className="text-gray-600">{contact.address}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
