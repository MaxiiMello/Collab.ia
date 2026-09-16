import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Collab.ia — Voluntariado Inteligente Rivera / Livramento',
  description:
    'Plataforma de voluntariado con IA que conecta organizaciones con voluntarios en la frontera Uruguay-Brasil. Rivera, Uruguay · Santana do Livramento, Brasil.',
  keywords: ['voluntariado', 'Rivera', 'Livramento', 'IA', 'matching', 'Uruguay', 'Brasil'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Collab.ia',
    description: 'Conectando voluntarios y organizaciones con Inteligencia Artificial',
    locale: 'es_UY',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
