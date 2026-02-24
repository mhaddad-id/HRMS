import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'HRMS - Human Resources Management System',
  description: 'Production-ready HRMS for SMEs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable + ' font-sans antialiased min-h-screen'}>
        <ThemeProvider defaultTheme="system" storageKey="hrms-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
