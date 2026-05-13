import { RouterProvider } from 'react-router-dom';
import { AppProviders, router } from '@/app/providers';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);
