import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/index.css';
import { router } from '@/app/providers/routes/AppRouter';
import { ThemeProvider } from '@/app/providers/theme/ThemeProvider';
import { AuthProvider } from '@/app/providers/auth/AuthProvider';
import { FavoritesProvider } from '@/app/providers/favorites/FavoritesProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
