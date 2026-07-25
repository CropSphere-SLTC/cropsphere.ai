import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'AgriBot — AI Farming Assistant for Sri Lanka',
  description:
    'AgriBot is an AI chatbot helping Sri Lankan farmers plan crops, estimate earnings, and make smarter farming decisions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
