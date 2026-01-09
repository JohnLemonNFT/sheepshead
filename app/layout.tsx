import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sheepshead - Play the Classic Wisconsin Card Game Online',
  description: 'Learn and play Sheepshead, the beloved trick-taking card game from Wisconsin. Play against AI opponents, learn the rules, and master strategies.',
  keywords: ['Sheepshead', 'card game', 'Wisconsin', 'trick-taking', 'Schafkopf', 'online card game'],
  openGraph: {
    title: 'Sheepshead - The Classic Wisconsin Card Game',
    description: 'Learn and play Sheepshead online. Play against AI, learn rules, and master strategies.',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sheepshead',
  },
  formatDetection: {
    telephone: false,
  },
};

// Viewport configuration for native app support (notch, safe areas)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Critical for iOS safe areas
  themeColor: '#111827',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} safe-area-inset`}>{children}</body>
    </html>
  );
}
