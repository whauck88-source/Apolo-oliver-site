import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apolo Oliver | Tribal House',
  description: 'DJ & Producer — Tribal House. Booking, releases e loja digital.',
  openGraph: {
    title: 'Apolo Oliver | Tribal House',
    description: 'DJ & Producer — Tribal House',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-body antialiased bg-midnight text-cream min-h-screen">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
