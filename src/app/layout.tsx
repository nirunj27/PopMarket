import type { Metadata } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, Geist } from 'next/font/google';
import { Providers } from '@/components/providers';
import { SkipLink } from '@/components/layout/skip-link';
import './globals.css';
import { cn } from '@/lib/utils';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'PopMarket OS — Food Truck Market Organizer',
    template: '%s | PopMarket OS',
  },
  description:
    'Organize food truck markets with vendor applications, stall maps, visitor RSVPs, and payment tracking.',
  keywords: ['food truck', 'market organizer', 'vendor management', 'pop-up market'],
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('light', jakarta.variable, 'font-sans', geist.variable)}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Script id="theme-lock" strategy="beforeInteractive">
          {`(function(){try{var r=document.documentElement;r.classList.remove('dark');r.classList.add('light');localStorage.setItem('theme','light');}catch(e){}})();`}
        </Script>
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
