import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

/**
 * Wrapper around `next-themes` that forces the initial theme to match the server‑rendered
 * value. Using `defaultTheme="light"` prevents a hydration mismatch where the server
 * renders `light` and the client immediately switches to the system‑detected theme.
 * You can later change this to `system` once the app is stable.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
