import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import AuthLayout from './AuthLayout';

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid='location'>
      {`${location.pathname}${location.search}${location.hash}`}
    </div>
  );
};

const renderLayout = (
  initialEntry: string | { pathname: string; state?: unknown }
) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<AuthLayout />}>
          <Route index element={<div>Auth content</div>} />
        </Route>
        <Route path={ROUTES.CATALOG} element={<div>Catalog page</div>} />
        <Route path={ROUTES.HOME} element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('AuthLayout', () => {
  it('closes to redirect state path when it exists', async () => {
    const user = userEvent.setup();
    renderLayout({
      pathname: ROUTES.LOGIN,
      state: {
        from: {
          pathname: ROUTES.CATALOG,
          search: '?search=react',
          hash: '#top'
        }
      }
    });

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Catalog page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/catalog?search=react#top'
    );
  });

  it('closes to home when redirect state is missing', async () => {
    const user = userEvent.setup();
    renderLayout(ROUTES.LOGIN);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(ROUTES.HOME);
  });
});
