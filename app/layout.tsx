import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/puo/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PuoAI – Setswana Translation & Learning Assistant',
  description: 'Learn and translate Setswana with an AI tutor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
