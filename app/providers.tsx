'use client';

import { ReactNode, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            {mounted && children}
            <Toaster richColors position="top-right" />
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
