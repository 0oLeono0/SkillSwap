import * as barrel from './index';
import { createPageHarness } from './createPageTestHarness';
import {
  createPageActions,
  createPageAssertions,
  createPageQueries
} from './createPageTestHelpers';
import {
  createDeferred,
  mockNavigate,
  mockRefetchBaseData,
  mockUpdateProfile,
  mockUseAuth,
  mockUseFiltersBaseData,
  setupCreatePageDefaultMocks,
  setupCreatePageGuestMocks
} from './createPageTestMocks';
import type {
  ShortcutModifier,
  ShortcutTarget,
  UserEventInstance
} from './index';

describe('createPage test utils barrel', () => {
  it('re-exports runtime members', () => {
    expect(barrel.createPageHarness).toBe(createPageHarness);
    expect(barrel.createPageQueries).toBe(createPageQueries);
    expect(barrel.createPageActions).toBe(createPageActions);
    expect(barrel.createPageAssertions).toBe(createPageAssertions);

    expect(barrel.createDeferred).toBe(createDeferred);
    expect(barrel.mockNavigate).toBe(mockNavigate);
    expect(barrel.mockUpdateProfile).toBe(mockUpdateProfile);
    expect(barrel.mockUseAuth).toBe(mockUseAuth);
    expect(barrel.mockRefetchBaseData).toBe(mockRefetchBaseData);
    expect(barrel.mockUseFiltersBaseData).toBe(mockUseFiltersBaseData);
    expect(barrel.setupCreatePageDefaultMocks).toBe(
      setupCreatePageDefaultMocks
    );
    expect(barrel.setupCreatePageGuestMocks).toBe(setupCreatePageGuestMocks);
  });

  it('exposes shared types via barrel', () => {
    const modifier: ShortcutModifier = 'ctrl';
    const target: ShortcutTarget = 'tags';
    const identity = (value: UserEventInstance | null) => value;

    expect(modifier).toBe('ctrl');
    expect(target).toBe('tags');
    expect(identity(null)).toBeNull();
  });
});
