import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RouteProgress from '@/components/motion/RouteProgress';
import Splash from '@/components/motion/Splash';
import { getMotionSettings } from '@/lib/data';

export const revalidate = 60;

const description =
  'Cropsphere.ai is an AI chatbot helping Sri Lankan farmers plan crops, estimate earnings, and make smarter farming decisions.';

export const metadata = {
  title: 'Cropsphere.ai — AI Farming Assistant for Sri Lanka',
  description,
  // The favicon comes from app/icon.svg and app/apple-icon.png via the App
  // Router file conventions — the same artwork as the loader.
  openGraph: {
    title: 'Cropsphere.ai — AI Farming Assistant for Sri Lanka',
    description,
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
};

// Runs synchronously before anything below it is parsed or painted.
//  - `js` activates the scroll-reveal hiding rule, so content is never hidden
//    for crawlers or visitors without JavaScript.
//  - `data-splash-seen` suppresses the splash on repeat visits within the
//    session before it can flash.
const BOOT_SCRIPT = `document.documentElement.classList.add('js');
try{if(sessionStorage.getItem('ab:splash')){document.documentElement.dataset.splashSeen='1'}else{sessionStorage.setItem('ab:splash','1')}}catch(e){}`;

export default async function RootLayout({ children }) {
  // Which loading/motion features are switched on, from the admin portal.
  const motion = await getMotionSettings();

  return (
    <html
      lang="en"
      data-reveal={motion.reveal ? 'on' : 'off'}
      data-skeletons={motion.skeletons ? 'on' : 'off'}
      data-spinners={motion.spinners ? 'on' : 'off'}
    >
      <body className="min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />

        {/* Seven nav links repeat on every page (WCAG 2.4.1). */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {motion.progress && <RouteProgress />}
        {motion.splash && <Splash />}

        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
