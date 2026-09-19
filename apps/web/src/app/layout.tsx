import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { AppProviders } from '@/components/AppProviders';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-devanagari',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CityConnect — Smart City Platform',
  description:
    'Citizen services, government schemes, civic grievances, waste & e-waste, and municipal route operations.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body className="app-body">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
