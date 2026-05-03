import type { Metadata } from 'next';
import '../styles/globals.css';
import AuthHydrator from '@/components/AuthHydrator';

export const metadata: Metadata = {
  title: 'LMS Platform',
  description: 'Learning Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
