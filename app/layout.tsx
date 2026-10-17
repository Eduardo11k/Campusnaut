import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Campusnaut — Eventos universitários escolhidos para ti',
  description:
    'Agente de recomendação de eventos de campus. Diz os teus interesses e horários livres e descobre o que não podes perder.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream-100 font-body text-ink antialiased">
        <Header />
        <main className="pb-24 md:pb-0">
          <div className="mx-auto max-w-7xl px-5 md:px-6">{children}</div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
