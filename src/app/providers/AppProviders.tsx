import type { PropsWithChildren } from 'react';
import { AuthProvider } from './auth';
import { FavoritesProvider } from './favorites';
import { ThemeProvider } from './theme';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <AuthProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </AuthProvider>
  </ThemeProvider>
);
