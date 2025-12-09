import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { RegistrationProvider, useRegistrationDraft } from './RegistrationContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RegistrationProvider>{children}</RegistrationProvider>
);

describe('RegistrationContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persists step two data to sessionStorage and clears', () => {
    const { result } = renderHook(() => useRegistrationDraft(), { wrapper });

    act(() => {
      result.current.setStepTwo({
        name: 'Test User',
        birthDate: '2000-01-01',
        gender: 'male' as never,
        cityId: 1,
        categoryId: 2,
        subskillId: 3,
        avatarUrl: 'data://avatar',
      });
    });

    expect(sessionStorage.getItem('registration:step2')).toContain('"name":"Test User"');

    act(() => {
      result.current.clear();
    });

    expect(sessionStorage.getItem('registration:step2')).toBeNull();
    expect(result.current.credentials).toBeNull();
    expect(result.current.stepTwo).toBeNull();
  });

  it('stores credentials in state only (no storage)', () => {
    const { result } = renderHook(() => useRegistrationDraft(), { wrapper });

    act(() => {
      result.current.setCredentials({ email: 'user@example.com', password: 'secret' });
    });

    expect(result.current.credentials).toEqual({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(sessionStorage.getItem('registration:step2')).toBeNull();
  });
});
