import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/context';
import { I18nProvider } from '@/lib/i18n/context';
import { CartProvider } from '@/lib/cart/context';
import { AuthProvider } from '@/lib/auth/context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wings — Premium Online Doʻkon | Akustika, Poyabzal va Zamonaviy Uslub',
  description: 'Wings — Yuqori sifatli audio texnologiyalar, aniq muhandislik soatlari, minimalist poyabzallar va shahar kiyimlari. Butun Oʻzbekiston boʻylab tezkor yetkazib berish.',
  keywords: ['Wings', 'onlayn doʻkon', 'audio', 'headphones', 'soatlar', 'poyabzal', 'Toshkent', 'Oʻzbekiston'],
  authors: [{ name: 'Wings Official' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'))
  ),
  openGraph: {
    title: 'Wings — Elevate Your Style. Precision & Elegance.',
    description: 'Bespoke engineering, technical streetwear and sovereign audio. Fast shipping across Uzbekistan.',
    url: '/',
    siteName: 'Wings',
    locale: 'uz_UZ',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('wings_theme');
                  var isDark = saved === 'light' ? false : true;
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.setAttribute('data-theme', 'dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.add('light');
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-rose-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <CartProvider>
                <Header />
                <main className="flex-1 flex flex-col w-full">
                  {children}
                </main>
                <CartDrawer />
                <Footer />
              </CartProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
