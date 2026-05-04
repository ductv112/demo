import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {AuthProvider} from '@/contexts/auth-context';
import {Toaster} from '@/components/ui/sonner';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trợ lý Thông minh - Doanh nghiệp A',
  description: 'Hệ thống Trợ lý Thông minh - Doanh nghiệp A',
  other: {
    'color-scheme': 'light',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
