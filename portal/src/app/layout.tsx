import type { Metadata, Viewport } from 'next';
import { Backdrop } from '@/components/layout/Backdrop';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI.Next Portal',
  description:
    'Centralized management platform to track, support and scale AI initiatives across the organisation.',
};

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Backdrop />
        {children}
      </body>
    </html>
  );
}
