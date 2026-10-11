import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ADK Hotel OS — Enterprise Workstation',
  description: 'Enterprise Hospitality Management System for Front Desk, POS, KDS, Housekeeping, and Cashier Operations',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#f5f6f8] text-[#252c35] antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
