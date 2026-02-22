import { CREATE_SKILL_TEST_GROUPS } from '../../model/__tests__/createSkillTestData';
import {
  mockRefetchBaseData,
  mockUpdateProfile,
  mockUseAuth,
  mockUseFiltersBaseData,
  setupCreatePageDefaultMocks,
  setupCreatePageGuestMocks
} from './createPageTestMocks';

describe('createPageTestMocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('setupCreatePageDefaultMocks configures base mocks', async () => {
    setupCreatePageDefaultMocks();

    const authState = mockUseAuth();
    const filtersState = mockUseFiltersBaseData();

    expect(authState.user).not.toBeNull();
    expect(authState.updateProfile).toBe(mockUpdateProfile);

    expect(filtersState.skillGroups).toEqual(CREATE_SKILL_TEST_GROUPS);
    expect(filtersState.isLoading).toBe(false);
    expect(filtersState.error).toBeNull();
    expect(filtersState.refetch).toBe(mockRefetchBaseData);

    const payload = {} as Parameters<typeof mockUpdateProfile>[0];
    await expect(mockUpdateProfile(payload)).resolves.toBeUndefined();
    await expect(mockRefetchBaseData()).resolves.toBeUndefined();
  });

  it('setupCreatePageGuestMocks sets guest auth state', () => {
    setupCreatePageGuestMocks();

    const authState = mockUseAuth();

    expect(authState.user).toBeNull();
    expect(authState.updateProfile).toBe(mockUpdateProfile);
  });
});
